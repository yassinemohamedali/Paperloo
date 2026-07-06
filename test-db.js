import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: site, error } = await supabase.from('sites').insert({
    agency_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // dummy uuid
    name: 'TEST REPO',
    url: 'https://test.com',
    jurisdictions: ['GDPR (EU)'],
    industry_type: 'Software & Technology',
    status: 'active',
    compliance_grade: 'C'
  }).select().single();
  console.log(error || site);
}
test();
