"use client";

import React from "react";

interface GradientBlobCardProps {
  children?: React.ReactNode;
  className?: string;
}

const GradientBlobCard: React.FC<GradientBlobCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative w-[220px] h-[280px] rounded-[16px] flex flex-col items-center justify-center p-4
                    shadow-[20px_20px_60px_#0d0d0d,-20px_-20px_60px_#1f1f23] dark:shadow-[20px_20px_60px_#050505,-20px_-20px_60px_#18181b]
                    overflow-hidden border border-[#c8f135]/20 ${className}`}>

      {/* Glassy Background */}
      <div className="absolute inset-[3px] bg-black/85 backdrop-blur-[24px]
                      rounded-[13px] border border-[#c8f135]/30 z-10 flex flex-col items-center justify-center p-4">
        {children}
      </div>

      {/* Animated Gradient Blob (Paperloo lime-green, emerald, and dark neon accents) */}
      <div className="absolute top-1/2 left-1/2 w-[160px] h-[160px] rounded-full opacity-90
                      filter blur-[16px] z-0 animate-blob 
                      bg-gradient-to-r from-[#c8f135] via-emerald-500 to-lime-400"></div>

      {/* Inline keyframes animation */}
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(-100%, -100%);
            }
            25% {
              transform: translate(0%, -100%);
            }
            50% {
              transform: translate(0%, 0%);
            }
            75% {
              transform: translate(-100%, 0%);
            }
            100% {
              transform: translate(-100%, -100%);
            }
          }

          .animate-blob {
            animation: blob 6s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default GradientBlobCard;
