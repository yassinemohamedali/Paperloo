import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Setup
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.VITE_SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !key) throw new Error("Supabase config (URL or Service Key) missing");
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// Stripe Lazy Init
let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OAuth Callback Handler for Popups
  app.get("/auth/callback", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { 
              background: #000; 
              color: #fff; 
              font-family: monospace; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 2px solid #c8f135;
              border-top: 2px solid transparent;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <p>AUTHENTICATION COMPLETE</p>
          <p style="font-size: 10px; color: #888;">THIS WINDOW WILL CLOSE AUTOMATICALLY</p>
          <script>
            // Send message to the opener
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              // Give it a tiny bit of time to ensure message is sent
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              // Fallback if not a popup
              window.location.href = '/dashboard';
            }
          </script>
        </body>
      </html>
    `);
  });

  // Unified Client Script
  app.get("/api/paperloo.js", async (req, res) => {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).send("siteId required");

    // Fetch banner config
    const supabase = getSupabase();
    const { data: config } = await supabase
      .from('banner_configs')
      .select('*')
      .eq('site_id', siteId)
      .single();

    const script = `
(function() {
  const siteId = "${siteId}";
  const config = ${JSON.stringify(config || {})};
  const apiUrl = "${process.env.APP_URL || ''}";
  
  // 1. Cookie Banner Logic
  function createBanner() {
    if (document.getElementById('paperloo-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'paperloo-banner';
    banner.style.cssText = "position: fixed; bottom: 0; left: 0; right: 0; background: " + (config.theme === 'dark' ? '#111' : '#fff') + "; color: " + (config.theme === 'dark' ? '#fff' : '#000') + "; padding: 20px; z-index: 99999; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.1); font-family: sans-serif; box-shadow: 0 -4px 12px rgba(0,0,0,0.1);";
    
    const text = document.createElement('div');
    text.innerHTML = "<strong>Privacy & Cookies:</strong> We use cookies to personalizes content and ads, provide social media features and analyze our traffic.";
    
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    
    const accept = document.createElement('button');
    accept.innerText = config.accept_text || "Accept All";
    accept.style.cssText = "background: " + (config.primary_color || "#7000FF") + "; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold;";
    accept.onclick = () => { banner.remove(); localStorage.setItem('paperloo_consent', 'all'); };
    
    const manage = document.createElement('button');
    manage.innerText = config.manage_text || "Preferences";
    manage.style.cssText = "background: transparent; border: 1px solid " + (config.theme === 'dark' ? '#fff' : '#000') + "; color: inherit; padding: 10px 20px; cursor: pointer; border-radius: 4px;";
    
    actions.appendChild(manage);
    actions.appendChild(accept);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  // 2. DSAR Form Logic
  function injectDSARForm() {
    const container = document.getElementById('paperloo-dsar-form');
    if (!container) return;
    
    container.innerHTML = \`
      <div style="max-width: 500px; padding: 30px; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif;">
        <h3 style="margin-top: 0;">Data Subject Access Request</h3>
        <p style="font-size: 14px; color: #666;">Use this form to request access, deletion, or correction of your personal data.</p>
        <form id="dsar-form" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="text" name="name" placeholder="Full Name" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
          <input type="email" name="email" placeholder="Email Address" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
          <select name="type" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="access">Request Access</option>
            <option value="delete">Request Deletion</option>
            <option value="correction">Request Correction</option>
            <option value="opt-out">Opt-out of Sale</option>
          </select>
          <textarea name="message" placeholder="Message/Details" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; min-height: 100px;"></textarea>
          <button type="submit" style="background: #000; color: #fff; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Submit Request</button>
        </form>
        <div id="dsar-success" style="display:none; color: green; margin-top: 15px; text-align: center;">Request submitted successfully!</div>
      </div>
    \`;

    const form = document.getElementById('dsar-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        siteId: siteId,
        full_name: formData.get('name'),
        email: formData.get('email'),
        request_type: formData.get('type'),
        message: formData.get('message')
      };
      
      try {
        const res = await fetch('\${apiUrl}/api/submit-dsar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          form.style.display = 'none';
          document.getElementById('dsar-success').style.display = 'block';
        }
      } catch (err) {
        alert('Failed to submit request. Please try again.');
      }
    };
  }

  // Initialize
  if (!localStorage.getItem('paperloo_consent')) {
    if (document.readyState === 'complete') createBanner();
    else window.addEventListener('load', createBanner);
  }
  
  if (document.readyState === 'complete') injectDSARForm();
  else window.addEventListener('load', injectDSARForm);
})();
    `;
    res.set('Content-Type', 'application/javascript');
    res.send(script);
  });

  // DSAR Submission
  app.post("/api/submit-dsar", async (req, res) => {
    try {
      const { siteId, full_name, email, request_type, message } = req.body;
      const supabase = getSupabase();
      const { error } = await supabase.from('dsar_requests').insert({
        site_id: siteId,
        full_name,
        email,
        request_type,
        message,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe: Create Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, userId } = req.body;
      const stripe = getStripe();
      
      const prices: Record<string, string> = {
        starter: 'price_starter_id',
        agency: 'price_agency_id',
        enterprise: 'price_enterprise_id'
      };

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Paperloo ${planId} Plan` },
            unit_amount: planId === 'starter' ? 4900 : planId === 'agency' ? 14900 : 49900,
            recurring: { interval: 'month' }
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/billing?success=true`,
        cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
        client_reference_id: userId,
        metadata: { planId, userId }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe: Webhook
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const stripe = getStripe();
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const planId = session.metadata?.planId;

      if (userId && planId) {
        const supabase = getSupabase();
        await supabase.from('profiles').update({ plan: planId as any }).eq('id', userId);
      }
    }

    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
