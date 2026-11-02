import http from 'http';
import https from 'https';
import dns from 'dns';
import { URL } from 'url';

export interface ScannedCookie {
  name: string;
  provider: string;
  category: 'Necessary' | 'Analytics' | 'Marketing' | 'Preferences';
  expiry: string;
  purpose: string;
  domain?: string;
  source: 'http_header' | 'detected_script' | 'manual';
}

export interface RealScanResult {
  success: boolean;
  reachable: boolean;
  scanned_url: string;
  final_url?: string;
  status_code?: number;
  total_cookies_found: number;
  cookie_inventory: ScannedCookie[];
  scripts_detected: string[];
  headers_analyzed: boolean;
  message: string;
  error?: string;
}

// Known Cookie Dictionary for Accurate Categorization
const KNOWN_COOKIES: Record<string, { provider: string; category: ScannedCookie['category']; expiry: string; purpose: string }> = {
  // Google
  '_ga': { provider: 'Google Analytics', category: 'Analytics', expiry: '2 years', purpose: 'Distinguishes unique website visitors and counts page views' },
  '_gid': { provider: 'Google Analytics', category: 'Analytics', expiry: '24 hours', purpose: 'Identifies visitor sessions across pages' },
  '_gat': { provider: 'Google Analytics', category: 'Analytics', expiry: '1 minute', purpose: 'Throttles request rate to Google servers' },
  '_gcl_au': { provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Measures ad conversions and user attribution' },
  '_gcl_aw': { provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Attribution for Google Ads clicks' },
  
  // Meta / Facebook
  '_fbp': { provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Tracks user actions across web properties for advertising delivery' },
  'fr': { provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Delivers, measures, and improves the relevancy of Facebook ads' },
  
  // TikTok
  '_ttp': { provider: 'TikTok', category: 'Marketing', expiry: '13 months', purpose: 'Measures and improves performance of advertising campaigns on TikTok' },
  
  // Microsoft & Clarity
  '_clck': { provider: 'Microsoft Clarity', category: 'Analytics', expiry: '1 year', purpose: 'Stores a unique user ID for session replay and heatmaps' },
  '_clsk': { provider: 'Microsoft Clarity', category: 'Analytics', expiry: '1 day', purpose: 'Connects multiple page views by a user into a single Clarity session' },
  'MUID': { provider: 'Microsoft', category: 'Marketing', expiry: '1 year', purpose: 'Identifies unique web browsers visiting Microsoft sites for analytics and ads' },

  // Hotjar
  '_hjSession': { provider: 'Hotjar', category: 'Analytics', expiry: '30 minutes', purpose: 'Maintains current Hotjar session data' },
  '_hjSessionUser': { provider: 'Hotjar', category: 'Analytics', expiry: '1 year', purpose: 'Ensures data from subsequent visits are attributed to the same user' },

  // LinkedIn
  'bcookie': { provider: 'LinkedIn', category: 'Marketing', expiry: '1 year', purpose: 'Browser identification for LinkedIn analytics and conversion tracking' },
  'li_sugr': { provider: 'LinkedIn', category: 'Marketing', expiry: '90 days', purpose: 'Probabilistic match of user identity outside the Designated Countries' },

  // Security & Infrastructure
  '__cf_bm': { provider: 'Cloudflare', category: 'Necessary', expiry: '30 minutes', purpose: 'Bot management and protection against malicious traffic' },
  'cf_clearance': { provider: 'Cloudflare', category: 'Necessary', expiry: '1 year', purpose: 'Stores proof of challenge completion to allow clean traffic' },
  'datadome': { provider: 'DataDome', category: 'Necessary', expiry: '1 year', purpose: 'Protects website against automated bot attacks and scrapers' },
  'AWSALB': { provider: 'Amazon Web Services', category: 'Necessary', expiry: '7 days', purpose: 'Load balancer session affinity to route requests to the same server' },
  'AWSALBCORS': { provider: 'Amazon Web Services', category: 'Necessary', expiry: '7 days', purpose: 'CORS load balancer session sticky routing' },

  // Payments
  '__stripe_mid': { provider: 'Stripe', category: 'Necessary', expiry: '1 year', purpose: 'Fraud detection and secure payment processing' },
  '__stripe_sid': { provider: 'Stripe', category: 'Necessary', expiry: '30 minutes', purpose: 'Maintains payment session security during checkout' },

  // CMP / Consent
  'pl_consent': { provider: 'Paperloo', category: 'Necessary', expiry: '12 months', purpose: 'Remembers visitor cookie consent choices' },
  'OptanonConsent': { provider: 'OneTrust', category: 'Necessary', expiry: '12 months', purpose: 'Stores cookie consent preferences' },
  'CookieConsent': { provider: 'Cookiebot', category: 'Necessary', expiry: '12 months', purpose: 'Stores visitor consent state for the current domain' }
};

// Script signatures to detect running client-side trackers
const SCRIPT_TRACKERS: Array<{
  name: string;
  pattern: RegExp;
  cookies: Array<{ name: string; provider: string; category: ScannedCookie['category']; expiry: string; purpose: string }>;
}> = [
  {
    name: 'Google Analytics 4 / Tag Manager',
    pattern: /googletagmanager\.com\/(gtm\.js|gtag\/js)|google-analytics\.com\/(analytics\.js|ga\.js)/i,
    cookies: [
      { name: '_ga', provider: 'Google Analytics', category: 'Analytics', expiry: '2 years', purpose: 'Distinguishes unique website visitors and counts page views' },
      { name: '_gid', provider: 'Google Analytics', category: 'Analytics', expiry: '24 hours', purpose: 'Identifies visitor sessions across pages' }
    ]
  },
  {
    name: 'Google Ads / Conversion Tracking',
    pattern: /googleadservices\.com\/pagead|googletagservices\.com/i,
    cookies: [
      { name: '_gcl_au', provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Measures advertising conversions and user attribution' }
    ]
  },
  {
    name: 'Meta (Facebook) Pixel',
    pattern: /connect\.facebook\.net\/(en_US|en_GB)?\/fbevents\.js|facebook\.com\/tr\?/i,
    cookies: [
      { name: '_fbp', provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Tracks user actions for Facebook ads targeting and conversion measurement' }
    ]
  },
  {
    name: 'TikTok Pixel',
    pattern: /analytics\.tiktok\.com\/i18n\/pixel|ttq\.load/i,
    cookies: [
      { name: '_ttp', provider: 'TikTok', category: 'Marketing', expiry: '13 months', purpose: 'Measures performance of advertising campaigns on TikTok' }
    ]
  },
  {
    name: 'Hotjar Behavioral Analytics',
    pattern: /static\.hotjar\.com\/c\/hotjar-|_hjsettings/i,
    cookies: [
      { name: '_hjSession', provider: 'Hotjar', category: 'Analytics', expiry: '30 minutes', purpose: 'Maintains current Hotjar session data' }
    ]
  },
  {
    name: 'Microsoft Clarity',
    pattern: /clarity\.ms\/tag/i,
    cookies: [
      { name: '_clck', provider: 'Microsoft Clarity', category: 'Analytics', expiry: '1 year', purpose: 'Stores a unique user ID for session replay and heatmaps' }
    ]
  },
  {
    name: 'LinkedIn Insight Tag',
    pattern: /snap\.licdn\.com\/li\.lms-analytics|_linkedin_partner_id/i,
    cookies: [
      { name: 'bcookie', provider: 'LinkedIn', category: 'Marketing', expiry: '1 year', purpose: 'Browser identification for LinkedIn conversion tracking' }
    ]
  },
  {
    name: 'Stripe Payments',
    pattern: /js\.stripe\.com\/v3/i,
    cookies: [
      { name: '__stripe_mid', provider: 'Stripe', category: 'Necessary', expiry: '1 year', purpose: 'Fraud detection and secure payment processing' }
    ]
  },
  {
    name: 'Hubspot',
    pattern: /js\.hs-scripts\.com|track\.hubspot\.com/i,
    cookies: [
      { name: '__hstc', provider: 'HubSpot', category: 'Analytics', expiry: '6 months', purpose: 'Main tracking cookie for visit and page view analytics' }
    ]
  },
  {
    name: 'Intercom Messenger',
    pattern: /widget\.intercom\.io|js\.intercomcdn\.com/i,
    cookies: [
      { name: 'intercom-session', provider: 'Intercom', category: 'Necessary', expiry: '7 days', purpose: 'Maintains visitor chat conversations' }
    ]
  },
  {
    name: 'Cloudflare Turnstile & CDN',
    pattern: /challenges\.cloudflare\.com|cloudflareinsights\.com/i,
    cookies: [
      { name: '__cf_bm', provider: 'Cloudflare', category: 'Necessary', expiry: '30 minutes', purpose: 'Bot protection and rate limiting' }
    ]
  }
];

/**
 * Executes a REAL live HTTP crawl to detect actual cookies and tracking scripts.
 * Never invents mock cookies. If site is clean or empty, returns 0 cookies.
 */
export async function scanWebsiteRealTrackers(targetUrlInput: string): Promise<RealScanResult> {
  let cleanUrl = (targetUrlInput || '').trim();
  if (!cleanUrl) {
    return {
      success: false,
      reachable: false,
      scanned_url: '',
      total_cookies_found: 0,
      cookie_inventory: [],
      scripts_detected: [],
      headers_analyzed: false,
      message: 'No website URL provided.'
    };
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(cleanUrl);
  } catch (err) {
    return {
      success: false,
      reachable: false,
      scanned_url: cleanUrl,
      total_cookies_found: 0,
      cookie_inventory: [],
      scripts_detected: [],
      headers_analyzed: false,
      message: 'Invalid URL format.'
    };
  }

  // Pre-check DNS resolution
  try {
    await dns.promises.lookup(parsedUrl.hostname);
  } catch (dnsErr: any) {
    return {
      success: false,
      reachable: false,
      scanned_url: cleanUrl,
      total_cookies_found: 0,
      cookie_inventory: [],
      scripts_detected: [],
      headers_analyzed: false,
      message: `Could not reach ${parsedUrl.hostname}. DNS lookup failed (${dnsErr.code || 'ENOTFOUND'}).`,
      error: dnsErr.message
    };
  }

  // Perform real HTTP request
  return new Promise((resolve) => {
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.get(
      cleanUrl,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PaperlooComplianceCrawler/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 8000,
        rejectUnauthorized: false
      },
      (res) => {
        const statusCode = res.statusCode || 0;
        const setCookieHeaders = res.headers['set-cookie'] || [];
        let htmlBody = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          if (htmlBody.length < 1024 * 1024) { // 1MB max
            htmlBody += chunk;
          }
        });

        res.on('end', () => {
          const cookieMap = new Map<string, ScannedCookie>();
          const detectedScripts: string[] = [];

          // 1. Process REAL Set-Cookie headers
          for (const rawCookie of setCookieHeaders) {
            const parts = rawCookie.split(';');
            const nameVal = parts[0]?.trim();
            if (!nameVal) continue;

            const eqIdx = nameVal.indexOf('=');
            const cookieName = eqIdx !== -1 ? nameVal.substring(0, eqIdx).trim() : nameVal;
            if (!cookieName) continue;

            // Extract expiry if present
            let expiry = 'Session';
            const expiresPart = parts.find((p) => p.trim().toLowerCase().startsWith('expires='));
            const maxAgePart = parts.find((p) => p.trim().toLowerCase().startsWith('max-age='));
            if (maxAgePart) {
              const seconds = parseInt(maxAgePart.split('=')[1]?.trim() || '0', 10);
              if (seconds > 0) {
                expiry = `${Math.round(seconds / 86400)} days`;
              }
            } else if (expiresPart) {
              const dateStr = expiresPart.split('=')[1]?.trim();
              if (dateStr) {
                const expDate = new Date(dateStr);
                if (!isNaN(expDate.getTime())) {
                  const daysLeft = Math.round((expDate.getTime() - Date.now()) / (1000 * 86400));
                  expiry = daysLeft > 0 ? `${daysLeft} days` : 'Session';
                }
              }
            }

            // Look up in known cookies directory
            const known = KNOWN_COOKIES[cookieName];
            if (known) {
              cookieMap.set(cookieName, {
                name: cookieName,
                provider: known.provider,
                category: known.category,
                expiry: expiry !== 'Session' ? expiry : known.expiry,
                purpose: known.purpose,
                domain: parsedUrl.hostname,
                source: 'http_header'
              });
            } else {
              // Intelligently classify unknown real cookies from headers
              const isSession = /sess|token|auth|id|csrf|jwt/i.test(cookieName);
              const isTracking = /track|utm|ad|pixel|campaign|affiliate/i.test(cookieName);
              const category = isSession ? 'Necessary' : isTracking ? 'Marketing' : 'Analytics';

              cookieMap.set(cookieName, {
                name: cookieName,
                provider: parsedUrl.hostname,
                category,
                expiry,
                purpose: isSession
                  ? 'Maintains visitor session and application security'
                  : 'Used by the website to measure site interactions',
                domain: parsedUrl.hostname,
                source: 'http_header'
              });
            }
          }

          // 2. Process REAL scripts running in the HTML
          if (htmlBody) {
            for (const tracker of SCRIPT_TRACKERS) {
              if (tracker.pattern.test(htmlBody)) {
                detectedScripts.push(tracker.name);
                for (const cookie of tracker.cookies) {
                  if (!cookieMap.has(cookie.name)) {
                    cookieMap.set(cookie.name, {
                      ...cookie,
                      domain: parsedUrl.hostname,
                      source: 'detected_script'
                    });
                  }
                }
              }
            }
          }

          const cookies = Array.from(cookieMap.values());

          resolve({
            success: true,
            reachable: true,
            scanned_url: cleanUrl,
            status_code: statusCode,
            total_cookies_found: cookies.length,
            cookie_inventory: cookies,
            scripts_detected: detectedScripts,
            headers_analyzed: true,
            message: cookies.length > 0
              ? `Found ${cookies.length} real cookies/trackers on ${parsedUrl.hostname} (${detectedScripts.length} tracking scripts detected).`
              : `Scan complete: No cookies or third-party trackers detected on ${parsedUrl.hostname}.`
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        reachable: false,
        scanned_url: cleanUrl,
        total_cookies_found: 0,
        cookie_inventory: [],
        scripts_detected: [],
        headers_analyzed: false,
        message: `Connection to ${parsedUrl.hostname} timed out after 8 seconds.`
      });
    });

    req.on('error', (err: any) => {
      resolve({
        success: false,
        reachable: false,
        scanned_url: cleanUrl,
        total_cookies_found: 0,
        cookie_inventory: [],
        scripts_detected: [],
        headers_analyzed: false,
        message: `Could not reach ${parsedUrl.hostname}: ${err.message}`,
        error: err.message
      });
    });
  });
}
