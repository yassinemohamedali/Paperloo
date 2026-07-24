import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const testEmail = 'testrls123@example.com';
  const testPassword = 'password123';
  
  const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  const { data: sites } = await supabase.from('sites').select('*').limit(1);
  const siteId = sites[0].id;

  const { data: clause, error: clauseError } = await supabase.from('custom_clauses').insert({
    site_id: siteId,
    document_type: 'TEAM_NOTE',
    title: 'test',
    content: 'test',
    position: 'end',
    order_index: 0
  });

  console.log('Clause error:', clauseError);
  console.log('Clause data:', clause);
}
test();
