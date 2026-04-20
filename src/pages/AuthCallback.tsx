import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check for error in URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash || window.location.search);
    const error = params.get('error_description') || params.get('error');

    if (error) {
      toast.error(`AUTH ERROR: ${error.replace(/\+/g, ' ')}`);
      const t = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(t);
    }

    // 2. Monitor auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthCallback Event:', event);
      if (session) {
        // Send message to parent window if we're in a popup
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
          window.close();
        } else {
          // Direct login or fallback
          navigate('/dashboard');
        }
      }
    });

    // 2. Timeout fallback
    const timeout = setTimeout(() => {
      if (window.opener) window.close();
      else navigate('/login');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-mono p-8">
      <div className="space-y-4 text-center">
        <div className="h-12 w-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">SYNCHRONIZING SECURE SESSION...</p>
      </div>
    </div>
  );
}
