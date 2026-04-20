import { supabase } from './supabase';

export async function calculateComplianceScore(siteId: string) {
  let score = 0;
  const breakdown: Record<string, any> = {};

  // 1. Fetch site, documents, and questionnaire responses
  const { data: siteData } = await supabase
    .from('sites')
    .select('*, questionnaire_responses(*)')
    .eq('id', siteId)
    .single();

  const site = siteData as any;
  if (!site) return null;

  const { data: documentsData } = await supabase
    .from('documents')
    .select('type, created_at')
    .eq('site_id', siteId)
    .eq('is_active', true);

  const docs = (documentsData as any[]) || [];
  const answers = site.questionnaire_responses?.[0]?.answers || {};

  // 2. Calculation Logic (Max 100)
  
  // A. Documents (Max 30)
  const hasPrivacy = docs.some(d => d.type === 'privacy_policy');
  const hasTerms = docs.some(d => d.type === 'terms_of_service');
  const hasCookie = docs.some(d => d.type === 'cookie_policy');
  const docCount = [hasPrivacy, hasTerms, hasCookie].filter(Boolean).length;
  const docScore = docCount * 10;
  
  score += docScore;
  breakdown.documents = { 
    score: docScore, 
    status: docCount === 3 ? 'complete' : 'incomplete', 
    label: `${docCount}/3 core documents active` 
  };

  // B. Jurisdictions & Regulation Coverage (Max 20)
  const siteJurisdictions = site.jurisdictions || [];
  if (siteJurisdictions.length > 0) {
    score += 20;
    breakdown.jurisdictions = { 
      score: 20, 
      status: 'complete', 
      label: `Covering ${siteJurisdictions.join(', ')}` 
    };
  } else {
    breakdown.jurisdictions = { score: 0, status: 'incomplete', label: 'No jurisdictions defined' };
  }

  // C. Data Processing & Privacy Controls (Max 20)
  let disclosurePoints = 0;
  if (answers.collects_email) disclosurePoints += 5;
  if (answers.uses_analytics) disclosurePoints += 5;
  if (answers.collects_payment) disclosurePoints += 5;
  if (answers.data_retention_period > 0) disclosurePoints += 5;
  
  score += disclosurePoints;
  breakdown.disclosures = { 
    score: disclosurePoints, 
    status: disclosurePoints >= 15 ? 'complete' : 'incomplete', 
    label: 'Privacy controls & disclosures' 
  };

  // D. Advanced Compliance (Max 15)
  let advancedPoints = 0;
  if (answers.has_data_officer) advancedPoints += 10;
  if (answers.wants_wcag) advancedPoints += 5;
  
  score += advancedPoints;
  breakdown.advanced = { 
    score: advancedPoints, 
    status: advancedPoints > 0 ? 'complete' : 'incomplete', 
    label: 'DPO & Accessibility standards' 
  };

  // E. Review Recency (Max 15)
  const lastReviewed = site.last_reviewed_at ? new Date(site.last_reviewed_at) : null;
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  if (lastReviewed && lastReviewed > ninetyDaysAgo) {
    score += 15;
    breakdown.review = { score: 15, status: 'complete', label: 'Recently reviewed' };
  } else {
    breakdown.review = { score: 0, status: 'incomplete', label: 'Review required' };
  }

  // Generate Alert if stale
  if (!lastReviewed || lastReviewed < sixtyDaysAgo) {
    const { data: existingAlert } = await supabase
      .from('alerts')
      .select('id')
      .eq('site_id', siteId)
      .eq('resolved', false)
      .ilike('message', '%haven\'t been reviewed%')
      .maybeSingle();

    if (!existingAlert) {
      await (supabase
        .from('alerts') as any)
        .insert({
          agency_id: site.agency_id,
          site_id: siteId,
          type: 'warning',
          message: `Your compliance documents for ${site.name} haven't been reviewed in 60 days. Review now to maintain compliance.`
        } as any);
    }
  }

  // Final adjustments (Cap at 100)
  score = Math.min(100, score);

  // 3. Determine Grade
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';

  // 4. Store in database
  await (supabase
    .from('compliance_scores') as any)
    .insert({
      site_id: siteId,
      score,
      grade,
      breakdown
    } as any);

  await (supabase
    .from('sites') as any)
    .update({ compliance_grade: grade } as any)
    .eq('id', siteId);

  return { score, grade, breakdown };
}
