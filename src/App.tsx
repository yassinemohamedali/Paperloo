import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Layout
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

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

      return {
        profile,
        hasSites: (count || 0) > 0,
        profileError
      };
    },
    enabled: !!user?.id,
    retry: false // Fail fast if there's a real issue
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

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

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

        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingGuard><PageTransition><Onboarding /></PageTransition></OnboardingGuard></ProtectedRoute>} />
        
        <Route element={<ProtectedRoute><OnboardingGuard><DashboardLayout /></OnboardingGuard></ProtectedRoute>}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/sites" element={<PageTransition><Sites /></PageTransition>} />
          <Route path="/sites/:id" element={<PageTransition><SiteDetail /></PageTransition>} />
          <Route path="/sites/:id/questionnaire" element={<PageTransition><Questionnaire /></PageTransition>} />
          <Route path="/sites/:id/documents" element={<PageTransition><Documents /></PageTransition>} />
          <Route path="/alerts" element={<PageTransition><Alerts /></PageTransition>} />
          <Route path="/regulations" element={<PageTransition><Regulations /></PageTransition>} />
          <Route path="/billing" element={<PageTransition><Billing /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
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
    // 1. Restore session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(!!session);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return (
    <Router>
      <Suspense fallback={<div className="h-screen w-screen bg-bg" />}>
        <AnimatedRoutes />
      </Suspense>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-surface border-border-custom text-text-custom font-dm',
          duration: 4000,
        }} 
      />
    </Router>
  );
}
