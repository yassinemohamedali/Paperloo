import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('site_comments').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
