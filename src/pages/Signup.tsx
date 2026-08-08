import { config } from '@/src/config/env';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/src/lib/supabase';
import { rateLimitedAuth } from '@/src/lib/supabaseAuthWrapper';
import { toast } from 'sonner';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agencyName: z.string().min(2, 'Agency name is required'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    const loginWithGithubCreds = async (username: string, token: string) => {
      // Save GitHub credentials so the app discovers existing sites instantly
      const authData = { token, username };
      localStorage.setItem('paperloo_github_auth', JSON.stringify(authData));

      setGithubLoading(true);
      const email = `${username.toLowerCase()}@github.paperloo`;
      const tempPassword = `github_password_secure_112233`;

      try {
        // Attempt standard sign in first in case they already created the account
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: tempPassword,
        });

        if (!signInError) {
          toast.success(`Welcome back, GitHub user: ${username.toUpperCase()}`);
          navigate('/dashboard');
          return;
        }

        // Fallback: Register the user with a customized GitHub name profile
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              agency_name: `${username.toUpperCase()} ENTERPRISE`,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('taken')) {
            // Sign in fallback
            const { error: finalSignInError } = await supabase.auth.signInWithPassword({
              email,
              password: tempPassword,
            });
            if (finalSignInError) {
              toast.error(`GitHub login handshake failed: ${finalSignInError.message}`);
            } else {
              toast.success(`Welcome back, GitHub user: ${username.toUpperCase()}`);
              navigate('/dashboard');
            }
          } else {
            toast.error(`GitHub login handshake failed: ${signUpError.message}`);
          }
        } else {
          toast.success(`Welcome to Paperloo, ${username.toUpperCase()}! Your GitHub sites are connected!`);
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error('GitHub gateway handshaking interrupted.');
      } finally {
        setGithubLoading(false);
      }
    };

    // 1. Listen for Popup oauth messages
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        toast.success('Account created and signed in!');
        navigate('/dashboard');
        return;
      }

      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const username = event.data.username || 'github-user';
        const token = event.data.token;
        await loginWithGithubCreds(username, token);
      }
    };

    // 2. Handle URL Query Params (For direct redirect callback inside iframe)
    const searchParams = new URLSearchParams(window.location.search);
    const githubToken = searchParams.get('github_token');
    const githubUser = searchParams.get('github_user');

    if (githubToken && githubUser) {
      // Clean up URL parameters from history
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

      loginWithGithubCreds(githubUser, githubToken);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${config.appUrl}/auth/callback`,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        }
      },
    });

    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    } else if (data?.url) {
      // Open popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.url,
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        toast.error('Popup blocked. Please allow popups for this site.');
        setGoogleLoading(false);
      } else {
        // Monitor popup closure
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            setGoogleLoading(false);
          }
        }, 500);
      }
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      // Pass the current route so callback redirects back to this page if window.opener is absent
      const stateParam = encodeURIComponent(window.location.pathname);
      const res = await fetch(`/api/auth/github/url?state=${stateParam}&origin=${encodeURIComponent(config.appUrl)}`);
      if (!res.ok) {
        throw new Error(`Gateway responded with status ${res.status}`);
      }
      const { url } = await res.json();

      let popup: Window | null = null;
      try {
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        popup = window.open(
          url,
          'github-auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } catch (err) {
        console.warn("window.open blocked or threw error in sandbox:", err);
      }

      if (!popup) {
        // Direct redirection fallback inside sandboxed iframe envs
        window.location.href = url;
      } else {
        const timer = setInterval(() => {
          try {
            if (popup!.closed) {
              clearInterval(timer);
              setGithubLoading(false);
            }
          } catch (e) {
            // Cross-origin reading checks inside some containers
            clearInterval(timer);
            setGithubLoading(false);
          }
        }, 500);
      }
    } catch (err: any) {
      console.error("GitHub integration trigger error:", err);
      toast.error(`GitHub gateway communication error: ${err.message || err}`);
      setGithubLoading(false);
    }
  };

  const onSubmit = async (formData: SignupForm) => {
    setLoading(true);
    const { error } = await rateLimitedAuth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${config.appUrl}/auth/callback`,
        data: {
          agency_name: formData.agencyName,
        }
      }
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        toast.error('Email limit reached. Please try again in an hour or use Google Login.');
      } else if (error.message.toLowerCase().includes('disabled')) {
        toast.error('Email signups are currently disabled in Supabase. Please use Google Login instead.');
      } else {
        toast.error(error.message);
      }
      setLoading(false);
    } else {
      toast.success('Account created! Welcome to Paperloo.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black font-mono">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-surface border-r border-white/10 flex-col p-16 justify-between relative overflow-hidden">
        <div className="absolute inset-0 scan-lines opacity-20" />
        
        <div className="relative z-10">
          <Link to="/" className="text-3xl logo">
            PAPERLOO
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-7xl font-sans font-extrabold leading-[0.9] mb-8 tracking-[0.04em]">
            SECURE <br />
            GLOBAL <br />
            STATIONS.
          </h1>
          <p className="text-muted text-sm tracking-[0.15em] leading-relaxed">
            THE PAPERLOO PLATFORM ARCHITECTS HIGH-AUTHORITY COMPLIANCE FOR ENTERPRISE-GRADE DIGITAL INFRASTRUCTURE.
          </p>
        </div>

        <div className="relative z-10 text-[10px] tracking-[0.2em] text-muted">
          © 2026 PAPERLOO. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 animate-gradient opacity-30 pointer-events-none" />
        <div className="w-full max-w-sm space-y-8 sm:space-y-12 relative z-10 py-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">PILOT APPLICATION</h2>
            <p className="text-muted text-xs tracking-[0.15em]">REQUEST EARLY ACCESS TO THE GOVERNANCE PIPELINE.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">AGENCY NAME</label>
                <div className="relative group">
                  <input
                    {...register('agencyName')}
                    type="text"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase"
                    placeholder="ACME CREATIVE"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.agencyName && <p className="text-[10px] text-red-500 mt-1">{errors.agencyName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">EMAIL ADDRESS</label>
                <div className="relative group">
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors uppercase"
                    placeholder="paperloo.official@gmail.com"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">PASSWORD</label>
                <div className="relative group">
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm focus:border-accent outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-focus-within:w-full" />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bracket-btn w-full flex items-center justify-center gap-2"
            >
              <span className="bracket-btn-inner"></span>
              {loading ? 'PROCESSING APPLICATION...' : 'APPLY FOR ACCESS'}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-black px-4 text-muted font-bold tracking-[0.2em]">OR CONTINUE WITH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || githubLoading}
              className="bracket-btn w-full border-white/20 text-white flex items-center justify-center gap-2 py-3 px-4"
            >
              <span className="bracket-btn-inner"></span>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[10px] tracking-widest">{googleLoading ? '...' : 'GOOGLE'}</span>
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={googleLoading || githubLoading}
              className="bracket-btn w-full border-white/20 text-white flex items-center justify-center gap-2 py-3 px-4"
            >
              <span className="bracket-btn-inner"></span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span className="text-[10px] tracking-widest">{githubLoading ? '...' : 'GITHUB'}</span>
            </button>
          </div>

          <p className="text-center text-xs text-muted tracking-[0.1em]">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link to="/login" className="text-accent font-bold hover:underline">
              SIGN IN HERE
            </Link>
          </p>

          <div className="pt-8 border-t border-white/5">
            <p className="text-[8px] text-muted-custom uppercase text-center leading-relaxed tracking-wider">
              BY CREATING AN ACCOUNT, YOU AGREE TO OUR <Link to="/legal" className="text-accent hover:underline">TERMS</Link> AND ACKNOWLEDGE THAT WE ARE NOT A LAW FIRM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
