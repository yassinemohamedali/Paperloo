import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch all agencies with weekly digest enabled
    const { data: agencies, error: agencyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('weekly_digest_enabled', true);

    if (agencyError) throw agencyError;

    const results = [];

    for (const agency of agencies) {
      // 2. Fetch sites and alerts for this agency
      const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .eq('agency_id', agency.id);

      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('resolved', false);

      const siteCount = sites?.length || 0;
      const alertCount = alerts?.length || 0;
      const avgScore = sites?.length 
        ? Math.round(sites.reduce((acc, s) => acc + (s.compliance_grade === 'A' ? 95 : s.compliance_grade === 'B' ? 80 : 60), 0) / sites.length)
        : 0;

      // 3. Prepare Email Content
      const emailHtml = `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px;">
          <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">Paperloo Weekly Digest</h1>
          <p style="color: #888; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Your Compliance Summary</p>
          
          <div style="margin: 40px 0; border: 1px solid #333; padding: 30px;">
            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
              <div>
                <p style="color: #888; font-size: 10px; font-weight: bold; text-transform: uppercase;">Total Sites</p>
                <p style="font-size: 40px; font-weight: 900; margin: 0;">${siteCount}</p>
              </div>
              <div>
                <p style="color: #888; font-size: 10px; font-weight: bold; text-transform: uppercase;">Active Alerts</p>
                <p style="font-size: 40px; font-weight: 900; margin: 0; color: #ff4444;">${alertCount}</p>
              </div>
            </div>
            <div style="margin-top: 30px;">
              <p style="color: #888; font-size: 10px; font-weight: bold; text-transform: uppercase;">Avg Compliance Score</p>
              <p style="font-size: 40px; font-weight: 900; margin: 0; color: #c8f135;">${avgScore}%</p>
            </div>
          </div>

          <p style="color: #888; font-size: 12px;">All contact emails have been updated to paperloo.official@gmail.com</p>
          <a href="https://paperloo.io/dashboard" style="display: inline-block; background: #c8f135; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px;">Open Dashboard</a>
        </div>
      `;

      // 4. Send Email via Resend (Mocked for now, but logic is there)
      // In a real scenario, you'd call Resend API here
      console.log(`Sending digest to ${agency.email || 'paperloo.official@gmail.com'}`);
      
      results.push({ agency: agency.id, status: 'sent' });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
