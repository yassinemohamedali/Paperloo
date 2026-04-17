-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Automatically mark onboarding as completed if the user adds a site
CREATE OR REPLACE FUNCTION public.handle_site_added()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET onboarding_completed = TRUE
  WHERE id = NEW.agency_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_site_added_complete_onboarding ON public.sites;
CREATE TRIGGER on_site_added_complete_onboarding
AFTER INSERT ON public.sites
FOR EACH ROW EXECUTE PROCEDURE public.handle_site_added();

-- Retroactively mark onboarding as completed for users who already have sites
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE id IN (SELECT agency_id FROM public.sites);

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Flag to track if user has completed the onboarding flow.';
