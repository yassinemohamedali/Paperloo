import * as React from 'react';
import { useEffect, lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import ConsentManager from './components/ConsentManager';
import AccessibilityWidget from './components/AccessibilityWidget';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sites = lazy(() => import('./pages/Sites'));
const SiteDetail = lazy(() => import('./pages/SiteDetail'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const Documents = lazy(() => import('./pages/Documents'));
const PublicDocument = lazy(() => import('./pages/PublicDocument'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const Certificate = lazy(() => import('./pages/Certificate'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Settings = lazy(() => import('./pages/Settings'));
const Billing = lazy(() => import('./pages/Billing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Regulations = lazy(() => import('./pages/Regulations'));
const Partners = lazy(() => import('./pages/Partners'));
const Trust = lazy(() => import('./pages/Trust'));
const Docs = lazy(() => import('./pages/Docs'));
const SolutionsAgencies = lazy(() => import('./pages/SolutionsAgencies'));
const SolutionsEcommerce = lazy(() => import('./pages/SolutionsEcommerce'));
const SolutionsEnterprise = lazy(() => import('./pages/SolutionsEnterprise'));
const Status = lazy(() => import('./pages/Status'));
const ApiReference = lazy(() => import('./pages/ApiReference'));
const AuditReport = lazy(() => import('./pages/AuditReport'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const DataPrivacy = lazy(() => import('./pages/DataPrivacy'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Contact = lazy(() => import('./pages/Contact'));
const Support = lazy(() => import('./pages/Support'));
const AccessibilityCenter = lazy(() => import('./pages/AccessibilityCenter'));

// Layout
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends (Component as any)<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-black text-white font-mono flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6 border border-white/10 p-8 rounded-xl bg-surface">
            <h2 className="text-xl font-bold text-accent">SYSTEM RUNTIME RECOVERY</h2>
            <p className="text-xs text-muted leading-relaxed">
              An unexpected render anomaly was safely intercepted.
            </p>
            <button
              onClick={() => {
                (this as any).setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="bracket-btn text-xs px-6 py-3"
            >
              RELOAD RUNTIME
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-bg">
    <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>;
  
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Fetch profile with a robust query that doesn't explode if columns are missing
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-check', user?.id],
    queryFn: async () => {
      console.log('OnboardingGuard: Verifying status for user', user?.id);
      
      // 1. Get profile
      // Avoid select('*') to prevent errors from missing columns that might be in types but not DB
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, agency_name, plan')
        .eq('id', user?.id as string)
        .maybeSingle();
      
      // 2. Head-query sites as a fallback for completion
      const { count } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', user?.id as string);

      console.log('OnboardingGuard: Check complete', { hasSites: (count || 0) > 0, hasAgency: profile ? !!(profile as any).agency_name : false });

      return {
        profile,
        hasSites: (count || 0) > 0,
        profileError
      };
    },
    enabled: !!user?.id,
    retry: false, // Fail fast if there's a real issue
    staleTime: 0 // Always fetch fresh to avoid stale onboarding state
  });

  if (isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg">
      <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const profile = data?.profile;
  const hasSites = data?.hasSites;
  
  // Robust check: Onboarding is complete if they already have sites (finished step 3)
  // or if the agency name is set (finished step 1).
  // This safeguards against missing columns or stale cache.
  const isComplete = Boolean(
    hasSites || 
    (profile && (profile as any).agency_name)
  );

  // Redirect to onboarding if not complete and not already there
  if (!isComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect away from onboarding if complete and trying to go back
  if (isComplete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><PageTransition><Signup /></PageTransition></PublicRoute>} />
        
        {/* Public Document View (No Auth) */}
        <Route path="/docs/:siteId/:type" element={<PageTransition><PublicDocument /></PageTransition>} />
        <Route path="/client/:accessToken" element={<PageTransition><ClientPortal /></PageTransition>} />
        <Route path="/certificate/:id" element={<PageTransition><Certificate /></PageTransition>} />
        <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
        <Route path="/legal" element={<PageTransition><LegalPage /></PageTransition>} />
        <Route path="/partners" element={<PageTransition><Partners /></PageTransition>} />
        <Route path="/trust" element={<PageTransition><Trust /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><Docs /></PageTransition>} />
        <Route path="/docs/api" element={<PageTransition><ApiReference /></PageTransition>} />
        <Route path="/status" element={<PageTransition><Status /></PageTransition>} />
        <Route path="/trust/security" element={<PageTransition><SecurityPolicy /></PageTransition>} />
        <Route path="/trust/privacy" element={<PageTransition><DataPrivacy /></PageTransition>} />
        <Route path="/solutions/agencies" element={<PageTransition><SolutionsAgencies /></PageTransition>} />
        <Route path="/solutions/ecommerce" element={<PageTransition><SolutionsEcommerce /></PageTransition>} />
        <Route path="/solutions/enterprise" element={<PageTransition><SolutionsEnterprise /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingGuard><PageTransition><Onboarding /></PageTransition></OnboardingGuard></ProtectedRoute>} />
        
        <Route element={<ProtectedRoute><OnboardingGuard><DashboardLayout /></OnboardingGuard></ProtectedRoute>}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/audit-report" element={<PageTransition><AuditReport /></PageTransition>} />
          <Route path="/sites" element={<PageTransition><Sites /></PageTransition>} />
          <Route path="/sites/:id" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/cookie-banner" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/cookie-scanner" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/dsar-inbox" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/google-gtm-tags" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/gtm-tags" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/cookie-banner" element={<Navigate to="/sites" replace />} />
          <Route path="/cookie-scanner" element={<Navigate to="/sites" replace />} />
          <Route path="/dsar-inbox" element={<Navigate to="/sites" replace />} />
          <Route path="/google-gtm-tags" element={<Navigate to="/sites" replace />} />
          <Route path="/sites/:id/questionnaire" element={<PageTransition><Questionnaire /></PageTransition>} />
          <Route path="/sites/:id/documents" element={<PageTransition><Documents /></PageTransition>} />
          <Route path="/alerts" element={<PageTransition><Alerts /></PageTransition>} />
          <Route path="/regulations" element={<PageTransition><Regulations /></PageTransition>} />
          <Route path="/billing" element={<PageTransition><Billing /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          <Route path="/accessibility-defense" element={<PageTransition><AccessibilityCenter /></PageTransition>} />
        </Route>

        {/* Redirects */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // 1. Restore session on load with error catching to deal with invalid or stale tokens
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session restoration error or expired token:', error.message);
        
        // Self-heal: If token is revoked or invalid on the database side, flush local storage keys to clear state
        const isRefreshTokenError = 
          error.message?.toLowerCase().includes('refresh token') || 
          error.message?.toLowerCase().includes('not found') || 
          error.message?.toLowerCase().includes('invalid_grant') ||
          error.status === 400 ||
          error.status === 401;

        if (isRefreshTokenError) {
          // Trigger a clean sign out on the client of stale data
          supabase.auth.signOut().catch(() => {});
          
          // Manually clean up any legacy supabase storage keys that might be corrupt
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            console.error('Failed to clear stale auth keys:', e);
          }
        }
        
        setUser(null);
        setSession(false);
      } else {
        setUser(session?.user ?? null);
        setSession(!!session);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Unhandled getSession error:', err);
      setUser(null);
      setSession(false);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth change event:', event);
      
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED' || !session) {
        setUser(null);
        setSession(false);
      } else {
        setUser(session.user);
        setSession(true);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return (
    <Router>
      <AppErrorBoundary>
        <Suspense fallback={
          <div className="h-screen w-screen bg-black flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AnimatedRoutes />
        </Suspense>
        <ConsentManager />
        <AccessibilityWidget />
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'bg-surface border-border-custom text-text-custom font-dm',
            duration: 4000,
          }} 
        />
      </AppErrorBoundary>
    </Router>
  );
}
