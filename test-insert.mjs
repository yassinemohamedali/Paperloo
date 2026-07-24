import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: sites } = await supabase.from('sites').select('id, agency_id').limit(1);
  if (!sites || sites.length === 0) return console.log('no sites');
  
  const siteId = sites[0].id;
  console.log('Inserting into custom_clauses for site', siteId);
  const { error, data } = await supabase.from('custom_clauses').insert({
    site_id: siteId,
    document_type: 'TEAM_NOTE',
    title: 'Test',
    content: 'Test content',
    position: 'end'
  });
  console.log('Result:', error || data);
}
test();
