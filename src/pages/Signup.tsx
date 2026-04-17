import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/src/lib/supabase';
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

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        toast.success('Account created and signed in!');
        navigate('/dashboard');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true
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

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          agency_name: data.agencyName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Please check your email.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-mono">
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
            START <br />
            BUILDING <br />
            TRUST.
          </h1>
          <p className="text-muted text-sm tracking-[0.15em] leading-relaxed">
            JOIN HUNDREDS OF AGENCIES WHO USE PAPERLOO TO AUTOMATE THEIR LEGAL COMPLIANCE AND PROTECT THEIR CLIENTS.
          </p>
        </div>

        <div className="relative z-10 text-[10px] tracking-[0.2em] text-muted">
          © 2026 PAPERLOO. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 animate-gradient opacity-30 pointer-events-none" />
        <div className="w-full max-w-sm space-y-12 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">CREATE ACCOUNT</h2>
            <p className="text-muted text-xs tracking-[0.15em]">START YOUR 14-DAY FREE TRIAL TODAY.</p>
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
              {loading ? 'CREATING ACCOUNT...' : 'GET STARTED'}
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

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="bracket-btn w-full border-white/20 text-white flex items-center justify-center gap-3"
          >
            <span className="bracket-btn-inner"></span>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            {googleLoading ? 'CONNECTING...' : 'GOOGLE'}
          </button>

          <p className="text-center text-xs text-muted tracking-[0.1em]">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link to="/login" className="text-accent font-bold hover:underline">
              SIGN IN HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
