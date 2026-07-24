import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
async function test() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, { headers: { apikey: supabaseKey } });
  const data = await res.json();
  console.log(Object.keys(data.definitions).map(k => `${k}: ${Object.keys(data.definitions[k].properties).join(', ')}`).join('\n'));
}
test();
