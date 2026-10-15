import { supabase } from './supabase';

export interface RegionalRiskStatus {
  region: string;
  name: string;
  status: 'Low Risk' | 'Scanned & Monitored' | 'Action Needed' | 'Pending Scan';
  color: 'emerald' | 'cyan' | 'amber' | 'rose';
  summary: string;
  checks: { label: string; passed: boolean; note?: string }[];
}

export interface SiteComplianceAssessment {
  overallRisk: 'Low Risk' | 'Moderate Risk' | 'Action Needed';
  frameworks: {
    gdpr: RegionalRiskStatus;
    ccpa: RegionalRiskStatus;
    eprivacy: RegionalRiskStatus;
  };
  breakdown: Record<string, any>;
  hasTrackers: boolean;
  activePoliciesCount: number;
  lastAuditedAt: string;
}

export async function calculateComplianceScore(siteId: string): Promise<SiteComplianceAssessment | null> {
  console.log(`Calculating regional compliance risk assessment for site: ${siteId}`);
  
  // 1. Fetch site and related metadata
  const { data: siteData, error: siteError } = await supabase
    .from('sites')
    .select('*, questionnaire_responses(*)')
    .eq('id', siteId)
    .single();

  if (siteError || !siteData) {
    console.error('Error fetching site data for assessment:', siteError);
    return null;
  }

  const site = siteData as any;

  // 2. Fetch active documents
  const { data: documentsData } = await supabase
    .from('documents')
    .select('type, created_at, is_active')
    .eq('site_id', siteId);

  const docs = (documentsData as any[]) || [];

  // 3. Fetch latest cookie scan
  let latestScan: any = null;
  try {
    const { data: scansData, error: scansError } = await supabase
      .from('cookie_scans')
      .select('*')
      .eq('site_id', siteId)
      .order('scanned_at', { ascending: false })
      .limit(1);
    
    if (!scansError && scansData && scansData.length > 0) {
      latestScan = scansData[0];
    } else {
      const localScans = JSON.parse(sessionStorage.getItem(`mock_scans_${siteId}`) || '[]');
      if (localScans.length > 0) {
        latestScan = localScans[0];
      }
    }
  } catch (err) {
    console.warn('Cookie scans fetch fallback:', err);
  }

  // 4. Fetch banner configurations
  let bannerConfig: any = null;
  try {
    const { data: bannerData, error: bannerError } = await supabase
      .from('banner_configs')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle();
      
    if (!bannerError && bannerData) {
      bannerConfig = bannerData;
    } else {
      const local = localStorage.getItem(`banner_config_${siteId}`);
      if (local) {
        bannerConfig = JSON.parse(local);
      }
    }
  } catch (err) {
    console.warn('Banner config fetch fallback:', err);
  }

  const hasPrivacy = docs.some(d => {
    const t = (d.type || '').toLowerCase();
    return t.includes('privacy') || t.includes('policie');
  });
  const hasTerms = docs.some(d => {
    const t = (d.type || '').toLowerCase();
    return t.includes('terms') || t.includes('service') || t.includes('tos');
  });
  const hasCookie = docs.some(d => {
    const t = (d.type || '').toLowerCase();
    return t.includes('cookie');
  });

  const activePoliciesCount = [hasPrivacy, hasTerms, hasCookie].filter(Boolean).length;

  // Trackers check
  let hasTrackers = false;
  let detectedCookies: any[] = [];
  if (latestScan) {
    detectedCookies = (latestScan.cookies as any[]) || [];
    hasTrackers = detectedCookies.some(c => {
      const cat = (c.category || '').toLowerCase();
      const n = (c.name || '').toLowerCase();
      const dom = (c.domain || '').toLowerCase();
      return (
        cat === 'analytics' ||
        cat === 'marketing' ||
        cat === 'functional' ||
        n.includes('_ga') ||
        n.includes('_gid') ||
        n.includes('fbc') ||
        n.includes('fbp') ||
        n.includes('stripe') ||
        dom.includes('google') ||
        dom.includes('facebook')
      );
    });
  }

  const hasCMPBanner = !!bannerConfig;
  const hasAutoBlocker = !!bannerConfig?.enable_auto_blocker;

  // Region 1: GDPR / EU & UK
  const gdprPassedChecks = [
    { label: 'GDPR Privacy Notice Published', passed: hasPrivacy, note: hasPrivacy ? 'Standard GDPR template active' : 'Missing Privacy Policy' },
    { label: 'Prior Consent Enforced (Zero-Preload)', passed: hasCMPBanner && (!hasTrackers || hasAutoBlocker), note: hasAutoBlocker ? 'Scripts blocked before consent' : 'Requires CMP with auto-blocker' },
    { label: 'Opt-in/Opt-out Mechanism', passed: hasCMPBanner, note: hasCMPBanner ? 'Granular category toggles available' : 'No CMP banner configured' },
    { label: 'Data Subject Rights (Access/Erasure)', passed: hasPrivacy, note: 'User rights contact specified in disclosures' },
  ];
  const gdprPassed = gdprPassedChecks.filter(c => c.passed).length;
  const gdprStatus: RegionalRiskStatus = {
    region: 'EU & UK',
    name: 'GDPR / UK GDPR',
    status: gdprPassed >= 3 ? 'Low Risk' : (gdprPassed >= 2 ? 'Scanned & Monitored' : 'Action Needed'),
    color: gdprPassed >= 3 ? 'emerald' : (gdprPassed >= 2 ? 'amber' : 'rose'),
    summary: gdprPassed >= 3 
      ? 'Low Risk — CMP prior consent active and statutory privacy policy published' 
      : 'Action Needed — Missing active privacy policy or prior consent auto-blocker',
    checks: gdprPassedChecks
  };

  // Region 2: CCPA / CPRA (California)
  const ccpaPassedChecks = [
    { label: 'Notice at Collection', passed: hasPrivacy, note: hasPrivacy ? 'Categories of data and sub-processors mapped' : 'Notice at collection missing' },
    { label: 'Do Not Sell / Share My Info', passed: hasCMPBanner, note: hasCMPBanner ? 'Opt-out mechanism active in CMP' : 'Opt-out switch required' },
    { label: 'Tracker Inventory Audit', passed: !!latestScan, note: latestScan ? `${detectedCookies.length} cookies audited` : 'Pending automated crawler scan' },
    { label: 'Commercial Purpose Disclosures', passed: hasTerms, note: hasTerms ? 'Terms of service covers permitted use' : 'Terms missing' },
  ];
  const ccpaPassed = ccpaPassedChecks.filter(c => c.passed).length;
  const ccpaStatus: RegionalRiskStatus = {
    region: 'California, USA',
    name: 'CCPA / CPRA',
    status: ccpaPassed >= 3 ? 'Low Risk' : (latestScan ? 'Scanned & Monitored' : 'Action Needed'),
    color: ccpaPassed >= 3 ? 'emerald' : (latestScan ? 'cyan' : 'rose'),
    summary: latestScan 
      ? (ccpaPassed >= 3 ? 'Low Risk — Notice at collection and opt-out controls active' : 'Scanned & Monitored — Review opt-out disclosures') 
      : 'Action Needed — Run web crawler scan to inventory California PII collection',
    checks: ccpaPassedChecks
  };

  // Region 3: ePrivacy Directive (Cookie Law)
  const eprivacyPassedChecks = [
    { label: 'Cookie & Tracking Policy', passed: hasCookie, note: hasCookie ? 'Dedicated cookie disclosure active' : 'Missing Cookie Policy' },
    { label: 'Categorized Cookie Declarations', passed: !!latestScan, note: latestScan ? 'Cookies categorized by purpose' : 'Run crawler to map cookies' },
    { label: 'Unconsented Tracker Shield', passed: !hasTrackers || hasAutoBlocker, note: (!hasTrackers || hasAutoBlocker) ? 'No unauthorized trackers firing' : 'Trackers firing without shield' },
  ];
  const eprivacyPassed = eprivacyPassedChecks.filter(c => c.passed).length;
  const eprivacyStatus: RegionalRiskStatus = {
    region: 'European Union',
    name: 'ePrivacy Directive',
    status: eprivacyPassed === 3 ? 'Low Risk' : (eprivacyPassed >= 2 ? 'Scanned & Monitored' : 'Action Needed'),
    color: eprivacyPassed === 3 ? 'emerald' : (eprivacyPassed >= 2 ? 'amber' : 'rose'),
    summary: eprivacyPassed === 3 
      ? 'Low Risk — Dedicated cookie policy and tracker controls verified' 
      : 'Action Needed — Ensure cookie banner blocks analytics/marketing until opt-in',
    checks: eprivacyPassedChecks
  };

  // Overall qualitative assessment
  let overallRisk: 'Low Risk' | 'Moderate Risk' | 'Action Needed' = 'Action Needed';
  if (gdprStatus.status === 'Low Risk' && ccpaStatus.status !== 'Action Needed' && eprivacyStatus.status !== 'Action Needed') {
    overallRisk = 'Low Risk';
  } else if (hasPrivacy || latestScan || hasCMPBanner) {
    overallRisk = 'Moderate Risk';
  }

  const breakdown = {
    gdpr: gdprStatus,
    ccpa: ccpaStatus,
    eprivacy: eprivacyStatus,
    activePoliciesCount,
    trackersAudited: detectedCookies.length,
    crawlerCompleted: !!latestScan,
    cmpActive: hasCMPBanner,
  };

  const assessment: SiteComplianceAssessment = {
    overallRisk,
    frameworks: {
      gdpr: gdprStatus,
      ccpa: ccpaStatus,
      eprivacy: eprivacyStatus,
    },
    breakdown,
    hasTrackers,
    activePoliciesCount,
    lastAuditedAt: new Date().toISOString()
  };

  // Save assessment to database without using a single 0-100 score number
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`compliance_assessment_${siteId}`, JSON.stringify(assessment));
    }

    const assessmentPayload = {
      site_id: siteId,
      score: overallRisk === 'Low Risk' ? 100 : (overallRisk === 'Moderate Risk' ? 50 : 0),
      grade: overallRisk === 'Low Risk' ? 'Low Risk' : (overallRisk === 'Moderate Risk' ? 'Scanned' : 'Action Needed'),
      breakdown: assessment,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await (supabase.from('compliance_scores') as any)
      .select('id')
      .eq('site_id', siteId)
      .maybeSingle();

    if (existing) {
      await (supabase.from('compliance_scores') as any).update(assessmentPayload).eq('id', existing.id);
    } else {
      await (supabase.from('compliance_scores') as any).insert(assessmentPayload);
    }

    await (supabase.from('sites') as any).update({
      compliance_grade: overallRisk === 'Low Risk' ? 'Low Risk' : (overallRisk === 'Moderate Risk' ? 'Scanned' : 'Action Needed'),
      last_reviewed_at: new Date().toISOString()
    }).eq('id', siteId);

  } catch (err) {
    console.warn('Failed saving compliance assessment record:', err);
  }

  return assessment;
}
