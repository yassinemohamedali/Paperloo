import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function test() {
  const query = `
    SELECT polname, polcmd, polqual, polwithcheck 
    FROM pg_policy 
    WHERE polrelid = 'public.custom_clauses'::regclass;
  `;
  const res = await fetch(`${supabaseUrl}/rest/v1/`, { headers: { apikey: serviceKey } });
  
  // We can't execute raw sql easily via REST API unless we have an RPC. 
  // Let's just create an RPC temporarily.
}
test();
