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

  // 2. Calculation Logic

  // Has all 3 documents: +30
  const hasPrivacy = docs.some(d => d.type === 'privacy_policy');
  const hasTerms = docs.some(d => d.type === 'terms_of_service');
  const hasCookie = docs.some(d => d.type === 'cookie_policy');
  
  if (hasPrivacy && hasTerms && hasCookie) {
    score += 30;
    breakdown.documents = { score: 30, status: 'complete', label: 'All 3 documents generated' };
  } else {
    breakdown.documents = { score: 0, status: 'incomplete', label: 'Missing core documents' };
  }

  // Has correct jurisdictions: +20
  const jurisdictions = answers.jurisdictions || [];
  if (jurisdictions.length > 0) {
    score += 20;
    breakdown.jurisdictions = { score: 20, status: 'complete', label: 'Jurisdictions defined' };
  } else {
    breakdown.jurisdictions = { score: 0, status: 'incomplete', label: 'No jurisdictions set' };
  }

  // Reviewed in last 90 days: +20
  const lastReviewed = site.last_reviewed_at ? new Date(site.last_reviewed_at) : null;
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  if (lastReviewed && lastReviewed > ninetyDaysAgo) {
    score += 20;
    breakdown.review = { score: 20, status: 'complete', label: 'Recently reviewed' };
  } else {
    breakdown.review = { score: 0, status: 'incomplete', label: 'Review required' };
  }

  // Generate Alert if stale (60+ days since last review)
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

  // Cookie policy matches cookie types: +15
  const cookieTypes = answers.cookieTypes || [];
  if (hasCookie && cookieTypes.length > 0) {
    score += 15;
    breakdown.cookies = { score: 15, status: 'complete', label: 'Cookie disclosure active' };
  } else {
    breakdown.cookies = { score: 0, status: 'incomplete', label: 'Cookie disclosure missing' };
  }

  // Contact email set: +10
  if (answers.contactEmail) {
    score += 10;
    breakdown.contact = { score: 10, status: 'complete', label: 'Contact email provided' };
  } else {
    breakdown.contact = { score: 0, status: 'incomplete', label: 'Contact email missing' };
  }

  // Embed code confirmed: +5
  if (answers.embedConfirmed) {
    score += 5;
    breakdown.embed = { score: 5, status: 'complete', label: 'Embed code installed' };
  } else {
    breakdown.embed = { score: 0, status: 'incomplete', label: 'Embed code not confirmed' };
  }

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
