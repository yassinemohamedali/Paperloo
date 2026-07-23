import { supabase } from "./src/lib/supabase.js";
console.log(await supabase.from('compliance_scores').select('*').limit(1));
