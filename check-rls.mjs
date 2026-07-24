import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'select cmd, qual, with_check from pg_policies where tablename = \'custom_clauses\';' });
  if (error) {
    // try direct postgrest if rpc doesn't exist
  }
}
test();
