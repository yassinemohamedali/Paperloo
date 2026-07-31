import { supabase } from './supabase';

export async function calculateComplianceScore(siteId: string) {
  let score = 0;
  const breakdown: Record<string, any> = {};

  // 1. Fetch site, documents, questionnaire responses, latest scan, and banner config
  console.log(`Calculating high-fidelity compliance for site: ${siteId}`);
  
  // Safe fetch for site and questionnaire
  const { data: siteData, error: siteError } = await supabase
    .from('sites')
    .select('*, questionnaire_responses(*)')
    .eq('id', siteId)
    .single();

  if (siteError) {
    console.error('Error fetching site data:', siteError);
    return null;
  }

  const site = siteData as any;
  if (!site) return null;

  // Fetch active documents
  const { data: documentsData, error: docsError } = await supabase
    .from('documents')
    .select('type, created_at, is_active')
    .eq('site_id', siteId);

  if (docsError) console.error('Error fetching docs:', docsError);
  const docs = (documentsData as any[]) || [];

  // Fetch latest cookie scan
  let latestScan = null;
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
      // Check sessionStorage fallback in case table is not finalized or has issues
      const localScans = JSON.parse(sessionStorage.getItem(`mock_scans_${siteId}`) || '[]');
      if (localScans.length > 0) {
        latestScan = localScans[0];
      }
    }
  } catch (err) {
    console.warn('Cookie scans fetch failed, continuing with fallback:', err);
  }

  // Fetch banner configurations
  let bannerConfig = null;
  try {
    const { data: bannerData, error: bannerError } = await supabase
      .from('banner_configs')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle();
      
    if (!bannerError) {
      bannerConfig = bannerData;
    }
  } catch (err) {
    console.warn('Banner config fetch failed, continuing with fallback:', err);
  }

  const answers = site.questionnaire_responses?.[0]?.answers || {};

  // 2. High-fidelity Calculation Logic (Max 100)

  // A. Documents Compliance (Max 30) - 10 points per core legal policy
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

  const docCount = [hasPrivacy, hasTerms, hasCookie].filter(Boolean).length;
  const docScore = docCount * 10;
  score += docScore;

  breakdown.documents = {
    score: docScore,
    status: docCount === 3 ? 'complete' : 'incomplete',
    label: `${docCount}/3 active policies (Privacy, Terms, Cookie)`
  };

  // B. Tracker & Consent Mechanics (Max 30)
  let consentScore = 0;
  let hasTrackers = false;
  let trackingScorePenalty = 0;

  // Check if a scanner has run
  if (latestScan) {
    consentScore += 10; // 10 pts for completing a scan
    const detectedCookies = (latestScan.cookies as any[]) || [];
    
    // Check if there are analytical, marketing, or general third-party trackers
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

  // Check if a cookie consent banner is configured and deployed
  if (bannerConfig) {
    consentScore += 10; // 10 pts for installing custom consent gateway
    if (bannerConfig.enable_auto_blocker) {
      consentScore += 5; // 5 pts for auto-blocking script execution prior to consent
    }
    if (bannerConfig.enable_gcm_v2 || bannerConfig.google_tag_id) {
      consentScore += 5; // 5 pts for Advanced Consent Mode / GCM v2 compliant integration
    }
  }

  // Active risk deduction: If tracking cookies are detected but NO consent banner configuration exists,
  // or auto-blocker is disabled, apply a safety compliance penalty!
  if (hasTrackers) {
    if (!bannerConfig) {
      trackingScorePenalty = 15;
      consentScore = Math.max(0, consentScore - 15);
      
      // Auto-insert a high priority safety alert
      try {
        const alertMessage = `Active trackers (e.g., Google Analytics / Meta pixels) were discovered on ${site.name} but no Cookie Consent banner is configured. GDPR compliance requires prior consent before dropping trackers.`;
        
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('site_id', siteId)
          .eq('resolved', false)
          .ilike('message', '%Active trackers%')
          .maybeSingle();

        if (!existingAlert) {
          await (supabase.from('alerts') as any).insert({
            agency_id: site.agency_id,
            site_id: siteId,
            type: 'critical',
            message: alertMessage,
            resolved: false
          } as any);
        }
      } catch (err) {
        console.error('Failed to register active tracker alert:', err);
      }
    } else if (!bannerConfig.enable_auto_blocker) {
      trackingScorePenalty = 5;
      consentScore = Math.max(0, consentScore - 5);
    }
  }

  score += consentScore;
  breakdown.consent = {
    score: consentScore,
    status: (latestScan && bannerConfig && (!hasTrackers || bannerConfig.enable_auto_blocker)) ? 'complete' : 'incomplete',
    label: latestScan 
      ? (trackingScorePenalty > 0 
          ? `Risk penalty applied: Trackers detected without complete shields` 
          : `Consent banner and cookie control active`)
      : 'Run a cookie scan to audit trackers'
  };

  // C. Target Jurisdictions (Max 20)
  const siteJurisdictions = site.jurisdictions || [];
  let jurisdictionScore = 0;
  if (siteJurisdictions.length > 0) {
    jurisdictionScore += 10; // At least one target jurisdiction handled
    if (siteJurisdictions.length >= 2) {
      jurisdictionScore += 10; // Global cross-border readiness (GDPR + CCPA / others)
    }
  }
  score += jurisdictionScore;
  breakdown.jurisdictions = {
    score: jurisdictionScore,
    status: siteJurisdictions.length > 0 ? 'complete' : 'incomplete',
    label: siteJurisdictions.length > 0 
      ? `Covering ${siteJurisdictions.length} targeted jurisdictions` 
      : 'No target jurisdictions designated'
  };

  // D. Data Privacy Operations (Max 10)
  let operationsScore = 0;
  // If baseline questionnaire completed
  if (Object.keys(answers).length > 0) {
    operationsScore += 5;
  }
  // If advanced operational representative / DPO designated
  if (answers.has_data_officer || answers.contact_officer) {
    operationsScore += 5;
  }
  score += operationsScore;
  breakdown.operations = {
    score: operationsScore,
    status: operationsScore >= 10 ? 'complete' : 'incomplete',
    label: operationsScore >= 5 ? 'Regulatory questionnaire answers completed' : 'Data flow operations unmapped'
  };

  // E. Dynamic Monitoring & Recency (Max 10)
  let monitoringScore = 0;
  const lastReviewed = site.last_reviewed_at ? new Date(site.last_reviewed_at) : new Date();
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  if (lastReviewed > sixtyDaysAgo || latestScan) {
    monitoringScore = 10;
  }
  score += monitoringScore;
  breakdown.monitoring = {
    score: monitoringScore,
    status: monitoringScore > 0 ? 'complete' : 'incomplete',
    label: 'Under regular compliance monitoring scans'
  };

  // Final adjustments (Cap at 100)
  score = Math.min(100, Math.max(0, score));

  // Determine Grade
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'F';

  console.log(`High-fidelity audit completed for site ${siteId}: Final Score ${score} (${grade})`);

  // 3. Store the audit result in database
  const scorePayload = {
    site_id: siteId,
    score,
    grade,
    breakdown,
    updated_at: new Date().toISOString()
  };

  try {
    // Save to sessionStorage fallback as backup
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`compliance_score_${siteId}`, JSON.stringify(scorePayload));
    }

    const { data: existing } = await (supabase.from('compliance_scores') as any).select('id').eq('site_id', siteId).maybeSingle();
    let scoreError;
    if (existing) {
      const res = await (supabase.from('compliance_scores') as any).update(scorePayload).eq('id', existing.id);
      scoreError = res.error;
    } else {
      const res = await (supabase.from('compliance_scores') as any).insert(scorePayload);
      scoreError = res.error;
    }

    if (scoreError) {
      console.warn('Note: compliance_scores DB update skipped/omitted:', scoreError.message);
    }
  } catch (err) {
    console.warn('Failed to save audit record in database:', err);
  }

  // Always update the site directly
  try {
    const { error: siteUpdateError } = await (supabase
      .from('sites') as any)
      .update({
        compliance_grade: grade,
        last_reviewed_at: new Date().toISOString()
      } as any)
      .eq('id', siteId);

    if (siteUpdateError) {
      console.error('Error updating site metadata compliance_grade:', siteUpdateError);
    }
  } catch (err) {
    console.error('Failed updating site row:', err);
  }

  return { score, grade, breakdown };
}

