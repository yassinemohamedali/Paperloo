-- Ensure name has a unique constraint so ON CONFLICT is supported
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'regulations_name_key'
    ) THEN
        ALTER TABLE public.regulations ADD CONSTRAINT regulations_name_key UNIQUE (name);
    END IF;
END;
$$;

-- Migration to seed new major global regulations requested for Paperloo outreach
INSERT INTO public.regulations (name, jurisdiction, effective_date, status, summary, affects_jurisdictions)
VALUES
  (
    'PDPA (Thailand)', 
    'Thailand', 
    '2022-06-01', 
    'active', 
    'The Personal Data Protection Act (PDPA) of Thailand regulates data processing consent and gives data subjects strict access, objection, and deletion rights.', 
    ARRAY['PDPA_TH']
  ),
  (
    'PDPA (Turkey)', 
    'Turkey', 
    '2016-04-07', 
    'active', 
    'Turkish Personal Data Protection Law regulations require explicit, written or clear electronic consent and verify safe data transfers under local law.', 
    ARRAY['PDPA_TR', 'KVKK_TR']
  ),
  (
    'POPIA (South Africa)', 
    'South Africa', 
    '2021-07-01', 
    'active', 
    'The Protection of Personal Information Act (POPIA) regulates the processing of personal information by public and private bodies in South Africa.', 
    ARRAY['POPIA_ZA']
  ),
  (
    'Privacy Act (Australia)', 
    'Australia', 
    '1988-12-31', 
    'active', 
    'The Australian Privacy Act outlines 13 Australian Privacy Principles (APPs) governing the management of personal information and mandatory data breaches.', 
    ARRAY['PRIVACY_ACT_AU']
  ),
  (
    'APPI (Japan)', 
    'Japan', 
    '2005-04-01', 
    'active', 
    'The Act on the Protection of Personal Information (APPI) of Japan applies to handling of personal data for users located within Japan.', 
    ARRAY['APPI_JP']
  ),
  (
    'PDPB (India)', 
    'India', 
    '2023-08-11', 
    'active', 
    'The Digital Personal Data Protection Act of India (DPDP/PDPB) establishes duties for Data Fiduciaries and rights for individual Data Principals.', 
    ARRAY['PDPB_IN']
  ),
  (
    'KVKK (Turkey)', 
    'Turkey', 
    '2016-04-07', 
    'active', 
    'Kişisel Verilerin Korunması Kanunu No. 6698 (Turkish LPPD) requires registration of data controllers with the VERBIS database and strict local hosting provisions.', 
    ARRAY['KVKK_TR', 'PDPA_TR']
  ),
  (
    'PDPL (Saudi Arabia)', 
    'Saudi Arabia', 
    '2023-09-14', 
    'active', 
    'Saudi Arabia''s Personal Data Protection Law (PDPL) mandates registration of processing systems and limits international transfers to compliant hubs.', 
    ARRAY['PDPL_SA']
  ),
  (
    'Law 25 (Quebec, Canada)', 
    'Quebec, Canada', 
    '2023-09-22', 
    'active', 
    'Quebec''s Law 25 establishes strict default opt-out rules for cookies, privacy by design requirements, and mandatory corporate documentation.', 
    ARRAY['LAW_25_QC']
  )
ON CONFLICT (name) DO UPDATE SET
  jurisdiction = EXCLUDED.jurisdiction,
  effective_date = EXCLUDED.effective_date,
  status = EXCLUDED.status,
  summary = EXCLUDED.summary,
  affects_jurisdictions = EXCLUDED.affects_jurisdictions;
