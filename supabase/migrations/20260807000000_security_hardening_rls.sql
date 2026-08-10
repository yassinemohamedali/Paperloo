-- ====================================================================
-- PAPERLOO COMPLIANCE ENGINE - SECURITY & HARDENING SQL BLUEPRINT
-- ====================================================================
-- SEC-AUDIT-FIX: Enable Row Level Security (RLS) across all core schemas
-- SEC-AUDIT-FIX: Implement Zero-Trust IDOR policies based on auth.uid()
-- SEC-AUDIT-FIX: Setup tamper-proof append-only security_audit_logs table

-- 1. SECURITY AUDIT LOGS TABLE (Tamper-Proof)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id UUID DEFAULT auth.uid(),
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own audit logs, strictly no direct public edits
CREATE POLICY "Users can view own audit logs"
    ON public.security_audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Prevent any manual updates or deletions to audit logs
CREATE POLICY "No updates allowed to audit logs"
    ON public.security_audit_logs FOR UPDATE
    USING (false);

CREATE POLICY "No deletes allowed to audit logs"
    ON public.security_audit_logs FOR DELETE
    USING (false);

-- 2. ENABLE RLS & DEFINE POLICIES ON USER PROFILES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- SEC-FIX: Prevent profile privilege escalation (self-upgrading plan)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (auth.role() = 'authenticated' AND auth.uid() = OLD.id) THEN
        IF (NEW.plan IS DISTINCT FROM OLD.plan) THEN
            NEW.plan := OLD.plan;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER check_profile_privilege_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 3. ENABLE RLS & DEFINE POLICIES ON SITES
ALTER TABLE IF EXISTS public.sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sites" ON public.sites;
CREATE POLICY "Users can view own sites"
    ON public.sites FOR SELECT
    USING (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Users can insert own sites" ON public.sites;
CREATE POLICY "Users can insert own sites"
    ON public.sites FOR INSERT
    WITH CHECK (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Users can update own sites" ON public.sites;
CREATE POLICY "Users can update own sites"
    ON public.sites FOR UPDATE
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Users can delete own sites" ON public.sites;
CREATE POLICY "Users can delete own sites"
    ON public.sites FOR DELETE
    USING (auth.uid() = agency_id);

-- 4. ENABLE RLS & DEFINE POLICIES ON DOCUMENTS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (agency_id = auth.uid() OR site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (agency_id = auth.uid() OR site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (agency_id = auth.uid() OR site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()))
    WITH CHECK (agency_id = auth.uid() OR site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (agency_id = auth.uid() OR site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

-- 5. CLIENT USERS SECURE TOKEN LOOKUP
ALTER TABLE IF EXISTS public.client_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_users: public token read" ON public.client_users;

-- Secure helper function for portal lookup without exposing table tokens to bulk REST dump
CREATE OR REPLACE FUNCTION public.get_portal_site_id(p_access_token TEXT)
RETURNS TABLE(site_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT site_id FROM public.client_users WHERE access_token = p_access_token LIMIT 1;
$$;

-- Secure helper function to return complete client portal payload for valid access tokens
CREATE OR REPLACE FUNCTION public.get_client_portal_data(p_access_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_site_id UUID;
    v_agency_id UUID;
    v_site JSONB;
    v_documents JSONB;
    v_score JSONB;
    v_versions JSONB;
    v_agency JSONB;
BEGIN
    SELECT cu.site_id, s.agency_id INTO v_site_id, v_agency_id
    FROM public.client_users cu
    JOIN public.sites s ON s.id = cu.site_id
    WHERE cu.access_token = p_access_token
    LIMIT 1;

    IF v_site_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT to_jsonb(s.*) INTO v_site
    FROM public.sites s
    WHERE s.id = v_site_id;

    SELECT COALESCE(jsonb_agg(to_jsonb(d.*)), '[]'::jsonb) INTO v_documents
    FROM public.documents d
    WHERE d.site_id = v_site_id AND d.is_active = true;

    SELECT to_jsonb(cs.*) INTO v_score
    FROM public.compliance_scores cs
    WHERE cs.site_id = v_site_id
    ORDER BY cs.updated_at DESC
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(to_jsonb(dv.*)), '[]'::jsonb) INTO v_versions
    FROM public.document_versions dv
    WHERE dv.site_id = v_site_id
    ORDER BY dv.created_at DESC;

    SELECT jsonb_build_object(
        'agency_name', p.agency_name,
        'logo_url', p.logo_url
    ) INTO v_agency
    FROM public.profiles p
    WHERE p.id = v_agency_id;

    RETURN jsonb_build_object(
        'site', v_site,
        'documents', v_documents,
        'score', v_score,
        'versions', v_versions,
        'agency', v_agency
    );
END;
$$;

-- Hardened handle_new_user with pinned search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$;

-- 5. TRIGGER FUNCTION FOR AUDIT LOGGING (Hardened with fixed search_path)
-- SEC-AUDIT-FIX: Hardened SECURITY DEFINER trigger function by pinning search_path = public, pg_temp to prevent privilege escalation via search_path hijacking
CREATE OR REPLACE FUNCTION public.log_security_audit_event()
RETURNS TRIGGER 
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.security_audit_logs (table_name, action, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to critical tables
DROP TRIGGER IF EXISTS audit_sites_trigger ON public.sites;
CREATE TRIGGER audit_sites_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.sites
    FOR EACH ROW EXECUTE FUNCTION public.log_security_audit_event();

DROP TRIGGER IF EXISTS audit_docs_trigger ON public.compliance_documents;
CREATE TRIGGER audit_docs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.compliance_documents
    FOR EACH ROW EXECUTE FUNCTION public.log_security_audit_event();
