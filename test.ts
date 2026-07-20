import { supabase } from './src/lib/supabase';
const test = async () => {
  const { error } = await supabase.from('contact_messages').insert([{ email: 'test', message: 'test' }]);
}
