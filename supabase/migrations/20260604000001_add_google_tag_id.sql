-- Migration to add Google Tag ID tracking fields to banner_configs
ALTER TABLE public.banner_configs 
ADD COLUMN IF NOT EXISTS google_tag_id TEXT DEFAULT NULL;
