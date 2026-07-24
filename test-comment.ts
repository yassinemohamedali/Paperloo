import { supabase } from './src/lib/supabase';
async function test() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user?.id);
}
test();
