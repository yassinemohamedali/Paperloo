import React from 'react';
import { cn } from '@/src/lib/utils';

interface PaperlooLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function PaperlooLogo({ 
  className, 
  size = 'md',
  showText = true 
}: PaperlooLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-base rounded-xl',
    lg: 'w-12 h-12 text-xl rounded-2xl',
    xl: 'w-16 h-16 text-3xl rounded-2xl',
  };

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Iconic Squircle Lime Green [P] Logo from video */}
      <div 
        className={cn(
          "relative flex items-center justify-center font-sans font-black text-black bg-[#bef264] shadow-[0_0_24px_rgba(190,242,100,0.45)] transition-transform duration-300 hover:scale-105 shrink-0",
          iconSizes[size]
        )}
      >
        <span className="font-extrabold tracking-tighter">P</span>
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/20 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-sans font-black tracking-wider text-white text-base md:text-lg">
            PAPERLOO
          </span>
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#bef264] font-bold uppercase mt-0.5">
            COMPLIANCE INFRASTRUCTURE
          </span>
        </div>
      )}
    </div>
  );
}
