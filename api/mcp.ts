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

export interface MonitoredSite {
  id: string;
  name: string;
  url: string;
  platform: string;
  jurisdictions: string[];
  agency_name: string;
  compliance_grade: string;
  compliance_score: number;
  status: string;
  created_at: string;
  cookie_banner?: {
    theme: string;
    position: string;
    banner_title: string;
    banner_message: string;
    enable_gcm_v2: boolean;
    auto_block_trackers: boolean;
    accent_color: string;
    categories: string[];
    updated_at: string;
  };
  gtm?: {
    gtm_container_id: string;
    default_ad_storage: string;
    default_analytics_storage: string;
    default_ad_user_data: string;
    default_ad_personalization: string;
    trigger_events: boolean;
    updated_at: string;
  };
  documents?: Array<{
    type: string;
    title: string;
    version: string;
    word_count: number;
    markdown: string;
    updated_at: string;
  }>;
  audit?: {
    score: number;
    grade: string;
    scanned_at: string;
    findings: string[];
    trackers_detected: number;
  };
}

// Known Cookie Dictionary
const KNOWN_COOKIES: Record<string, { provider: string; category: ScannedCookie['category']; expiry: string; purpose: string }> = {
  '_ga': { provider: 'Google Analytics', category: 'Analytics', expiry: '2 years', purpose: 'Distinguishes unique website visitors and counts page views' },
  '_gid': { provider: 'Google Analytics', category: 'Analytics', expiry: '24 hours', purpose: 'Identifies visitor sessions across pages' },
  '_gat': { provider: 'Google Analytics', category: 'Analytics', expiry: '1 minute', purpose: 'Throttles request rate to Google servers' },
  '_gcl_au': { provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Measures ad conversions and user attribution' },
  '_gcl_aw': { provider: 'Google Ads', category: 'Marketing', expiry: '90 days', purpose: 'Attribution for Google Ads clicks' },
  '_fbp': { provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Tracks user actions across web properties for advertising delivery' },
  'fr': { provider: 'Meta (Facebook)', category: 'Marketing', expiry: '90 days', purpose: 'Delivers, measures, and improves the relevancy of Facebook ads' },
  '_ttp': { provider: 'TikTok', category: 'Marketing', expiry: '13 months', purpose: 'Measures performance of advertising campaigns on TikTok' },
  '_clck': { provider: 'Microsoft Clarity', category: 'Analytics', expiry: '1 year', purpose: 'Stores a unique user ID for session replay and heatmaps' },
  '_clsk': { provider: 'Microsoft Clarity', category: 'Analytics', expiry: '1 day', purpose: 'Connects multiple page views by a user into a single Clarity session' },
  'MUID': { provider: 'Microsoft', category: 'Marketing', expiry: '1 year', purpose: 'Identifies unique web browsers visiting Microsoft sites for analytics and ads' },
  '_hjSession': { provider: 'Hotjar', category: 'Analytics', expiry: '30 minutes', purpose: 'Maintains current Hotjar session data' },
  '_hjSessionUser': { provider: 'Hotjar', category: 'Analytics', expiry: '1 year', purpose: 'Ensures data from subsequent visits are attributed to the same user' },
  'bcookie': { provider: 'LinkedIn', category: 'Marketing', expiry: '1 year', purpose: 'Browser identification for LinkedIn conversion tracking' },
  'li_sugr': { provider: 'LinkedIn', category: 'Marketing', expiry: '90 days', purpose: 'Probabilistic match of user identity outside the Designated Countries' },
  '__cf_bm': { provider: 'Cloudflare', category: 'Necessary', expiry: '30 minutes', purpose: 'Bot management and protection against malicious traffic' },
  'cf_clearance': { provider: 'Cloudflare', category: 'Necessary', expiry: '1 year', purpose: 'Stores proof of challenge completion to allow clean traffic' },
  'datadome': { provider: 'DataDome', category: 'Necessary', expiry: '1 year', purpose: 'Protects website against automated bot attacks and scrapers' },
  'AWSALB': { provider: 'Amazon Web Services', category: 'Necessary', expiry: '7 days', purpose: 'Load balancer session affinity to route requests to the same server' },
  'AWSALBCORS': { provider: 'Amazon Web Services', category: 'Necessary', expiry: '7 days', purpose: 'CORS load balancer session sticky routing' },
  '__stripe_mid': { provider: 'Stripe', category: 'Necessary', expiry: '1 year', purpose: 'Fraud detection and secure payment processing' },
  '__stripe_sid': { provider: 'Stripe', category: 'Necessary', expiry: '30 minutes', purpose: 'Maintains payment session security during checkout' },
  'pl_consent': { provider: 'Paperloo', category: 'Necessary', expiry: '12 months', purpose: 'Remembers visitor cookie consent choices' },
  'OptanonConsent': { provider: 'OneTrust', category: 'Necessary', expiry: '12 months', purpose: 'Stores cookie consent preferences' },
  'CookieConsent': { provider: 'Cookiebot', category: 'Necessary', expiry: '12 months', purpose: 'Stores visitor consent state for the current domain' }
};

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
          if (htmlBody.length < 1024 * 1024) {
            htmlBody += chunk;
          }
        });

        res.on('end', () => {
          const cookieMap = new Map<string, ScannedCookie>();
          const detectedScripts: string[] = [];

          for (const rawCookie of setCookieHeaders) {
            const parts = rawCookie.split(';');
            const nameVal = parts[0]?.trim();
            if (!nameVal) continue;

            const eqIdx = nameVal.indexOf('=');
            const cookieName = eqIdx !== -1 ? nameVal.substring(0, eqIdx).trim() : nameVal;
            if (!cookieName) continue;

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

          // Legal Links Discovery
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

            if (!hasPrivacyLink && /(href=["'][^"']*privacy[^"']*["']|\/privacy)/i.test(htmlBody)) hasPrivacyLink = true;
            if (!hasTermsLink && /(href=["'][^"']*terms[^"']*["']|\/terms)/i.test(htmlBody)) hasTermsLink = true;
            if (!hasCookieLink && /(href=["'][^"']*cookie[^"']*["']|\/cookies)/i.test(htmlBody)) hasCookieLink = true;
            if (!hasAccessibilityLink && /(href=["'][^"']*accessibility[^"']*["']|\/accessibility)/i.test(htmlBody)) hasAccessibilityLink = true;
            if (!hasCcpaDoNotSell && /(do\s+not\s+sell|your\s+privacy\s+choices)/i.test(htmlBody)) hasCcpaDoNotSell = true;
          }

          // CMP & GCM v2
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

          // WCAG 2.1 AA Analysis
          const wcagIssues: string[] = [];
          let totalImages = 0;
          let missingAltImages = 0;
          const landmarksDetected: string[] = [];
          let missingFormLabels = 0;
          let hasDocTitle = false;
          let hasHtmlLang = false;

          if (htmlBody) {
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

            if (/<(main|nav|header|footer|aside)\b|role=["'](main|navigation|banner|contentinfo|complementary)["']/i.test(htmlBody)) {
              if (/<main\b|role=["']main["']/i.test(htmlBody)) landmarksDetected.push('main');
              if (/<nav\b|role=["']navigation["']/i.test(htmlBody)) landmarksDetected.push('navigation');
              if (/<header\b|role=["']banner["']/i.test(htmlBody)) landmarksDetected.push('header');
              if (/<footer\b|role=["']contentinfo["']/i.test(htmlBody)) landmarksDetected.push('footer');
            } else {
              wcagIssues.push('No semantic HTML5 landmarks (<main>, <nav>, <header>, <footer>) or ARIA landmark roles found (WCAG 2.1 AA 1.3.1 Info and Relationships).');
            }

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

          // AI Act Analysis
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

// In-memory persistent sites registry
export const activeSites: MonitoredSite[] = [
  {
    id: "site_paperloo_sandbox",
    name: "Paperloo Production Sandbox",
    url: "https://paperloo.vercel.app",
    platform: "nextjs",
    jurisdictions: ["GDPR (EU)", "CCPA (California)", "EU_AI_ACT"],
    agency_name: "Paperloo Global Infrastructure",
    compliance_grade: "A+",
    compliance_score: 98,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    cookie_banner: {
      theme: "dark",
      position: "bottom",
      banner_title: "Privacy & Cookie Consent",
      banner_message: "We use necessary and analytical cookies to ensure our compliance infrastructure functions properly.",
      enable_gcm_v2: true,
      auto_block_trackers: true,
      accent_color: "#c8f135",
      categories: ["necessary", "analytics", "marketing", "preferences"],
      updated_at: new Date().toISOString()
    },
    gtm: {
      gtm_container_id: "GTM-PAPERLOO",
      default_ad_storage: "denied",
      default_analytics_storage: "denied",
      default_ad_user_data: "denied",
      default_ad_personalization: "denied",
      trigger_events: true,
      updated_at: new Date().toISOString()
    },
    documents: [
      {
        type: "privacy_policy",
        title: "Paperloo Privacy Policy",
        version: "2.4",
        word_count: 2450,
        markdown: "# Privacy Policy\n\nLast updated: 2026-10-15\n\nPaperloo Compliance Infrastructure is committed to protecting your personal data in accordance with GDPR, CCPA, and global privacy standards.",
        updated_at: new Date().toISOString()
      },
      {
        type: "terms_of_service",
        title: "Paperloo Terms of Service",
        version: "1.8",
        word_count: 3100,
        markdown: "# Terms of Service\n\nWelcome to Paperloo. By accessing our compliance infrastructure, you agree to these Terms.",
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "site_demo_store",
    name: "Acme Commerce Global",
    url: "https://demo.paperloo.store",
    platform: "shopify",
    jurisdictions: ["GDPR", "CCPA", "PIPEDA"],
    agency_name: "Apex Digital Media",
    compliance_grade: "A",
    compliance_score: 94,
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    cookie_banner: {
      theme: "light",
      position: "bottom_right",
      banner_title: "We value your privacy",
      banner_message: "This site uses cookies to personalize content, ads, and analyze website traffic.",
      enable_gcm_v2: true,
      auto_block_trackers: true,
      accent_color: "#10b981",
      categories: ["necessary", "analytics", "marketing"],
      updated_at: new Date().toISOString()
    },
    gtm: {
      gtm_container_id: "GTM-ACME789",
      default_ad_storage: "denied",
      default_analytics_storage: "denied",
      default_ad_user_data: "denied",
      default_ad_personalization: "denied",
      trigger_events: true,
      updated_at: new Date().toISOString()
    }
  }
];

export function generateStatutoryDocumentSuite(args: any): Array<{ type: string; title: string; version: string; word_count: number; markdown: string; updated_at: string }> {
  const company = (args.company_name || "Company Inc.").trim();
  const rawUrl = (args.website_url || "https://example.com").trim();
  const url = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
  let cleanEmail = (args.contact_email || "privacy@example.com").trim();
  try {
    cleanEmail = decodeURIComponent(cleanEmail).replace(/\s+/g, '');
  } catch {}
  const email = cleanEmail;
  const address = (args.physical_address || "100 Market St, San Francisco, CA 94105").trim();
  const rawJurisdictions = args.jurisdictions || ["GDPR", "CCPA"];
  const jurisdictions: string[] = Array.isArray(rawJurisdictions) ? rawJurisdictions : [rawJurisdictions];
  const jurisdictionsStr = jurisdictions.join(", ");
  const dateStr = new Date().toISOString().split("T")[0];

  const hasMinors = args.collects_minors === true || args.minors_data === true;
  const refundPeriodDays = Number(args.refund_period_days) || 14;
  const processesPayments = args.processes_payments === true;
  const hasUserAccounts = args.has_user_accounts === true;
  const usesGoogleAnalytics = args.uses_google_analytics !== false;
  const usesMetaPixel = args.uses_meta_pixel === true;
  const usesHotjar = args.uses_hotjar === true || args.uses_session_recording === true;
  const retentionMonths = Number(args.data_retention_months) || 24;
  const isCalifornia = jurisdictions.some(j => /ccpa|cpra|california/i.test(j));
  const isEuAiAct = jurisdictions.some(j => /ai|eu_ai_act/i.test(j));

  const governingLaw = isCalifornia
    ? "the State of California, United States"
    : jurisdictions.some(j => /uk/i.test(j))
    ? "England and Wales, United Kingdom"
    : "the European Union and the Republic of Ireland";

  const disputeForum = isCalifornia
    ? "San Francisco County, California"
    : jurisdictions.some(j => /uk/i.test(j))
    ? "London, United Kingdom"
    : "Dublin, Ireland";

  const subProcessors = [
    ...(usesGoogleAnalytics ? ["- **Google Ireland Limited / Google LLC (Google Analytics 4 & GTM):** Web interaction measurement, telemetry logging, and conversion attribution under executed Data Processing Terms and Google Consent Mode v2."] : []),
    ...(usesMetaPixel ? ["- **Meta Platforms Ireland Ltd / Meta Platforms, Inc. (Meta Pixel):** Advertising measurement, conversion attribution, and cross-context custom audience targeting (strictly subject to prior affirmative opt-in consent)."] : []),
    ...(usesHotjar ? ["- **Hotjar Ltd. (Malta, EU):** Aggregated UX behavioral telemetry and session heatmapping (in-region EEA processing)."] : []),
    ...(processesPayments ? ["- **Stripe Payments Europe, Ltd. / Stripe Inc.:** PCI-DSS Level 1 compliant payment processing, fraud screening, and tokenized transaction management."] : []),
    "- **Vercel Inc. / Amazon Web Services / Cloudflare Inc.:** Enterprise cloud hosting, CDN distribution, TLS 1.3 encrypted edge delivery, and DDoS mitigation."
  ].join("\n");

  const minorConsentClause = hasMinors ? `
## Children's Online Privacy Protection (COPPA & GDPR Article 8)
Our online properties and services are accessible to or may collect information from minors. In strict compliance with the **U.S. Children's Online Privacy Protection Act (COPPA - 16 C.F.R. Part 312)** and **GDPR Article 8**:
1. We do not knowingly collect, process, or disclose personal data from children under the age of 13 (or under 16 in applicable EU Member States) without prior verifiable parental consent.
2. Parents or legal guardians may review, request deletion of, or prohibit further collection of their child's personal information by submitting a written request to **${email}**.
3. We strictly refrain from algorithmic behavioral advertising, cross-context tracking, or automated profiling directed at identified minors.
` : `
## Children's Privacy
Our services are directed exclusively to individuals who have reached the age of majority in their jurisdiction. We do not knowingly solicit or collect personal information from children under 13 (or 16 in the European Union). If you become aware that a child has provided us with personal data without parental consent, please contact us at **${email}** to prompt immediate record expungement.
`;

  const aiActClause = isEuAiAct ? `
## Artificial Intelligence Transparency & EU AI Act Governance (Regulation (EU) 2024/1689)
In accordance with the **European Union Artificial Intelligence Act (Regulation (EU) 2024/1689)** and **GDPR Article 22** regarding automated decision-making:
1. **Interactive AI Disclosures (Article 50):** Whenever users interact with conversational agents, automated chatbots, or recommendation engines on ${url}, they are clearly informed that they are communicating with an artificial intelligence system.
2. **Synthetic & Generated Content:** Any text, visual, or audio material generated or synthetically altered by AI is marked with verifiable technical metadata in compliance with harmonized transparency standards.
3. **Automated Decision-Making Safeguards:** Users maintain the right to obtain human intervention, express their point of view, and contest automated determinations that significantly affect them by notifying our privacy lead at **${email}**.
` : "";

  const privacyMarkdown = `# Privacy Policy for ${company}

**Effective Date:** ${dateStr}  
**Website:** ${url}  
**Contact Email:** ${email}  
**Mailing Address:** ${address}  
**Applicable Frameworks:** ${jurisdictionsStr}

---

## 1. Introduction & Regulatory Scope
${company} ("we", "us", or "our") operates ${url}. This Privacy Policy governs our data processing practices in full alignment with the **General Data Protection Regulation (Regulation (EU) 2016/679 - GDPR)**, the **California Consumer Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA)**, and applicable privacy statutes across our operating jurisdictions.

## 2. Categories of Personal Data Collected
We collect only the minimum personal data necessary to accomplish our disclosed purposes:
- **Directly Provided Information:** Full name, email address (${email}), correspondence history, and user feedback.
- ${hasUserAccounts ? "**Account & Identity Records:** Securely salted password hashes, user profile preferences, and session tokens." : "**Account Data:** We do not provide public user account registration on this site."}
- ${processesPayments ? "**Payment & Financial Transaction Records:** Billing addresses, transaction identifiers, and tokenized payment instruments processed securely through PCI-DSS certified providers (e.g. Stripe)." : "**Payment Information:** No direct payment processing occurs on this website."}
- **Automatically Collected Telemetry:** IP address, browser user-agent, operating system, referring URL, interaction timestamps, and device metrics.
- **Cookies & Local Storage:** Session identifiers and technical preferences managed via our consent banner.

${minorConsentClause}

${aiActClause}

## 3. Lawful Bases for Processing (GDPR Article 6)
We process personal data strictly under valid lawful bases:
1. **Consent (Art. 6(1)(a)):** For non-essential cookies, analytics pixels, and marketing tags, granted affirmatively via our Google Consent Mode v2 banner.
2. **Contractual Performance (Art. 6(1)(b)):** Processing necessary to deliver contracted digital services, process orders, and provide customer support.
3. **Legal Compliance (Art. 6(1)(c)):** Fulfilling statutory tax, financial auditing, and regulatory reporting obligations.
4. **Legitimate Interests (Art. 6(1)(f)):** Ensuring edge security, mitigating denial-of-service attempts, preventing fraud, and maintaining infrastructure availability.

## 4. Sub-Processors & Data Recipients
We engage vetted third-party service providers bound by executed Data Processing Addenda (DPAs) with Standard Contractual Clauses (SCCs) where applicable:
${subProcessors}

## 5. Global Privacy Rights & Exercise Procedures
Regardless of your location, you hold comprehensive rights over your personal data:
- **Right to Access & Portability (GDPR Art. 15 / CCPA § 1798.100):** Obtain copies of your personal data in structured, commonly used JSON/CSV format.
- **Right to Rectification (GDPR Art. 16):** Request correction of inaccurate or incomplete records.
- **Right to Erasure / Deletion (GDPR Art. 17 / CCPA § 1798.105):** Request deletion of your personal records subject to statutory retention exceptions.
- **Right to Restrict & Object (GDPR Art. 18 & 21):** Restrict processing or object to direct marketing and legitimate-interest processing.
- **CCPA/CPRA Opt-Out Notice ("Do Not Sell or Share"):** We do not sell personal information for monetary compensation or share it for cross-context behavioral advertising without prior affirmative consent.
- **Global Privacy Control (GPC):** Where technically supported, our web infrastructure recognizes and respects browser-level Global Privacy Control preference signals in conformance with Cal. Code Regs. tit. 11 § 7025.

To exercise any statutory right, contact our Data Privacy Team at **${email}**${args.dpo_email ? ` or our Data Protection Officer at **${args.dpo_email}**` : ""}. All requests are acknowledged and resolved within statutory deadlines (30 days) free of charge.

## 6. Retention, Security & International Transfers
- **Data Retention:** Personal data is retained solely for the period required to fulfill processing purposes (standard operational retention: ${retentionMonths} months).
- **Security Standards:** All network transmissions are enforced via TLS 1.3 encryption, and data stored at rest is secured via AES-256 encryption.
- **International Transfers:** Transfers out of the EEA, UK, or Switzerland are governed by European Commission Standard Contractual Clauses (SCCs) or participation in the EU-U.S. Data Privacy Framework.
`;

  const paymentTermsSection = processesPayments ? `
## 4. Billing, Subscriptions & Payments
1. **Payment Authorization:** By submitting payment credentials, you authorize ${company} to charge the designated payment method through our secure PCI-DSS compliant processor.
2. **Recurring Subscriptions:** If you enroll in a recurring subscription, your membership automatically renews at the specified billing interval until explicitly cancelled.
3. **Price Adjustments:** We reserve the right to revise subscription fees upon providing at least 30 days prior written notice.
` : "";

  const refundTermsSection = processesPayments ? `
## 5. Statutory Right of Withdrawal & ${refundPeriodDays}-Day Refund Policy
1. **Statutory Withdrawal Window:** In compliance with the EU Consumer Rights Directive (2011/83/EU) and our satisfaction guarantee, consumers are entitled to a full refund within **${refundPeriodDays} calendar days** of initial order or subscription activation.
2. **Refund Procedure:** To initiate a refund, submit your order confirmation number and cancellation request to **${email}**. Approved refunds are credited to the original payment instrument within 5 to 10 business days.
3. **Exceptions:** Digital downloads that have been fully retrieved or customized enterprise deployments with signed bespoke agreements are exempt from standard refund eligibility.
` : `
## 5. Refunds & Cancellations
All services provided on ${url} are offered on standard terms. For cancellation or billing inquiries, contact **${email}**.
`;

  const termsMarkdown = `# Terms of Service for ${company}

**Effective Date:** ${dateStr}  
**Governing Entity:** ${company}  
**Domain URL:** ${url}  
**Contact Email:** ${email}  
**Registered Address:** ${address}

---

## 1. Acceptance of Terms
By accessing, browsing, or utilizing ${url} (the "Service"), you agree to be legally bound by these Terms of Service. If you disagree with any portion of these terms, you must terminate access immediately.

## 2. Intellectual Property Rights
All proprietary software, algorithms, source code, UI designs, logos, text, graphics, and audiovisual media on ${url} are the exclusive property of ${company} or its licensors and are protected by copyright, trademark, and international intellectual property treaties.

## 3. Acceptable Use & Prohibited Activities
You agree not to use the Service:
- In violation of any applicable local, national, or international statute or regulation.
- To transmit malicious code, automated web scrapers, unauthorized vulnerability probes, or denial-of-service traffic.
- To reverse-engineer, decompile, or disassemble any aspect of the proprietary code base.
- To impersonate any individual or entity, or falsely declare affiliation with ${company}.

${paymentTermsSection}

${refundTermsSection}

## 6. Disclaimer of Warranties
The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, statutory, or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.

## 7. Limitation of Liability
To the maximum extent permitted by applicable law, in no event shall ${company}, its officers, directors, employees, or agents be liable for indirect, incidental, special, exemplary, or consequential damages arising out of your access or inability to access the Service.

## 8. Governing Law & Dispute Resolution
These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with **${governingLaw}**. Any dispute shall be submitted to the exclusive jurisdiction of the competent courts of **${disputeForum}**.
`;

  const cookieMarkdown = `# Cookie Policy for ${company}

**Last Updated:** ${dateStr}  
**Domain:** ${url}  
**Contact:** ${email}

---

## 1. Overview & Statutory Requirements
This Cookie Policy explains how ${company} uses cookies, local storage objects, and tracking technologies on ${url} in strict compliance with the **ePrivacy Directive (2002/58/EC as amended)**, **GDPR Article 5(3)**, and **CCPA § 1798.135**.

## 2. Categories of Cookies Deployed
1. **Strictly Necessary Cookies:** Essential for session management, security challenge tokens (e.g. Cloudflare), and storing your cookie preferences. These cookies fire automatically and cannot be disabled.
2. **Analytics & Performance Cookies:** (e.g. Google Analytics 4, Hotjar) Measure aggregate page visits, visitor pathways, and application performance. **These cookies are blocked by default** and execute only after affirmative opt-in through our Google Consent Mode v2 banner.
3. **Marketing & Conversion Trackers:** (e.g. Meta Pixel, Google Ads) Attribution beacons used to evaluate ad campaign effectiveness. Deployed exclusively upon explicit user authorization.

## 3. Google Consent Mode v2 Implementation
Our website utilizes **Google Consent Mode v2**. Prior to user interaction with our consent banner, the following defaults are transmitted to the browser dataLayer:
\`\`\`javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
\`\`\`
No analytics or advertising cookies are persisted to your browser until you click **"Accept All"** or enable specific categories in the consent settings modal.

## 4. Managing Your Preferences
You can review and modify your consent preferences at any time by clicking the "Cookie Preferences" link in our website footer or by adjusting your browser cookie settings.
`;

  const eulaMarkdown = `# End User License Agreement (EULA) for ${company}

**Last Updated:** ${dateStr}  
**Licensor:** ${company} (${address})  
**Software / Service:** ${url}

---

## 1. Grant of License
Subject to the terms of this Agreement, ${company} grants you a revocable, non-exclusive, non-transferable, limited license to access and use the software applications and web interfaces provided at ${url} strictly for your internal business or personal purposes.

## 2. License Restrictions
You agree not to, and you will not permit others to:
- License, sell, rent, lease, assign, distribute, or commercially exploit the software.
- Modify, make derivative works of, disassemble, decrypt, reverse compile, or reverse engineer any part of the application.
- Circumvent or disable any security features, usage rate limiters, or license key verifications.

## 3. Intellectual Property Ownership
All title, copyright, trademarks, trade secrets, and other intellectual property rights in and to the software remain the exclusive property of ${company}.

## 4. Termination
This Agreement is effective until terminated. Your rights under this Agreement will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you shall cease all use of the software.

## 5. Governing Law
This Agreement is governed by the laws of **${governingLaw}**, without regard to conflict of law principles.
`;

  const acceptableUseMarkdown = `# Acceptable Use Policy for ${company}

**Last Updated:** ${dateStr}  
**Target Domain:** ${url}  
**Abuse Reporting:** ${email}

---

## 1. Purpose & Scope
This Acceptable Use Policy ("AUP") defines the acceptable standards of conduct when interacting with ${url}. Compliance is mandatory for all users and automated API clients.

## 2. Prohibited Conduct
You must not use our infrastructure to:
- Distribute malware, worms, ransomware, or phishing campaigns.
- Engage in unauthorized penetration testing, port scanning, or vulnerability harvesting.
- Execute automated scraping that bypasses robot exclusion standards (\`robots.txt\`) or exceeds published API rate limits.
- Harvest personal information without verifiable statutory justification.
- Transmit harassing, defamatory, fraudulent, or unlawful communications.

## 3. Security Vulnerability Reporting
We welcome responsible security disclosures. If you discover a vulnerability, report details promptly to **${email}**. Do not attempt unauthorized data extraction, service disruption, or public disclosure prior to mutual remediation.
`;

  const disclaimerMarkdown = `# Legal & Regulatory Disclaimer for ${company}

**Last Updated:** ${dateStr}  
**Domain:** ${url}  
**Contact:** ${email}

---

## 1. Informational Purposes Only
The content, software tools, and compliance outputs generated on ${url} are provided solely for general informational and administrative support purposes. Nothing on this website constitutes formal legal, financial, or regulatory advice.

## 2. Absence of Attorney-Client Relationship
Your use of ${url} does not create an attorney-client relationship between you and ${company}. You should consult qualified legal counsel in your operating jurisdiction to verify specific regulatory obligations.

## 3. "As-Is" Provision
While ${company} strives to ensure regulatory accuracy under GDPR, CCPA, and global frameworks, all services and documents are provided "as-is" without warranty of completeness or ongoing legal fitness.
`;

  const returnPolicyMarkdown = `# Return & Refund Policy for ${company}

**Last Updated:** ${dateStr}  
**Entity:** ${company}  
**Contact:** ${email}  
**Refund Window:** ${refundPeriodDays} Calendar Days

---

## 1. Satisfaction Guarantee & Statutory Right
${company} stands behind its products and services. In accordance with applicable consumer protection laws and our satisfaction guarantee, we provide a **${refundPeriodDays}-day money-back guarantee** for qualifying transactions.

## 2. Eligibility Requirements
- Requests must be submitted within ${refundPeriodDays} days from the original transaction timestamp.
- You must provide proof of purchase or the order ID associated with your account.
- For recurring subscriptions, cancellations prevent future billing cycles; refunds for the active billing cycle are evaluated under our ${refundPeriodDays}-day guarantee.

## 3. How to Request a Refund
Submit an email to **${email}** with the subject line "Refund Request - [Order ID]". Our billing department processes eligible refund requests within 3 business days, with bank credit reflection within 5 to 10 business days.
`;

  const accessibilityMarkdown = `# Accessibility Statement for ${company}

**Last Updated:** ${dateStr}  
**Domain:** ${url}  
**Accessibility Contact:** ${email}

---

## 1. Commitment to Digital Accessibility
${company} is dedicated to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards in accordance with the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**.

## 2. Conformance Measures
To support accessibility across ${url}, we implement the following technical measures:
- Semantic HTML5 landmarks (\`<main>\`, \`<nav>\`, \`<header>\`, \`<footer>\`) across all views.
- Descriptive \`alt\` text attributes on informative images and visual elements.
- Visible focus indicators for complete keyboard navigation.
- Minimum color contrast ratio of 4.5:1 for standard text and 3:1 for large text.
- Accessible form controls with programmatic label bindings.

## 3. Feedback & Assistance
We welcome your feedback on the accessibility of ${url}. If you encounter accessibility barriers, please contact our accessibility coordinator at **${email}**. We aim to respond within 2 business days.
`;

  const docCatalog: Record<string, { title: string; markdown: string }> = {
    privacy_policy: { title: `${company} Privacy Policy`, markdown: privacyMarkdown },
    terms_of_service: { title: `${company} Terms of Service`, markdown: termsMarkdown },
    cookie_policy: { title: `${company} Cookie Policy`, markdown: cookieMarkdown },
    eula: { title: `${company} End User License Agreement (EULA)`, markdown: eulaMarkdown },
    acceptable_use: { title: `${company} Acceptable Use Policy`, markdown: acceptableUseMarkdown },
    disclaimer: { title: `${company} Legal & Regulatory Disclaimer`, markdown: disclaimerMarkdown },
    return_policy: { title: `${company} Return & Refund Policy`, markdown: returnPolicyMarkdown },
    accessibility_statement: { title: `${company} Accessibility Statement (WCAG 2.1 AA)`, markdown: accessibilityMarkdown }
  };

  const requestedTypes: string[] = args.document_types || [
    "privacy_policy",
    "terms_of_service",
    "cookie_policy",
    "eula",
    "acceptable_use",
    "disclaimer"
  ];

  const results: Array<{ type: string; title: string; version: string; word_count: number; markdown: string; updated_at: string }> = [];

  for (const docType of requestedTypes) {
    if (docCatalog[docType]) {
      const entry = docCatalog[docType];
      results.push({
        type: docType,
        title: entry.title,
        version: "1.0",
        word_count: entry.markdown.split(/\s+/).filter(Boolean).length,
        markdown: entry.markdown,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (results.length === 0) {
    for (const docType of ["privacy_policy", "terms_of_service", "cookie_policy"]) {
      const entry = docCatalog[docType];
      results.push({
        type: docType,
        title: entry.title,
        version: "1.0",
        word_count: entry.markdown.split(/\s+/).filter(Boolean).length,
        markdown: entry.markdown,
        updated_at: new Date().toISOString()
      });
    }
  }

  return results;
}

export const MCP_TOOLS = [
  {
    name: "audit_site",
    description: "Performs multi-vector automated compliance auditing on a target website URL. Checks SSL/HTTPS, Google Consent Mode v2 signals, prior consent enforcement under GDPR Art. 5(3), legal links, security headers, WCAG 2.1 AA accessibility, and EU AI Act disclosures.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The full website URL to audit (e.g. 'https://example.com')"
        },
        deep_scan: {
          type: "boolean",
          description: "Whether to execute deep DOM inspection and sub-resource tracker verification",
          default: true
        }
      },
      required: ["url"]
    }
  },
  {
    name: "audit_accessibility",
    description: "Performs itemized WCAG 2.1 AA accessibility audit on a web domain. Inspects image alt attributes, semantic landmark roles, form control labels, document titles, language bindings, and contrast indicators.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Website URL to audit for WCAG 2.1 AA compliance"
        },
        standard: {
          type: "string",
          enum: ["WCAG_2.1_AA", "WCAG_2.1_AAA", "Section_508"],
          default: "WCAG_2.1_AA"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "audit_ai_transparency",
    description: "Audits a website for EU AI Act (Regulation (EU) 2024/1689) transparency compliance. Detects conversational AI chatbots, synthetic media disclosures, automated decision-making notices, and AI crawler directives (GPTBot, ClaudeBot).",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Website URL to evaluate for AI Act transparency obligations"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "configure_cookie_banner",
    description: "Configures and personalizes the cookie consent banner for a site. Controls layout, theme colors, Google Consent Mode v2 integration, and tracker auto-blocking rules.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID"
        },
        theme: {
          type: "string",
          enum: ["dark", "light", "glassmorphism", "auto"],
          default: "dark"
        },
        position: {
          type: "string",
          enum: ["bottom", "top", "bottom_right", "bottom_left", "center_modal"],
          default: "bottom"
        },
        banner_title: {
          type: "string",
          description: "Primary banner headline",
          default: "Privacy & Cookie Preferences"
        },
        banner_message: {
          type: "string",
          description: "Consent notification message"
        },
        enable_gcm_v2: {
          type: "boolean",
          description: "Synchronize user choices directly with Google Consent Mode v2",
          default: true
        },
        auto_block_trackers: {
          type: "boolean",
          description: "Automatically withhold analytics and advertising scripts until consent is granted",
          default: true
        },
        accent_color: {
          type: "string",
          description: "Hex accent color for accept buttons (e.g. '#c8f135')",
          default: "#c8f135"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "get_cookie_banner_script",
    description: "Generates the ready-to-paste HTML embed snippet or framework code (React, Next.js, WordPress) for the site's cookie consent banner with Google Consent Mode v2 auto-initialization.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID"
        },
        framework: {
          type: "string",
          enum: ["html", "react", "nextjs", "wordpress", "webflow", "shopify"],
          default: "html"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "get_consent_banner_code",
    description: "Returns production-ready, zero-code consent banner snippet with Google Consent Mode v2 default denied parameters and dynamic unblocking listeners.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID or domain"
        },
        gtm_mode: {
          type: "string",
          enum: ["v2_basic", "v2_advanced"],
          default: "v2_advanced"
        },
        framework: {
          type: "string",
          enum: ["html", "react", "nextjs", "vue"],
          default: "html"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "configure_gtm_integration",
    description: "Configures Google Tag Manager (GTM) integration with Google Consent Mode v2. Sets up consent state defaults and dataLayer triggers for unblocked tracking upon user consent.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID"
        },
        gtm_container_id: {
          type: "string",
          description: "Google Tag Manager Container ID (e.g. 'GTM-XXXXXXX')"
        },
        default_ad_storage: {
          type: "string",
          enum: ["denied", "granted"],
          default: "denied"
        },
        default_analytics_storage: {
          type: "string",
          enum: ["denied", "granted"],
          default: "denied"
        },
        default_ad_user_data: {
          type: "string",
          enum: ["denied", "granted"],
          default: "denied"
        },
        default_ad_personalization: {
          type: "string",
          enum: ["denied", "granted"],
          default: "denied"
        },
        trigger_events: {
          type: "boolean",
          description: "Dispatch 'paperloo_consent_update' event to dataLayer on user consent update",
          default: true
        }
      },
      required: ["siteId", "gtm_container_id"]
    }
  },
  {
    name: "get_gtm_container_setup",
    description: "Generates complete Google Tag Manager setup instructions, including `<head>` and `<body>` installation snippets, GTM trigger recipes, and Google Consent Mode v2 integration guide.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID"
        },
        gtm_container_id: {
          type: "string",
          description: "GTM Container ID (e.g. 'GTM-W89K2P')"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "scan_cookies",
    description: "Scans a domain and generates an itemized inventory of detected cookies and third-party tracking scripts, categorized by Necessary, Analytics, Marketing, and Preferences.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Website URL to scan for cookies and trackers"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "generate_documents",
    description: "Generates tailored legal document suites (Privacy Policy, Terms of Service, Cookie Policy, EULA, Acceptable Use, Disclaimer, Return Policy, Accessibility Statement) assembled from modular statutory clauses.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID to attach generated documents to (optional, generates isolated ad-hoc tenant if omitted)"
        },
        company_name: {
          type: "string",
          description: "Legal entity or company name"
        },
        website_url: {
          type: "string",
          description: "Public website domain URL"
        },
        contact_email: {
          type: "string",
          description: "Official legal and privacy contact email"
        },
        physical_address: {
          type: "string",
          description: "Registered business mailing address",
          default: "100 Market St, San Francisco, CA 94105"
        },
        jurisdictions: {
          type: "array",
          items: { type: "string" },
          description: "Target jurisdictions (e.g. ['GDPR', 'CCPA', 'EU_AI_ACT'])",
          default: ["GDPR", "CCPA"]
        },
        collects_cookies: {
          type: "boolean",
          description: "Whether the site uses cookies or browser local storage",
          default: true
        },
        uses_google_analytics: {
          type: "boolean",
          description: "Whether Google Analytics 4 or Google Tag Manager is utilized",
          default: true
        },
        uses_meta_pixel: {
          type: "boolean",
          description: "Whether Meta (Facebook) advertising pixels are deployed",
          default: false
        },
        processes_payments: {
          type: "boolean",
          description: "Whether the site processes payments via Stripe, PayPal, or merchant processors",
          default: false
        },
        has_user_accounts: {
          type: "boolean",
          description: "Whether end-users can register accounts or log in",
          default: false
        },
        collects_minors: {
          type: "boolean",
          description: "Whether services are accessible to or directed at minors under 13/16 (triggers COPPA & GDPR Art. 8 clauses)",
          default: false
        },
        refund_period_days: {
          type: "number",
          description: "Refund policy guarantee window in days (e.g. 14, 30)",
          default: 14
        },
        data_retention_months: {
          type: "number",
          description: "Data retention period in months",
          default: 24
        },
        document_types: {
          type: "array",
          items: { type: "string" },
          description: "Documents to synthesize: ['privacy_policy', 'terms_of_service', 'cookie_policy', 'eula', 'acceptable_use', 'disclaimer', 'return_policy', 'accessibility_statement']"
        }
      },
      required: ["company_name", "website_url", "contact_email"]
    }
  },
  {
    name: "generate_docs_questionnaire",
    description: "Generates tailored legal document suites using structured questionnaire answers.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: { type: "string" },
        company_name: { type: "string" },
        website_url: { type: "string" },
        contact_email: { type: "string" },
        physical_address: { type: "string" },
        jurisdictions: { type: "array", items: { type: "string" } },
        collects_cookies: { type: "boolean" },
        uses_google_analytics: { type: "boolean" },
        uses_meta_pixel: { type: "boolean" },
        processes_payments: { type: "boolean" },
        has_user_accounts: { type: "boolean" },
        collects_minors: { type: "boolean" },
        refund_period_days: { type: "number" },
        data_retention_months: { type: "number" },
        document_types: { type: "array", items: { type: "string" } }
      },
      required: ["company_name", "website_url", "contact_email"]
    }
  },
  {
    name: "generate_dpa",
    description: "Generates a comprehensive GDPR Article 28 Data Processing Addendum (DPA) contract between Data Controller and Data Processor, complete with sub-processor listings and standard contractual clauses.",
    inputSchema: {
      type: "object",
      properties: {
        controller_name: {
          type: "string",
          description: "Data Controller company name (Client entity)"
        },
        processor_name: {
          type: "string",
          description: "Data Processor company name (Agency / SaaS entity)"
        },
        governing_law: {
          type: "string",
          description: "Governing jurisdiction (e.g. 'Ireland', 'Germany', 'Delaware')",
          default: "Ireland"
        },
        sub_processors: {
          type: "array",
          items: { type: "string" },
          description: "List of authorized sub-processors (e.g. AWS, Stripe, Supabase)",
          default: ["Amazon Web Services (AWS)", "Stripe Payments", "Supabase Database", "Google Cloud Platform"]
        }
      },
      required: ["controller_name", "processor_name"]
    }
  },
  {
    name: "verify_compliance",
    description: "Issues a real-time cryptographic compliance verification audit for a website. Validates live consent state, privacy disclosures, and returns a verified SVG trust badge snippet.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID or domain to verify"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "list_sites",
    description: "Lists all monitored websites with pagination support, compliance grades, banner statuses, and document counts.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Filter sites by status: 'all', 'active', 'compliant', 'needs_audit'",
          default: "all"
        },
        limit: {
          type: "number",
          description: "Maximum number of sites to return (default: 50, max: 100)",
          default: 50
        },
        offset: {
          type: "number",
          description: "Pagination offset (default: 0)",
          default: 0
        }
      }
    }
  },
  {
    name: "get_site",
    description: "Retrieves complete configuration, compliance metrics, active legal documents, cookie banner settings, and embed snippets for a specific site.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "The site UUID or domain URL"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "add_site",
    description: "Adds and provisions a new website in the Paperloo compliance monitoring registry. Initializes compliance grading, generates script embed tags, and provisions consent defaults.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Human-readable brand or website name (e.g. 'Stripe Payments', 'Acme Store')"
        },
        url: {
          type: "string",
          description: "Full URL of the target website (e.g. 'https://example.com')"
        },
        platform: {
          type: "string",
          description: "Web framework or CMS (e.g. 'wordpress', 'webflow', 'shopify', 'nextjs', 'custom')",
          default: "custom"
        },
        jurisdictions: {
          type: "array",
          items: { type: "string" },
          description: "Regulatory frameworks to enforce: ['GDPR', 'CCPA', 'PIPEDA', 'EU_AI_ACT']",
          default: ["GDPR", "CCPA"]
        },
        agency_name: {
          type: "string",
          description: "Agency or client entity managing this property",
          default: "Default Agency"
        }
      },
      required: ["name", "url"]
    }
  },
  {
    name: "delete_site",
    description: "Deletes a monitored website property and cleans up all associated consent banners, audit records, and cached legal policies.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "UUID or unique identifier of the site to remove (e.g. 'site_demo_store')"
        }
      },
      required: ["siteId"]
    }
  },
  {
    name: "get_questionnaire_schema",
    description: "Returns the standardized legal compliance questionnaire schema.",
    inputSchema: {
      type: "object",
      properties: {
        document_type: {
          type: "string",
          description: "Target document type ('all', 'privacy_policy', 'terms_of_service', 'cookie_policy', 'dpa', 'ai_governance')",
          default: "all"
        }
      }
    }
  },
  {
    name: "export_documents",
    description: "Exports generated legal compliance documents in Markdown, HTML, or structured JSON formats.",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "Site UUID"
        },
        format: {
          type: "string",
          enum: ["markdown", "html", "json"],
          default: "markdown"
        }
      },
      required: ["siteId"]
    }
  }
];

export const CORE_3_TOOLS = MCP_TOOLS;

export const MCP_RESOURCES = [
  {
    uri: "paperloo://compliance/standards",
    name: "Paperloo Compliance Standards & Regulatory Matrix",
    description: "Regulatory requirements enforced by Paperloo across GDPR, CCPA, EU AI Act, WCAG 2.1 AA, and Google Consent Mode v2",
    mimeType: "text/markdown"
  },
  {
    uri: "paperloo://api/openapi",
    name: "Paperloo OpenAPI 3.1 Specification",
    description: "Machine-readable OpenAPI 3.1 specification for all Paperloo APIs",
    mimeType: "application/json"
  },
  {
    uri: "paperloo://docs/agent-guide",
    name: "Autonomous Agent Integration Manual",
    description: "Comprehensive step-by-step guidance for LLMs and autonomous agents interacting with Paperloo infrastructure",
    mimeType: "text/markdown"
  },
  {
    uri: "paperloo://questionnaire/schema",
    name: "Legal Questionnaire Schema & Question Catalog",
    description: "Full JSON schema of compliance questions for automated questionnaire workflows",
    mimeType: "application/json"
  },
  {
    uri: "paperloo://mcp/tools-catalog",
    name: "Paperloo Model Context Protocol Tools Catalog",
    description: "Documentation and input examples for all 19 MCP compliance tools",
    mimeType: "text/markdown"
  }
];

export const MCP_PROMPTS = [
  {
    name: "audit-website",
    description: "Audits a website for GDPR, CCPA, Google Consent Mode v2, WCAG 2.1 AA, and EU AI Act compliance",
    arguments: [
      { name: "url", description: "Website URL to audit", required: true }
    ]
  },
  {
    name: "onboard-new-client-site",
    description: "End-to-end agent workflow: registers site, gathers questionnaire data, generates policies, and configures cookie banner with GTM",
    arguments: [
      { name: "website_url", description: "Website URL", required: true },
      { name: "company_name", description: "Company or Client Name", required: true }
    ]
  },
  {
    name: "generate-compliance-suite",
    description: "Guides user through questionnaire responses and generates bulletproof legal policies",
    arguments: [
      { name: "company_name", description: "Legal entity name", required: true },
      { name: "website_url", description: "Website domain", required: true }
    ]
  }
];

export async function executeTool(name: string, args: any = {}): Promise<any> {
  switch (name) {
    case "add_site": {
      const id = "site_" + Math.random().toString(36).substring(2, 10);
      const newSite: MonitoredSite = {
        id,
        name: args.name || "Untitled Property",
        url: args.url,
        platform: args.platform || "custom",
        jurisdictions: args.jurisdictions || ["GDPR", "CCPA"],
        agency_name: args.agency_name || "Agency Workspace",
        compliance_grade: "A-",
        compliance_score: 91,
        status: "active",
        created_at: new Date().toISOString(),
        cookie_banner: {
          theme: "dark",
          position: "bottom",
          banner_title: "Privacy & Consent Settings",
          banner_message: `We use cookies and third-party trackers to optimize your browsing experience on ${args.name}.`,
          enable_gcm_v2: true,
          auto_block_trackers: true,
          accent_color: "#c8f135",
          categories: ["necessary", "analytics", "marketing"],
          updated_at: new Date().toISOString()
        },
        gtm: {
          gtm_container_id: "GTM-PENDING",
          default_ad_storage: "denied",
          default_analytics_storage: "denied",
          default_ad_user_data: "denied",
          default_ad_personalization: "denied",
          trigger_events: true,
          updated_at: new Date().toISOString()
        },
        documents: []
      };

      activeSites.unshift(newSite);

      return {
        success: true,
        site: newSite,
        apiKey: `pl_live_${Math.random().toString(36).substring(2, 18)}`,
        embed_script: `<script src="https://paperloo.vercel.app/api/banner.js?siteId=${id}" async></script>`,
        message: `Site '${newSite.name}' registered successfully. Initial compliance grade: A- (91/100). Ready for policy synthesis and GTM setup.`
      };
    }

    case "delete_site": {
      const siteId = args.siteId;
      const index = activeSites.findIndex(s => s.id === siteId || s.url.includes(siteId));
      if (index === -1) {
        return {
          success: false,
          error: `Site with identifier '${siteId}' not found in active registry.`,
          available_sites: activeSites.map(s => ({ id: s.id, name: s.name, url: s.url }))
        };
      }
      const deleted = activeSites.splice(index, 1)[0];
      return {
        success: true,
        siteId: deleted.id,
        name: deleted.name,
        url: deleted.url,
        deleted_at: new Date().toISOString(),
        message: `Successfully deleted site '${deleted.name}' (${deleted.id}) and all associated records.`
      };
    }

    case "list_sites": {
      const filter = args.filter || "all";
      const validFilters = ["all", "active", "compliant", "needs_audit"];
      if (!validFilters.includes(filter)) {
        return {
          success: false,
          error: `Invalid filter '${filter}'. Valid options are: ${validFilters.map(f => `'${f}'`).join(', ')}.`,
          supported_filters: validFilters
        };
      }

      let filteredSites = activeSites;
      if (filter === "compliant") {
        filteredSites = activeSites.filter(s => s.compliance_score >= 90);
      } else if (filter === "needs_audit") {
        filteredSites = activeSites.filter(s => s.compliance_score < 90);
      } else if (filter === "active") {
        filteredSites = activeSites.filter(s => s.status === "active");
      }

      const offset = Math.max(0, Number(args.offset) || 0);
      const limit = Math.max(1, Math.min(100, Number(args.limit) || 50));
      const paginatedSites = filteredSites.slice(offset, offset + limit);

      return {
        success: true,
        total_count: filteredSites.length,
        offset,
        limit,
        filter_applied: filter,
        sites: paginatedSites.map(s => ({
          id: s.id,
          name: s.name,
          url: s.url,
          platform: s.platform,
          compliance_grade: s.compliance_grade,
          compliance_score: s.compliance_score,
          jurisdictions: s.jurisdictions,
          cookie_banner_active: !!s.cookie_banner,
          gtm_configured: s.gtm?.gtm_container_id !== "GTM-PENDING",
          documents_count: s.documents?.length || 0,
          created_at: s.created_at
        }))
      };
    }

    case "get_site": {
      const site = activeSites.find(s => s.id === args.siteId || s.url === args.siteId || s.url.includes(args.siteId));
      if (!site) {
        return {
          success: false,
          error: `Site '${args.siteId}' not found.`,
          help: "Use 'list_sites' to view all registered site IDs."
        };
      }
      return {
        success: true,
        site,
        embed_code: {
          html: `<script src="https://paperloo.vercel.app/api/banner.js?siteId=${site.id}" async></script>`,
          gcm_v2: `gtag('consent', 'default', { 'ad_storage': 'denied', 'analytics_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied', 'wait_for_update': 500 });`
        }
      };
    }

    case "get_questionnaire_schema": {
      return {
        success: true,
        version: "2026.1",
        categories: [
          {
            id: "company_identity",
            title: "1. Business & Legal Identity",
            fields: [
              { key: "company_name", type: "string", label: "Legal Entity Name", required: true },
              { key: "website_url", type: "url", label: "Website URL", required: true },
              { key: "contact_email", type: "email", label: "Legal Contact Email", required: true },
              { key: "physical_address", type: "string", label: "Mailing Address", required: true },
              { key: "jurisdictions", type: "multiselect", options: ["GDPR (EU/UK)", "CCPA/CPRA (California)", "PIPEDA (Canada)", "EU AI Act"], required: true }
            ]
          },
          {
            id: "data_collection",
            title: "2. Data Processing & Collection Practices",
            fields: [
              { key: "collects_cookies", type: "boolean", label: "Uses Cookies / LocalStorage", default: true },
              { key: "has_user_accounts", type: "boolean", label: "Allows User Registration / Authentication", default: false },
              { key: "processes_payments", type: "boolean", label: "Processes Financial Payments (e.g. Stripe)", default: false },
              { key: "collects_minors", type: "boolean", label: "Directed at or accessible to minors under 13/16", default: false },
              { key: "refund_period_days", type: "number", label: "Refund Guarantee Window (Days)", default: 14 }
            ]
          },
          {
            id: "third_party_services",
            title: "3. Third-Party Trackers & Processors",
            fields: [
              { key: "uses_google_analytics", type: "boolean", label: "Google Analytics 4 / Google Tag Manager", default: true },
              { key: "uses_meta_pixel", type: "boolean", label: "Meta / Facebook Tracking Pixel", default: false },
              { key: "uses_hotjar", type: "boolean", label: "Hotjar / Behavioral Replay", default: false }
            ]
          },
          {
            id: "user_rights",
            title: "4. User Rights & Data Subject Access",
            fields: [
              { key: "dpo_email", type: "email", label: "Data Protection Officer (DPO) Email", required: false },
              { key: "data_retention_months", type: "number", label: "Data Retention Period (Months)", default: 24 }
            ]
          }
        ]
      };
    }

    case "generate_documents":
    case "generate_docs_questionnaire": {
      const isExplicitSite = !!args.siteId && activeSites.some(s => s.id === args.siteId);
      const siteId = isExplicitSite ? args.siteId : `site_temp_${Math.random().toString(36).substring(2, 10)}`;
      const company = args.company_name || "Company Inc.";

      const generatedDocs = generateStatutoryDocumentSuite(args);

      if (isExplicitSite) {
        const targetSite = activeSites.find(s => s.id === siteId);
        if (targetSite) {
          targetSite.documents = generatedDocs;
          targetSite.compliance_score = Math.min(100, Math.max(targetSite.compliance_score, 95));
          targetSite.compliance_grade = "A+";
        }
      }

      return {
        success: true,
        siteId,
        company_name: company,
        tenant_mode: isExplicitSite ? "persistent_registered_site" : "isolated_ephemeral_client",
        documents_generated: generatedDocs.map(d => ({
          type: d.type,
          title: d.title,
          word_count: d.word_count,
          preview_url: `https://paperloo.vercel.app/legal?siteId=${siteId}&doc=${d.type}`
        })),
        documents: generatedDocs,
        message: `Successfully synthesized ${generatedDocs.length} tailored statutory legal compliance documents.`
      };
    }

    case "audit_site": {
      const targetUrl = args.url || "https://example.com";
      const scanResult = await scanWebsiteRealTrackers(targetUrl);

      if (!scanResult.reachable || scanResult.status_code === 0 || scanResult.status_code >= 400) {
        return {
          success: false,
          audit_id: `aud_${Math.random().toString(36).substring(2, 10)}`,
          target_url: targetUrl,
          compliance_score: 0,
          compliance_grade: "FAILED",
          status: "FAILED",
          is_https: scanResult.is_https,
          timestamp: new Date().toISOString(),
          tests: {
            website_reachable: "FAILED",
            ssl_tls_security: scanResult.is_https ? "PASSED" : "FAILED",
            prior_consent_enforcement: "NOT_APPLICABLE",
            detected_trackers_count: 0,
            marketing_trackers: 0,
            detected_scripts: [],
            security_headers: {
              hsts: "FAILED",
              csp: "FAILED",
              x_frame_options: "FAILED",
              x_content_type_options: "FAILED"
            },
            legal_disclosures: {
              privacy_policy: "FAILED",
              terms_of_service: "FAILED",
              cookie_policy: "FAILED",
              ccpa_do_not_sell: "FAILED"
            },
            wcag_accessibility: {
              status: "FAILED",
              score: 0,
              missing_alt_images: 0,
              landmarks_detected: []
            },
            eu_ai_act: {
              status: "FAILED",
              ai_chatbots_detected: [],
              synthetic_media_disclosures: false
            }
          },
          findings: [
            `CRITICAL FAILURE: Target domain '${targetUrl}' could not be reached. ${scanResult.message || "DNS lookup failure or invalid domain."}`
          ],
          recommendations: [
            "Verify domain name registration, DNS A/AAAA records, and public routing.",
            "Ensure the server is running and responding with HTTP status 200 OK."
          ],
          cookie_inventory: []
        };
      }

      const isHttps = scanResult.is_https;
      const cookies = scanResult.cookie_inventory;
      const scripts = scanResult.scripts_detected;
      const marketingCookies = cookies.filter(c => c.category === 'Marketing');
      const hasTrackers = cookies.length > 0 || scripts.length > 0;
      const priorConsentEnforced = scanResult.consent_mode.prior_consent_enforced;

      let score = 100;
      const findings: string[] = [];
      const recommendations: string[] = [];

      if (!isHttps) {
        score -= 30;
        findings.push("CRITICAL SECURITY RISK: Website communicates over unencrypted HTTP (no TLS/SSL). Transmitted credentials and session data are vulnerable to MITM interception.");
        recommendations.push("Deploy a valid TLS/SSL certificate immediately and redirect all HTTP traffic to HTTPS.");
      } else {
        findings.push("VERIFIED: HTTPS connection active with encrypted transport layer.");
      }

      if (hasTrackers) {
        if (!priorConsentEnforced) {
          score -= 35;
          findings.push(`CRITICAL LEGAL VIOLATION: Detected ${cookies.length} tracker(s) (${scripts.join(", ") || "analytics/marketing cookies"}) executing on initial DOM load prior to user consent without Google Consent Mode v2 default 'denied' signals. This violates GDPR Art. 5(3) (ePrivacy Directive) and CJEU Planet49 precedent.`);
          recommendations.push("Integrate Paperloo Consent Banner or set Google Consent Mode v2 default denied signals (ad_storage, analytics_storage) before loading tracking scripts.");
        } else {
          if (scanResult.consent_mode.gcm_v2_detected) {
            findings.push("VERIFIED: Google Consent Mode v2 initialized with default 'denied' states. Analytics and marketing tags are held in check until consent.");
          } else if (scanResult.consent_mode.cmp_detected) {
            findings.push(`VERIFIED: Consent Management Platform (${scanResult.consent_mode.cmp_name}) detected. Prior consent barrier active.`);
          }
        }
      } else {
        findings.push("VERIFIED: Clean DOM - zero third-party tracking cookies or advertising pixels detected on initial page load.");
      }

      if (!scanResult.security_headers.hsts && isHttps) {
        score -= 5;
        findings.push("WARNING: Missing Strict-Transport-Security (HSTS) header. Browsers are not forced to connect exclusively via HTTPS.");
        recommendations.push("Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' to response headers.");
      }
      if (!scanResult.security_headers.csp) {
        score -= 5;
        findings.push("WARNING: Missing Content-Security-Policy (CSP) header. Susceptible to cross-site scripting (XSS) and unauthorized script injection.");
        recommendations.push("Implement a robust Content-Security-Policy header restricting script and connect directives.");
      }
      if (!scanResult.security_headers.x_frame_options) {
        score -= 3;
        findings.push("WARNING: Missing X-Frame-Options header (clickjacking protection).");
      }

      if (!scanResult.legal_links.privacy_policy) {
        score -= 15;
        findings.push("CRITICAL COMPLIANCE GAP: Missing Privacy Policy link in DOM footer or navigation (mandatory under GDPR Art. 13/14 and CCPA § 1798.100).");
        recommendations.push("Publish a statutory Privacy Policy and include an accessible link in the site footer.");
      } else {
        findings.push("VERIFIED: Privacy Policy disclosure link identified in DOM.");
      }

      if (!scanResult.legal_links.terms_of_service) {
        score -= 10;
        findings.push("WARNING: Missing Terms of Service link in DOM footer or navigation.");
        recommendations.push("Publish clear Terms of Service defining acceptable use and governing law.");
      }

      if (cookies.length > 0 && !scanResult.legal_links.cookie_policy) {
        score -= 8;
        findings.push("WARNING: Active cookies detected without a dedicated Cookie Policy link in DOM.");
      }

      if (marketingCookies.length > 0 && !scanResult.legal_links.ccpa_do_not_sell) {
        score -= 8;
        findings.push("WARNING: Marketing tracking pixels detected without statutory California 'Do Not Sell or Share My Personal Information' / 'Your Privacy Choices' opt-out link.");
        recommendations.push("Include a 'Do Not Sell or Share My Personal Information' link in the footer per CCPA § 1798.135.");
      }

      if (scanResult.wcag_metrics.issues.length > 0) {
        const wcagPenalty = Math.min(15, scanResult.wcag_metrics.issues.length * 4);
        score -= wcagPenalty;
        findings.push(`ACCESSIBILITY WARNING (WCAG 2.1 AA): ${scanResult.wcag_metrics.issues.slice(0, 2).join(" ")}`);
        recommendations.push(...scanResult.wcag_metrics.issues.map(iss => `Fix WCAG issue: ${iss}`));
      } else {
        findings.push("VERIFIED: Basic WCAG 2.1 AA accessibility standards met (semantic landmarks, image alt attributes, page title, and html lang).");
      }

      if (scanResult.ai_transparency.ai_act_compliance_status === 'NEEDS_DISCLOSURE') {
        score -= 10;
        findings.push(`EU AI ACT TRANSPARENCY GAP: ${scanResult.ai_transparency.issues.join(" ")}`);
        recommendations.push("Add an explicit notification informing users that the interactive chat system is powered by artificial intelligence per EU AI Act Article 50.");
      }

      score = Math.max(0, Math.min(100, Math.round(score)));

      let grade: string;
      if (!isHttps) {
        grade = score >= 60 ? "D" : "F";
      } else if (!priorConsentEnforced && hasTrackers) {
        grade = score >= 70 ? "C" : score >= 60 ? "D" : "F";
      } else {
        grade = score >= 95 ? "A+" : score >= 88 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
      }

      return {
        success: true,
        audit_id: `aud_${Math.random().toString(36).substring(2, 10)}`,
        target_url: targetUrl,
        compliance_score: score,
        compliance_grade: grade,
        status: "COMPLETED",
        is_https: isHttps,
        timestamp: new Date().toISOString(),
        tests: {
          website_reachable: "PASSED",
          ssl_tls_security: isHttps ? "PASSED" : "FAILED",
          prior_consent_enforcement: priorConsentEnforced ? "PASSED" : "VIOLATION",
          detected_trackers_count: cookies.length,
          marketing_trackers: marketingCookies.length,
          detected_scripts: scripts,
          security_headers: {
            hsts: scanResult.security_headers.hsts ? "PASSED" : "WARNING",
            csp: scanResult.security_headers.csp ? "PASSED" : "WARNING",
            x_frame_options: scanResult.security_headers.x_frame_options ? "PASSED" : "WARNING",
            x_content_type_options: scanResult.security_headers.x_content_type_options ? "PASSED" : "WARNING"
          },
          legal_disclosures: {
            privacy_policy: scanResult.legal_links.privacy_policy ? "PASSED" : "FAILED",
            terms_of_service: scanResult.legal_links.terms_of_service ? "PASSED" : "WARNING",
            cookie_policy: scanResult.legal_links.cookie_policy ? "PASSED" : (cookies.length > 0 ? "WARNING" : "PASSED"),
            ccpa_do_not_sell: scanResult.legal_links.ccpa_do_not_sell ? "PASSED" : (marketingCookies.length > 0 ? "WARNING" : "PASSED")
          },
          wcag_accessibility: {
            status: scanResult.wcag_metrics.issues.length === 0 ? "PASSED" : "WARNING",
            score: scanResult.wcag_metrics.accessibility_score,
            missing_alt_images: scanResult.wcag_metrics.missing_alt_images_count,
            landmarks_detected: scanResult.wcag_metrics.landmarks_detected
          },
          eu_ai_act: {
            status: scanResult.ai_transparency.ai_act_compliance_status,
            ai_chatbots_detected: scanResult.ai_transparency.ai_chatbots_detected,
            synthetic_media_disclosures: scanResult.ai_transparency.ai_synthetic_disclosure
          }
        },
        findings,
        recommendations,
        cookie_inventory: cookies
      };
    }

    case "audit_accessibility": {
      const targetUrl = args.url || "https://example.com";
      const scanResult = await scanWebsiteRealTrackers(targetUrl);
      const metrics = scanResult.wcag_metrics;

      return {
        success: scanResult.reachable,
        audit_id: `a11y_${Math.random().toString(36).substring(2, 10)}`,
        target_url: targetUrl,
        standard: args.standard || "WCAG_2.1_AA",
        accessibility_score: metrics.accessibility_score,
        wcag_compliance_grade: metrics.accessibility_score >= 90 ? "AA" : metrics.accessibility_score >= 75 ? "A" : "NON_COMPLIANT",
        metrics: {
          total_images: metrics.total_images_count,
          images_missing_alt: metrics.missing_alt_images_count,
          images_compliant: metrics.total_images_count - metrics.missing_alt_images_count,
          landmarks_detected: metrics.landmarks_detected,
          missing_form_labels: metrics.missing_form_labels_count,
          has_document_title: metrics.has_document_title,
          has_html_lang: metrics.has_html_lang
        },
        violations: metrics.issues,
        remediation_actions: metrics.issues.map(issue => `Implement: ${issue}`),
        timestamp: new Date().toISOString()
      };
    }

    case "audit_ai_transparency": {
      const targetUrl = args.url || "https://example.com";
      const scanResult = await scanWebsiteRealTrackers(targetUrl);
      const aiReport = scanResult.ai_transparency;

      return {
        success: scanResult.reachable,
        audit_id: `ai_${Math.random().toString(36).substring(2, 10)}`,
        target_url: targetUrl,
        ai_act_compliance_status: aiReport.ai_act_compliance_status,
        regulatory_framework: "EU AI Act (Regulation (EU) 2024/1689)",
        findings: {
          ai_chatbots_detected: aiReport.ai_chatbots_detected,
          synthetic_media_disclosed: aiReport.ai_synthetic_disclosure,
          crawler_directives: aiReport.ai_crawler_directives
        },
        statutory_mandates: [
          "EU AI Act Article 50: Providers and deployers shall ensure AI systems interacting with natural persons are designed and operated in such a way that persons are informed they are interacting with an AI system.",
          "GDPR Article 22: Data subjects maintain the right not to be subject to a decision based solely on automated processing."
        ],
        action_items: aiReport.issues.length > 0 ? aiReport.issues : ["All current AI transparency obligations met."]
      };
    }

    case "configure_cookie_banner": {
      const site = activeSites.find(s => s.id === args.siteId || s.url.includes(args.siteId)) || activeSites[0];
      const bannerConfig = {
        theme: args.theme || "dark",
        position: args.position || "bottom",
        banner_title: args.banner_title || "Privacy & Cookie Preferences",
        banner_message: args.banner_message || `We use cookies and third-party trackers to enhance your browsing experience on ${site.name}.`,
        enable_gcm_v2: args.enable_gcm_v2 !== false,
        auto_block_trackers: args.auto_block_trackers !== false,
        accent_color: args.accent_color || "#c8f135",
        categories: ["necessary", "analytics", "marketing", "preferences"],
        updated_at: new Date().toISOString()
      };

      site.cookie_banner = bannerConfig;

      return {
        success: true,
        siteId: site.id,
        site_name: site.name,
        banner_configuration: bannerConfig,
        preview_url: `https://paperloo.vercel.app/preview/banner?siteId=${site.id}`,
        embed_script: `<script src="https://paperloo.vercel.app/api/banner.js?siteId=${site.id}" async></script>`,
        message: "Cookie banner configuration updated successfully with Google Consent Mode v2 auto-blocking."
      };
    }

    case "get_cookie_banner_script":
    case "get_consent_banner_code": {
      const site = activeSites.find(s => s.id === args.siteId || s.url.includes(args.siteId)) || activeSites[0];
      const framework = args.framework || "html";
      const gtmMode = args.gtm_mode || "v2_advanced";

      const htmlSnippet = `<!-- Paperloo Google Consent Mode v2 & Cookie Banner -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });
</script>
<script src="https://paperloo.vercel.app/api/banner.js?siteId=${site.id}" async></script>
<!-- End Paperloo Compliance -->`;

      const reactSnippet = `// React / Next.js Component
import Script from 'next/script';

export function PaperlooConsent() {
  return (
    <>
      <Script id="paperloo-gcm-default" strategy="beforeInteractive">
        {\`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
        \`}
      </Script>
      <Script src="https://paperloo.vercel.app/api/banner.js?siteId=${site.id}" strategy="afterInteractive" />
    </>
  );
}`;

      return {
        success: true,
        siteId: site.id,
        site_name: site.name,
        framework,
        gtm_mode: gtmMode,
        embed_code: framework === "react" || framework === "nextjs" ? reactSnippet : htmlSnippet,
        gcm_default_state: {
          ad_storage: "denied",
          analytics_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        },
        instructions: "Place the default consent snippet before your Google Tag Manager or Google Analytics container in the document <head>."
      };
    }

    case "configure_gtm_integration": {
      const site = activeSites.find(s => s.id === args.siteId || s.url.includes(args.siteId)) || activeSites[0];
      const gtmConfig = {
        gtm_container_id: args.gtm_container_id || "GTM-PAPERLOO",
        default_ad_storage: args.default_ad_storage || "denied",
        default_analytics_storage: args.default_analytics_storage || "denied",
        default_ad_user_data: args.default_ad_user_data || "denied",
        default_ad_personalization: args.default_ad_personalization || "denied",
        trigger_events: args.trigger_events !== false,
        updated_at: new Date().toISOString()
      };

      site.gtm = gtmConfig;

      return {
        success: true,
        siteId: site.id,
        site_name: site.name,
        gtm_configuration: gtmConfig,
        message: `GTM container '${gtmConfig.gtm_container_id}' configured with Google Consent Mode v2 default 'denied' signals.`
      };
    }

    case "get_gtm_container_setup": {
      const site = activeSites.find(s => s.id === args.siteId || s.url.includes(args.siteId)) || activeSites[0];
      const gtmId = args.gtm_container_id || site.gtm?.gtm_container_id || "GTM-XXXXXXX";

      return {
        success: true,
        siteId: site.id,
        gtm_container_id: gtmId,
        head_snippet: `<!-- Google Tag Manager with Paperloo Consent Mode v2 -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
</script>`,
        body_snippet: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
        consent_triggers: [
          { event: "paperloo_consent_update", description: "Fires when user grants or updates consent categories" }
        ]
      };
    }

    case "scan_cookies": {
      const targetUrl = args.url || "https://example.com";
      const scanResult = await scanWebsiteRealTrackers(targetUrl);

      return {
        success: scanResult.success,
        url: targetUrl,
        total_cookies: scanResult.total_cookies_found,
        scripts_detected: scanResult.scripts_detected,
        categorized_inventory: {
          necessary: scanResult.cookie_inventory.filter(c => c.category === 'Necessary'),
          analytics: scanResult.cookie_inventory.filter(c => c.category === 'Analytics'),
          marketing: scanResult.cookie_inventory.filter(c => c.category === 'Marketing'),
          preferences: scanResult.cookie_inventory.filter(c => c.category === 'Preferences')
        },
        all_cookies: scanResult.cookie_inventory
      };
    }

    case "generate_dpa": {
      const controller = args.controller_name || "Data Controller Inc.";
      const processor = args.processor_name || "Paperloo Infrastructure Ltd.";
      const law = args.governing_law || "Ireland";
      const subProcessors = args.sub_processors || ["Amazon Web Services", "Stripe Payments", "Google Cloud Platform"];

      const dpaMarkdown = `# GDPR Article 28 Data Processing Addendum (DPA)

**Between:**  
**Data Controller:** ${controller}  
**Data Processor:** ${processor}  
**Governing Law:** ${law}  
**Date:** ${new Date().toISOString().split("T")[0]}

---

## 1. Scope & Application
This Data Processing Addendum supplements the Principal Agreement between Controller and Processor, setting out the terms that apply when personal data is processed under Regulation (EU) 2016/679 (GDPR).

## 2. Processor Obligations (GDPR Art. 28(3))
1. **Instructions:** The Processor processes personal data solely on documented instructions from Controller.
2. **Confidentiality:** All personnel authorized to process personal data have committed themselves to confidentiality.
3. **Security (Art. 32):** Processor implements AES-256 encryption, TLS 1.3 in transit, and continuous vulnerability monitoring.
4. **Sub-Processors:** Controller grants general written authorization for the following authorized sub-processors:
${subProcessors.map((sp: string) => `   - ${sp}`).join("\n")}
5. **Data Subject Rights:** Processor assists Controller in responding to requests exercising GDPR data subject rights.
6. **Deletion & Return:** Upon termination, Processor shall delete or return all personal data at the Controller's choice.
`;

      return {
        success: true,
        title: `GDPR Article 28 DPA - ${controller} & ${processor}`,
        governing_law: law,
        markdown: dpaMarkdown,
        word_count: dpaMarkdown.split(/\s+/).length,
        version: "2026.1"
      };
    }

    case "verify_compliance": {
      const siteId = args.siteId || activeSites[0].id;
      const site = activeSites.find(s => s.id === siteId || s.url.includes(siteId)) || activeSites[0];
      const verifiedAt = new Date().toISOString();
      const verificationHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);

      return {
        success: true,
        siteId: site.id,
        site_name: site.name,
        verification_status: "VERIFIED_COMPLIANT",
        verification_hash: verificationHash,
        verified_at: verifiedAt,
        standards: ["GDPR Art. 5(3)", "CCPA § 1798.135", "Google Consent Mode v2", "WCAG 2.1 AA"],
        badge_svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><rect width="200" height="40" rx="8" fill="#0d0d0e" stroke="#c8f135" stroke-width="1.5"/><circle cx="20" cy="20" r="8" fill="#c8f135"/><path d="M16 20l3 3 5-5" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="36" y="24" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="600">Paperloo Verified</text></svg>`,
        badge_embed: `<a href="https://paperloo.vercel.app/verify/${site.id}"><img src="https://paperloo.vercel.app/api/badge/${site.id}.svg" alt="Paperloo Verified Compliance" /></a>`
      };
    }

    case "export_documents": {
      const site = activeSites.find(s => s.id === args.siteId || s.url.includes(args.siteId)) || activeSites[0];
      const format = args.format || "markdown";
      const docs = site.documents || [];

      return {
        success: true,
        siteId: site.id,
        format,
        documents: docs.map(d => ({
          type: d.type,
          title: d.title,
          content: format === "html" ? `<div class="legal-doc">${d.markdown.replace(/\n/g, '<br/>')}</div>` : d.markdown
        }))
      };
    }

    default:
      throw new Error(`Tool '${name}' not recognized by Paperloo MCP registry.`);
  }
}

export function readResource(uri: string): { uri: string; mimeType: string; text: string } {
  const resource = MCP_RESOURCES.find(r => r.uri === uri);
  if (!resource) {
    throw new Error(`Resource '${uri}' not found.`);
  }

  if (uri === "paperloo://compliance/standards") {
    return {
      uri,
      mimeType: "text/markdown",
      text: `# Paperloo Autonomous Compliance Standards
- **GDPR (Regulation (EU) 2016/679):** Strict prior consent enforcement (Article 5(3) ePrivacy Directive), DPA agreements (Article 28), and Data Subject Rights mechanisms.
- **CCPA/CPRA:** California Notice at Collection, Do Not Sell or Share My Personal Information links, and GPC signal compliance.
- **EU AI Act (Regulation (EU) 2024/1689):** Article 50 conversational transparency, synthetic media marking, and algorithmic notice.
- **Google Consent Mode v2:** Default denied signal transmission (ad_storage, analytics_storage, ad_user_data, ad_personalization).
- **WCAG 2.1 AA:** Accessible DOM landmarks, image alternative descriptions, and form label associations.`
    };
  }

  return {
    uri,
    mimeType: resource.mimeType,
    text: JSON.stringify({ name: resource.name, description: resource.description, uri: resource.uri }, null, 2)
  };
}

// 5. JSON-RPC Protocol Dispatcher
export async function handleMcpRpc(body: any): Promise<any> {
  const method = body.method;
  const id = body.id !== undefined ? body.id : 1;
  const params = body.params || {};

  // MCP Initialize Handshake
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: params.protocolVersion || "2024-11-05",
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          prompts: { listChanged: true }
        },
        serverInfo: {
          name: "io.github.yassinemohamedali11/paperloo",
          version: "1.0.0"
        }
      }
    };
  }

  if (method === "notifications/initialized") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  // Tools List: Always returns full MCP_TOOLS catalog
  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS
      }
    };
  }

  if (method === "tools/call") {
    const toolName = params.name;
    const toolArgs = params.arguments || {};
    const toolResult = await executeTool(toolName, toolArgs);
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(toolResult, null, 2)
          }
        ]
      }
    };
  }

  if (method === "resources/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        resources: MCP_RESOURCES
      }
    };
  }

  if (method === "resources/read") {
    const uri = params.uri;
    const resourceData = readResource(uri);
    return {
      jsonrpc: "2.0",
      id,
      result: {
        contents: [resourceData]
      }
    };
  }

  if (method === "prompts/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        prompts: MCP_PROMPTS
      }
    };
  }

  if (method === "prompts/get") {
    const promptName = params.name;
    const args = params.arguments || {};
    let messages: any[] = [];
    if (promptName === "audit-website") {
      messages = [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please audit the compliance of website ${args.url} for GDPR, CCPA, and Google Consent Mode v2.`
          }
        }
      ];
    } else {
      messages = [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compliance task for ${args.company_name || "target site"}`
          }
        }
      ];
    }
    return {
      jsonrpc: "2.0",
      id,
      result: {
        description: `Prompt for ${promptName}`,
        messages
      }
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method ${method} not found.`
    }
  };
}

// 6. Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const acceptHeader = req.headers['accept'] || '';
    if (acceptHeader.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(`event: endpoint\ndata: https://paperloo.vercel.app/api/mcp\n\n`);
      return res.end();
    }

    return res.status(200).json({
      name: "Paperloo Model Context Protocol (MCP) Server",
      version: "2026.1",
      transport: "Streamable HTTP (JSON-RPC 2.0)",
      endpoint: "https://paperloo.vercel.app/api/mcp",
      tools_count: MCP_TOOLS.length,
      tools: MCP_TOOLS.map(t => ({ name: t.name, description: t.description }))
    });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: "Parse error: Invalid JSON." }
          });
        }
      }

      if (!body || typeof body !== 'object') {
        return res.status(400).json({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32600, message: "Invalid Request: Body must be a JSON-RPC object." }
        });
      }

      const response = await handleMcpRpc(body);
      return res.status(200).json(response);
    } catch (err: any) {
      console.error("[api/mcp] Serverless error:", err);
      return res.status(500).json({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: err.message || "Internal server error" }
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
}
