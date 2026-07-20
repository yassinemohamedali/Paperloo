// src/config/env.ts
interface AppConfig {
  env: 'development' | 'production' | 'test';
  appUrl: string;
  isProduction: boolean;
}

const getAppUrl = (): string => {
  if (import.meta.env.VITE_APP_URL) return import.meta.env.VITE_APP_URL;
  // Fallback for Vercel preview deployments if explicitly missing from setup
  if (window.location.hostname.includes('vercel.app')) {
    return `${window.location.protocol}//${window.location.hostname}`;
  }
  return 'http://localhost:5173';
};

export const config: AppConfig = {
  env: import.meta.env.MODE as 'development' | 'production' | 'test',
  appUrl: getAppUrl(),
  isProduction: import.meta.env.PROD,
};
