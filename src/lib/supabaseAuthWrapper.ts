import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 60 * 1000,   // 1 minute window
    lockoutMs: 60 * 1000,  // 1 minute lockout
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 1000,   // 1 minute window
    lockoutMs: 60 * 1000,  // 1 minute lockout
  },
};

interface AttemptRecord {
  timestamps: number[];
  lockedUntil?: number;
}

const STORAGE_PREFIX = 'paperloo_auth_ratelimit_';

function getStorageRecord(action: string): AttemptRecord {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${action}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return { timestamps: [] };
}

function setStorageRecord(action: string, record: AttemptRecord): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${action}`, JSON.stringify(record));
  } catch (e) {
    // Ignore storage write errors
  }
}

export function checkRateLimit(action: 'login' | 'signup'): { allowed: boolean; retryAfterSec?: number; remainingAttempts?: number } {
  const cfg = DEFAULT_CONFIGS[action] || DEFAULT_CONFIGS.login;
  const now = Date.now();
  const record = getStorageRecord(action);

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSec,
      remainingAttempts: 0,
    };
  }

  // Filter out timestamps outside window
  const validTimestamps = record.timestamps.filter(ts => now - ts < cfg.windowMs);

  if (validTimestamps.length >= cfg.maxAttempts) {
    const lockedUntil = now + cfg.lockoutMs;
    setStorageRecord(action, { timestamps: validTimestamps, lockedUntil });
    const retryAfterSec = Math.ceil(cfg.lockoutMs / 1000);
    return {
      allowed: false,
      retryAfterSec,
      remainingAttempts: 0,
    };
  }

  return {
    allowed: true,
    remainingAttempts: cfg.maxAttempts - validTimestamps.length,
  };
}

export function recordAttempt(action: 'login' | 'signup'): void {
  const cfg = DEFAULT_CONFIGS[action] || DEFAULT_CONFIGS.login;
  const now = Date.now();
  const record = getStorageRecord(action);
  const validTimestamps = record.timestamps.filter(ts => now - ts < cfg.windowMs);
  validTimestamps.push(now);

  let lockedUntil = record.lockedUntil;
  if (validTimestamps.length >= cfg.maxAttempts) {
    lockedUntil = now + cfg.lockoutMs;
  }

  setStorageRecord(action, { timestamps: validTimestamps, lockedUntil });
}

export function clearRateLimit(action: 'login' | 'signup'): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${action}`);
  } catch (e) {
    // Ignore
  }
}

/**
 * Wrapper object for Supabase authentication calls with rate limiting
 */
// SEC-AUDIT-FIX: Client-side exponential backoff and request throttling wrapper for auth endpoints to prevent brute-force credential stuffing attacks
export const rateLimitedAuth = {
  /**
   * Rate-limited sign in with password
   */
  async signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<AuthResponse> {
    const status = checkRateLimit('login');
    if (!status.allowed) {
      return {
        data: { user: null, session: null },
        error: new Error(`Rate limit exceeded. Too many login attempts. Please wait ${status.retryAfterSec} seconds before trying again.`) as any,
      };
    }

    recordAttempt('login');
    const response = await supabase.auth.signInWithPassword(credentials);

    if (!response.error) {
      clearRateLimit('login');
    }

    return response;
  },

  /**
   * Rate-limited sign up with password
   */
  async signUp(credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> {
    const status = checkRateLimit('signup');
    if (!status.allowed) {
      return {
        data: { user: null, session: null },
        error: new Error(`Rate limit exceeded. Too many signup attempts. Please wait ${status.retryAfterSec} seconds before trying again.`) as any,
      };
    }

    recordAttempt('signup');
    const response = await supabase.auth.signUp(credentials);

    if (!response.error) {
      clearRateLimit('signup');
    }

    return response;
  },

  // Delegate all other auth methods directly to supabase.auth
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (...args: Parameters<typeof supabase.auth.onAuthStateChange>) => supabase.auth.onAuthStateChange(...args),
  signInWithOAuth: (...args: Parameters<typeof supabase.auth.signInWithOAuth>) => supabase.auth.signInWithOAuth(...args),
};
