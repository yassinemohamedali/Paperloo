import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-bg flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="absolute inset-0 grid-dots opacity-10" />
      <div className="absolute inset-0 radial-fade" />
      
      <div className="relative z-10 space-y-6">
        <div className="h-24 w-24 rounded-full bg-surface border border-border-custom flex items-center justify-center mx-auto">
          <ShieldAlert className="h-10 w-10 text-accent" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-8xl font-sans font-extrabold tracking-[0.04em] text-white">404</h1>
          <h2 className="text-2xl font-sans font-extrabold tracking-[0.04em]">Page Not Found</h2>
          <p className="text-muted-custom font-light max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved to another jurisdiction.
          </p>
        </div>

        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
