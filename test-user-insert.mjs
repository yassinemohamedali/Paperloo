import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function test() {
  const { data: sites } = await supabaseAdmin.from('sites').select('id, agency_id').limit(1);
  if (!sites || sites.length === 0) return console.log('no sites');
  
  const site = sites[0];
  
  // Sign a JWT as the user
  const token = jwt.sign(
    { 
      aud: 'authenticated', 
      exp: Math.floor(Date.now() / 1000) + 3600, 
      sub: site.agency_id, 
      role: 'authenticated' 
    },
    // We don't have the JWT secret locally, wait, do we?
    // Let's just use service role to get a user, or impersonate.
    'dummy'
  );
}
test();
