import { useState, useEffect, useCallback } from 'react';

export interface GtmConsentState {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
}

const STORAGE_KEY = 'pl_consent_v2';

const DEFAULT_CONSENT: GtmConsentState = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  personalization_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
};

export function useGtmConsent() {
  const [consent, setConsentState] = useState<GtmConsentState>(DEFAULT_CONSENT);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize consent state from localStorage on mountain
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Map any old structure to our complete structure containing GCM v2 fields
        const loadedConsent: GtmConsentState = {
          ad_storage: parsed.ad_storage || 'denied',
          analytics_storage: parsed.analytics_storage || 'denied',
          ad_user_data: parsed.ad_user_data || parsed.ad_storage || 'denied',
          ad_personalization: parsed.ad_personalization || parsed.ad_storage || 'denied',
          personalization_storage: parsed.personalization_storage || 'denied',
          functionality_storage: parsed.functionality_storage || 'granted',
          security_storage: parsed.security_storage || 'granted',
        };
        setConsentState(loadedConsent);
        
        // Signal default or cached values to gtag immediately
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', loadedConsent);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored privacy settings:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Update GTM and local state
  const saveConsent = useCallback((newConsent: GtmConsentState) => {
    setConsentState(newConsent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    } catch (e) {
      console.warn('Storage unavailable for caching consent state:', e);
    }

    if (typeof window !== 'undefined') {
      // 1. Send Google Consent Mode v2 Updates
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: newConsent.ad_storage,
          analytics_storage: newConsent.analytics_storage,
          ad_user_data: newConsent.ad_user_data,
          ad_personalization: newConsent.ad_personalization,
          personalization_storage: newConsent.personalization_storage,
          functionality_storage: newConsent.functionality_storage,
          security_storage: newConsent.security_storage,
        });
      }

      // 2. Push state to GTM dataLayer to let triggers fire instantly
      const dataLayer = (window as any).dataLayer || [];
      dataLayer.push({
        event: 'consent_update',
        consent_settings: {
          marketing_accepted: newConsent.ad_storage === 'granted',
          analytics_accepted: newConsent.analytics_storage === 'granted',
          personalization_accepted: newConsent.personalization_storage === 'granted',
          functionality_accepted: newConsent.functionality_storage === 'granted',
          security_accepted: newConsent.security_storage === 'granted',
        },
        ...newConsent
      });
    }
  }, []);

  // Accept all privacy items
  const acceptAll = useCallback(() => {
    const allGranted: GtmConsentState = {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      personalization_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    };
    saveConsent(allGranted);
  }, [saveConsent]);

  // Reject all/minimum tracking consent
  const declineAll = useCallback(() => {
    const allDenied: GtmConsentState = {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      personalization_storage: 'denied',
      functionality_storage: 'granted', // essential stays active
      security_storage: 'granted', // essential stays active
    };
    saveConsent(allDenied);
  }, [saveConsent]);

  // Toggle specific cookie categories
  const toggleCategory = useCallback((category: keyof GtmConsentState) => {
    // Functional and security categories must remain active for system integrity under baseline rules
    if (category === 'security_storage' || category === 'functionality_storage') {
      return;
    }

    setConsentState((current) => {
      const isGranted = current[category] === 'granted';
      const targetState = isGranted ? 'denied' : 'granted';

      const updated: GtmConsentState = {
        ...current,
        [category]: targetState,
      };

      // Specifically link GCM v2 extra params when marketing/ads choices shift
      if (category === 'ad_storage') {
        updated.ad_user_data = targetState;
        updated.ad_personalization = targetState;
      }

      saveConsent(updated);
      return updated;
    });
  }, [saveConsent]);

  return {
    consent,
    isInitialized,
    acceptAll,
    declineAll,
    toggleCategory,
    setCustomConsent: saveConsent
  };
}
