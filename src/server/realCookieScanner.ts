import * as http from 'http';
import * as https from 'https';
import * as dns from 'dns';
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

export interface SecurityHeadersReport {
  hsts: boolean;
  csp: boolean;
  x_frame_options: string | null;
  x_content_type_options: string | null;
  strict_transport_security?: string | null;
  content_security_policy?: string | null;
}

export interface LegalLinksReport {
  privacy_policy: boolean;
  terms_of_service: boolean;
  cookie_policy: boolean;
  accessibility_statement: boolean;
  ccpa_do_not_sell: boolean;
  detected_links: Array<{ type: string; href: string; anchor_text: string }>;
}

export interface ConsentModeReport {
  cmp_detected: boolean;
  cmp_name: string | null;
  gcm_v2_detected: boolean;
  gcm_defaults?: {
    ad_storage?: string;
    analytics_storage?: string;
    ad_user_data?: string;
    ad_personalization?: string;
  };
  prior_consent_enforced: boolean;
  consent_violation_reasons: string[];
}

export interface WcagMetricsReport {
  total_images_count: number;
  missing_alt_images_count: number;
  landmarks_detected: string[];
  missing_form_labels_count: number;
  has_document_title: boolean;
  has_html_lang: boolean;
  accessibility_score: number;
  issues: string[];
}

export interface AiTransparencyReport {
  ai_chatbots_detected: string[];
  ai_synthetic_disclosure: boolean;
  ai_crawler_directives: Array<{ bot: string; status: 'allowed' | 'disallowed' | 'not_specified' }>;
  ai_act_compliance_status: 'COMPLIANT' | 'NEEDS_DISCLOSURE' | 'HIGH_RISK_REVIEW';
  issues: string[];
}

export interface RealScanResult {
  success: boolean;
  reachable: boolean;
  scanned_url: string;
  final_url?: string;
  status_code?: number;
  is_https: boolean;
  total_cookies_found: number;
  cookie_inventory: ScannedCookie[];
  scripts_detected: string[];
  headers_analyzed: boolean;
  security_headers: SecurityHeadersReport;
  legal_links: LegalLinksReport;
  consent_mode: ConsentModeReport;
  wcag_metrics: WcagMetricsReport;
  ai_transparency: AiTransparencyReport;
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

// Helper to create empty scan failure result
function createFailureResult(cleanUrl: string, message: string, error?: string): RealScanResult {
  const isHttps = cleanUrl.startsWith('https://');
  return {
    success: false,
    reachable: false,
    scanned_url: cleanUrl,
    is_https: isHttps,
    status_code: 0,
    total_cookies_found: 0,
    cookie_inventory: [],
    scripts_detected: [],
    headers_analyzed: false,
    security_headers: {
      hsts: false,
      csp: false,
      x_frame_options: null,
      x_content_type_options: null
    },
    legal_links: {
      privacy_policy: false,
      terms_of_service: false,
      cookie_policy: false,
      accessibility_statement: false,
      ccpa_do_not_sell: false,
      detected_links: []
    },
    consent_mode: {
      cmp_detected: false,
      cmp_name: null,
      gcm_v2_detected: false,
      prior_consent_enforced: false,
      consent_violation_reasons: ['Domain unreachable - cannot verify consent mode or tracking tags']
    },
    wcag_metrics: {
      total_images_count: 0,
      missing_alt_images_count: 0,
      landmarks_detected: [],
      missing_form_labels_count: 0,
      has_document_title: false,
      has_html_lang: false,
      accessibility_score: 0,
      issues: ['Website unreachable or invalid domain']
    },
    ai_transparency: {
      ai_chatbots_detected: [],
      ai_synthetic_disclosure: false,
      ai_crawler_directives: [],
      ai_act_compliance_status: 'NEEDS_DISCLOSURE',
      issues: ['Website unreachable or invalid domain']
    },
    message,
    error
  };
}

/**
 * Executes a live HTTP/HTTPS crawl to detect real cookies, tracking scripts,
 * security headers, legal links, Google Consent Mode v2, WCAG 2.1 AA signals,
 * and EU AI Act disclosures.
 */
export async function scanWebsiteRealTrackers(targetUrlInput: string): Promise<RealScanResult> {
  let cleanUrl = (targetUrlInput || '').trim();
  if (!cleanUrl) {
    return createFailureResult('', 'No website URL provided.');
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(cleanUrl);
    if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) {
      return createFailureResult(cleanUrl, `Invalid domain hostname: ${parsedUrl.hostname || 'empty'}`);
    }
  } catch (err: any) {
    return createFailureResult(cleanUrl, 'Invalid URL format.', err.message);
  }

  // Pre-check DNS resolution
  try {
    await dns.promises.lookup(parsedUrl.hostname);
  } catch (dnsErr: any) {
    return createFailureResult(
      cleanUrl,
      `Could not reach ${parsedUrl.hostname}. DNS lookup failed (${dnsErr.code || 'ENOTFOUND'}).`,
      dnsErr.message
    );
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

        // Security headers evaluation
        const hstsHeader = res.headers['strict-transport-security'] as string | undefined;
        const cspHeader = res.headers['content-security-policy'] as string | undefined;
        const xFrameHeader = res.headers['x-frame-options'] as string | undefined;
        const xContentTypeHeader = res.headers['x-content-type-options'] as string | undefined;

        const securityHeaders: SecurityHeadersReport = {
          hsts: !!hstsHeader,
          csp: !!cspHeader,
          x_frame_options: xFrameHeader || null,
          x_content_type_options: xContentTypeHeader || null,
          strict_transport_security: hstsHeader || null,
          content_security_policy: cspHeader ? (cspHeader.length > 120 ? cspHeader.slice(0, 120) + '...' : cspHeader) : null
        };

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
          const hasTrackingCookies = cookies.some(c => c.category === 'Marketing' || c.category === 'Analytics');

          // 3. Legal Links Discovery in DOM
          const detectedLinks: Array<{ type: string; href: string; anchor_text: string }> = [];
          let hasPrivacyLink = false;
          let hasTermsLink = false;
          let hasCookieLink = false;
          let hasAccessibilityLink = false;
          let hasCcpaDoNotSell = false;

          if (htmlBody) {
            const linkTagRegex = /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
            let match: RegExpExecArray | null;
            while ((match = linkTagRegex.exec(htmlBody)) !== null) {
              const href = match[1]?.trim() || '';
              const text = (match[2] || '').replace(/<[^>]*>/g, '').trim().toLowerCase();
              const fullMatch = `${href} ${text}`.toLowerCase();

              if (!hasPrivacyLink && (fullMatch.includes('privacy') || fullMatch.includes('datenschutz') || fullMatch.includes('confidentialite'))) {
                hasPrivacyLink = true;
                detectedLinks.push({ type: 'privacy_policy', href, anchor_text: text || 'Privacy Policy' });
              }
              if (!hasTermsLink && (fullMatch.includes('terms') || fullMatch.includes('tos') || fullMatch.includes('agb') || fullMatch.includes('conditions'))) {
                hasTermsLink = true;
                detectedLinks.push({ type: 'terms_of_service', href, anchor_text: text || 'Terms of Service' });
              }
              if (!hasCookieLink && (fullMatch.includes('cookie') || fullMatch.includes('cookie-policy') || fullMatch.includes('cookie-settings'))) {
                hasCookieLink = true;
                detectedLinks.push({ type: 'cookie_policy', href, anchor_text: text || 'Cookie Policy' });
              }
              if (!hasAccessibilityLink && (fullMatch.includes('accessibility') || fullMatch.includes('barrierefreiheit') || fullMatch.includes('a11y'))) {
                hasAccessibilityLink = true;
                detectedLinks.push({ type: 'accessibility_statement', href, anchor_text: text || 'Accessibility' });
              }
              if (!hasCcpaDoNotSell && (fullMatch.includes('do not sell') || fullMatch.includes('your privacy choices') || fullMatch.includes('opt-out') || fullMatch.includes('opt out'))) {
                hasCcpaDoNotSell = true;
                detectedLinks.push({ type: 'ccpa_do_not_sell', href, anchor_text: text || 'Do Not Sell or Share My Personal Info' });
              }
            }

            // Fallback plain-text link search
            if (!hasPrivacyLink && /(href=["'][^"']*privacy[^"']*["']|\/privacy)/i.test(htmlBody)) hasPrivacyLink = true;
            if (!hasTermsLink && /(href=["'][^"']*terms[^"']*["']|\/terms)/i.test(htmlBody)) hasTermsLink = true;
            if (!hasCookieLink && /(href=["'][^"']*cookie[^"']*["']|\/cookies)/i.test(htmlBody)) hasCookieLink = true;
            if (!hasAccessibilityLink && /(href=["'][^"']*accessibility[^"']*["']|\/accessibility)/i.test(htmlBody)) hasAccessibilityLink = true;
            if (!hasCcpaDoNotSell && /(do\s+not\s+sell|your\s+privacy\s+choices)/i.test(htmlBody)) hasCcpaDoNotSell = true;
          }

          // 4. CMP & Google Consent Mode v2 Detection
          let cmpDetected = false;
          let cmpName: string | null = null;
          if (htmlBody) {
            if (/onetrust|optanon/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'OneTrust';
            } else if (/cookiebot/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Cookiebot';
            } else if (/cookieyes/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'CookieYes';
            } else if (/pl_consent|paperloo.*banner|paperloo\.vercel\.app\/api\/banner/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Paperloo Consent Platform';
            } else if (/usercentrics/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Usercentrics';
            } else if (/axeptio/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Axeptio';
            } else if (/klaro/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Klaro';
            } else if (/termly/i.test(htmlBody)) {
              cmpDetected = true;
              cmpName = 'Termly';
            }
          }

          let gcmV2Detected = false;
          let gcmDefaults: ConsentModeReport['gcm_defaults'] = undefined;
          if (htmlBody) {
            const gcmMatch = /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]\s*,\s*({[\s\S]*?})\)/i.exec(htmlBody);
            if (gcmMatch && gcmMatch[1]) {
              try {
                // Parse default signals from JS object literal
                const rawObj = gcmMatch[1];
                const adStorage = /['"]?ad_storage['"]?\s*:\s*['"](denied|granted)['"]/i.exec(rawObj)?.[1];
                const analyticsStorage = /['"]?analytics_storage['"]?\s*:\s*['"](denied|granted)['"]/i.exec(rawObj)?.[1];
                const adUserData = /['"]?ad_user_data['"]?\s*:\s*['"](denied|granted)['"]/i.exec(rawObj)?.[1];
                const adPersonalization = /['"]?ad_personalization['"]?\s*:\s*['"](denied|granted)['"]/i.exec(rawObj)?.[1];

                gcmDefaults = {
                  ad_storage: adStorage,
                  analytics_storage: analyticsStorage,
                  ad_user_data: adUserData,
                  ad_personalization: adPersonalization
                };

                if (adStorage === 'denied' && analyticsStorage === 'denied') {
                  gcmV2Detected = true;
                }
              } catch {
                gcmV2Detected = true;
              }
            } else if (/gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i.test(htmlBody)) {
              gcmV2Detected = true;
            }
          }

          // Strict GDPR Art. 5(3) & ePrivacy prior consent enforcement:
          // If tracking cookies or scripts are detected, but neither CMP nor GCM v2 default denied is present,
          // it is a CRITICAL VIOLATION.
          const consentViolationReasons: string[] = [];
          let priorConsentEnforced = true;

          if (hasTrackingCookies || detectedScripts.length > 0) {
            if (!cmpDetected && !gcmV2Detected) {
              priorConsentEnforced = false;
              consentViolationReasons.push(
                'Tracking scripts and cookies (e.g. Google Analytics / Meta Pixel) fired on initial page load without Google Consent Mode v2 default "denied" state or a blocking CMP barrier. This directly violates GDPR Art. 5(3) (ePrivacy Directive).'
              );
            }
          }

          // 5. WCAG 2.1 AA Domestic Accessibility Evaluation
          const wcagIssues: string[] = [];
          let totalImages = 0;
          let missingAltImages = 0;
          const landmarksDetected: string[] = [];
          let missingFormLabels = 0;
          let hasDocTitle = false;
          let hasHtmlLang = false;

          if (htmlBody) {
            // Images check
            const imgRegex = /<img\b([^>]*)>/gi;
            let imgMatch: RegExpExecArray | null;
            while ((imgMatch = imgRegex.exec(htmlBody)) !== null) {
              totalImages++;
              const attrs = imgMatch[1] || '';
              const altMatch = /\balt\s*=\s*(['"])(.*?)\1/i.exec(attrs);
              if (!altMatch) {
                missingAltImages++;
              }
            }
            if (missingAltImages > 0) {
              wcagIssues.push(`${missingAltImages} of ${totalImages} image(s) lack an 'alt' text attribute (WCAG 2.1 AA 1.1.1 Non-text Content).`);
            }

            // Semantic landmarks check
            if (/<(main|nav|header|footer|aside)\b|role=["'](main|navigation|banner|contentinfo|complementary)["']/i.test(htmlBody)) {
              if (/<main\b|role=["']main["']/i.test(htmlBody)) landmarksDetected.push('main');
              if (/<nav\b|role=["']navigation["']/i.test(htmlBody)) landmarksDetected.push('navigation');
              if (/<header\b|role=["']banner["']/i.test(htmlBody)) landmarksDetected.push('header');
              if (/<footer\b|role=["']contentinfo["']/i.test(htmlBody)) landmarksDetected.push('footer');
            } else {
              wcagIssues.push('No semantic HTML5 landmarks (<main>, <nav>, <header>, <footer>) or ARIA landmark roles found (WCAG 2.1 AA 1.3.1 Info and Relationships).');
            }

            // Form labels check
            const inputRegex = /<input\b([^>]*)>/gi;
            let inputMatch: RegExpExecArray | null;
            while ((inputMatch = inputRegex.exec(htmlBody)) !== null) {
              const attrs = inputMatch[1] || '';
              if (/type=["'](hidden|submit|button|reset|image)["']/i.test(attrs)) continue;
              const hasAria = /aria-label\s*=|aria-labelledby\s*=/i.test(attrs);
              const hasId = /\bid\s*=\s*['"]([^'"]+)['"]/i.exec(attrs);
              let hasAssociatedLabel = false;
              if (hasId && hasId[1]) {
                const labelRegex = new RegExp(`<label\\b[^>]*for=["']${hasId[1]}["']`, 'i');
                if (labelRegex.test(htmlBody)) hasAssociatedLabel = true;
              }
              if (!hasAria && !hasAssociatedLabel) {
                missingFormLabels++;
              }
            }
            if (missingFormLabels > 0) {
              wcagIssues.push(`${missingFormLabels} form input(s) lack associated <label> or aria-label attributes (WCAG 2.1 AA 3.3.2 Labels or Instructions).`);
            }

            // Title & Lang
            hasDocTitle = /<title[^>]*>[\s\S]+?<\/title>/i.test(htmlBody);
            if (!hasDocTitle) wcagIssues.push('Missing or empty <title> element in document <head> (WCAG 2.1 AA 2.4.2 Page Titled).');

            hasHtmlLang = /<html[^>]*lang=["'][a-zA-Z-]+["']/i.test(htmlBody);
            if (!hasHtmlLang) wcagIssues.push('Missing lang attribute on <html> element (WCAG 2.1 AA 3.1.1 Language of Page).');
          }

          let accessibilityScore = 100;
          if (missingAltImages > 0) accessibilityScore -= Math.min(25, missingAltImages * 5);
          if (landmarksDetected.length === 0) accessibilityScore -= 20;
          if (missingFormLabels > 0) accessibilityScore -= Math.min(20, missingFormLabels * 5);
          if (!hasDocTitle) accessibilityScore -= 10;
          if (!hasHtmlLang) accessibilityScore -= 10;
          accessibilityScore = Math.max(0, accessibilityScore);

          // 6. EU AI Act & Automated Intelligence Detection
          const aiChatbots: string[] = [];
          const aiIssues: string[] = [];
          let aiSyntheticDisclosure = false;

          if (htmlBody) {
            if (/widget\.intercom\.io|js\.intercomcdn\.com/i.test(htmlBody)) aiChatbots.push('Intercom AI Messenger / Fin');
            if (/client\.crisp\.chat/i.test(htmlBody)) aiChatbots.push('Crisp Live Chat / AI');
            if (/chatbase\.co\/embed/i.test(htmlBody)) aiChatbots.push('Chatbase AI Assistant');
            if (/voiceflow\.com\/widget/i.test(htmlBody)) aiChatbots.push('Voiceflow Conversational AI');
            if (/botpress\.cloud|botpress\.webchat/i.test(htmlBody)) aiChatbots.push('Botpress Webchat Agent');
            if (/code\.tidio\.co/i.test(htmlBody)) aiChatbots.push('Tidio Lyro AI Chatbot');
            if (/assets\.zendesk\.com|zopim\.com/i.test(htmlBody)) aiChatbots.push('Zendesk AI Answer Bot');

            aiSyntheticDisclosure = /ai-generated|synthetic\s+content|automated\s+decision|artificial\s+intelligence|eu\s+ai\s+act/i.test(htmlBody);
          }

          let aiActStatus: AiTransparencyReport['ai_act_compliance_status'] = 'COMPLIANT';
          if (aiChatbots.length > 0 && !aiSyntheticDisclosure) {
            aiActStatus = 'NEEDS_DISCLOSURE';
            aiIssues.push(
              `AI Chatbot system detected (${aiChatbots.join(', ')}), but no explicit AI disclosure was found. EU AI Act Article 50 mandates that users must be clearly informed when interacting with an AI system.`
            );
          }

          const crawlerDirectives: AiTransparencyReport['ai_crawler_directives'] = [
            { bot: 'GPTBot', status: 'not_specified' },
            { bot: 'CCBot', status: 'not_specified' },
            { bot: 'ClaudeBot', status: 'not_specified' },
            { bot: 'Anthropic-ai', status: 'not_specified' },
            { bot: 'Google-Extended', status: 'not_specified' }
          ];

          resolve({
            success: true,
            reachable: true,
            scanned_url: cleanUrl,
            status_code: statusCode,
            is_https: isHttps,
            total_cookies_found: cookies.length,
            cookie_inventory: cookies,
            scripts_detected: detectedScripts,
            headers_analyzed: true,
            security_headers: securityHeaders,
            legal_links: {
              privacy_policy: hasPrivacyLink,
              terms_of_service: hasTermsLink,
              cookie_policy: hasCookieLink,
              accessibility_statement: hasAccessibilityLink,
              ccpa_do_not_sell: hasCcpaDoNotSell,
              detected_links: detectedLinks
            },
            consent_mode: {
              cmp_detected: cmpDetected,
              cmp_name: cmpName,
              gcm_v2_detected: gcmV2Detected,
              gcm_defaults: gcmDefaults,
              prior_consent_enforced: priorConsentEnforced,
              consent_violation_reasons: consentViolationReasons
            },
            wcag_metrics: {
              total_images_count: totalImages,
              missing_alt_images_count: missingAltImages,
              landmarks_detected: landmarksDetected,
              missing_form_labels_count: missingFormLabels,
              has_document_title: hasDocTitle,
              has_html_lang: hasHtmlLang,
              accessibility_score: accessibilityScore,
              issues: wcagIssues
            },
            ai_transparency: {
              ai_chatbots_detected: aiChatbots,
              ai_synthetic_disclosure: aiSyntheticDisclosure,
              ai_crawler_directives: crawlerDirectives,
              ai_act_compliance_status: aiActStatus,
              issues: aiIssues
            },
            message: cookies.length > 0
              ? `Found ${cookies.length} real cookies/trackers on ${parsedUrl.hostname} (${detectedScripts.length} tracking scripts detected).`
              : `Scan complete: No cookies or third-party trackers detected on ${parsedUrl.hostname}.`
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(createFailureResult(cleanUrl, `Connection to ${parsedUrl.hostname} timed out after 8 seconds.`));
    });

    req.on('error', (err: any) => {
      resolve(createFailureResult(cleanUrl, `Could not reach ${parsedUrl.hostname}: ${err.message}`, err.message));
    });
  });
}
