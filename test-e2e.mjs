import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function test() {
  // Get an existing user
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  if (!users || users.users.length === 0) return console.log('no users');
  const user = users.users[0];
  console.log('User:', user.id);

  // Get a site for this user
  const { data: sites } = await supabaseAdmin.from('sites').select('*').eq('agency_id', user.id).limit(1);
  if (!sites || sites.length === 0) return console.log('no sites for user');
  const site = sites[0];
  console.log('Site:', site.id);

  // Generate a token for the user
  // Wait, I can just use supabaseAdmin.auth.admin.generateLink, but it sends an email.
  // Instead, let's just create a test user and sign in.
  const testEmail = 'testrls123@example.com';
  const testPassword = 'password123';
  await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  if (authError) return console.log('Auth error:', authError);

  // Create a site
  const { data: newSite, error: siteError } = await supabase.from('sites').insert({
    agency_id: authData.user.id,
    name: 'Test Site',
    url: 'test.com'
  }).select().single();
  
  if (siteError) return console.log('Site error:', siteError);

  // Try to insert custom clause
  const { data: clause, error: clauseError } = await supabase.from('custom_clauses').insert({
    site_id: newSite.id,
    document_type: 'TEAM_NOTE',
    title: 'test',
    content: 'test',
    position: 'end'
  }).select();

  console.log('Clause error:', clauseError);
  console.log('Clause data:', clause);
}
test();
