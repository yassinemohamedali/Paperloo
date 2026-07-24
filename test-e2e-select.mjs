import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function test() {
  const testEmail = 'testrls123@example.com';
  const testPassword = 'password123';
  
  const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  const { data: sites, error: sitesError } = await supabase.from('sites').select('*');
  console.log('Sites:', sites?.length, 'Error:', sitesError);

  const { data: clauses, error: clausesError } = await supabase.from('custom_clauses').select('*');
  console.log('Clauses:', clauses?.length, 'Error:', clausesError);
}
test();
