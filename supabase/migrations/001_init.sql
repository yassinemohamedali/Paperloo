-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (User metadata)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  agency_name TEXT,
  logo_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'agency', 'scale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites Table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  jurisdictions TEXT[] DEFAULT '{}',
  industry_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'needs-review')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questionnaire Responses Table
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  answers JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('privacy_policy', 'terms_of_service', 'cookie_policy')),
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts Table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'regulation_update' CHECK (type IN ('regulation_update', 'review_needed')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'agency', 'scale')),
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
);

-- RLS POLICIES

-- Profiles: Users can manage their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Sites: Users can manage their own sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sites" ON sites USING (agency_id = auth.uid());

-- Questionnaire Responses: Users can manage their own responses
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own responses" ON questionnaire_responses 
  USING (site_id IN (SELECT id FROM sites WHERE agency_id = auth.uid()));

-- Documents: Users can manage their own documents, public can view active ones
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON documents 
  USING (site_id IN (SELECT id FROM sites WHERE agency_id = auth.uid()));
CREATE POLICY "Public can view active documents" ON documents 
  FOR SELECT USING (is_active = TRUE);

-- Alerts: Users can manage their own alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own alerts" ON alerts USING (agency_id = auth.uid());

-- Subscriptions: Users can view their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (agency_id = auth.uid());

-- TRIGGER: Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
