# Paperloo - B2B Compliance SaaS Overhaul

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project.
2. Run the SQL migration in `supabase/migrations/001_init.sql` in the SQL Editor.
3. Enable Google OAuth in **Authentication > Providers**.
4. Add the following Redirect URLs in Supabase:
   - `http://localhost:3000/dashboard`
   - `https://your-app-url.run.app/dashboard`
5. Copy your project URL and Anon Key to `.env`.

### 2. Stripe Setup
1. Create a Stripe account.
2. Create three products for the plans (Starter, Agency, Scale).
3. Set up a webhook pointing to `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`.
4. Add your Stripe keys to Supabase Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set STRIPE_PRICE_STARTER=price_...
   supabase secrets set STRIPE_PRICE_AGENCY=price_...
   supabase secrets set STRIPE_PRICE_SCALE=price_...
   ```

### 3. Local Development
1. `npm install`
2. `npm run dev`

### 4. Environment Variables
Create a `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Design System
- **Typography:** Syne (Headings), DM Sans (Body)
- **Theme:** Dark Mode Only
- **Palette:** Custom deep dark palette with indigo accents.
