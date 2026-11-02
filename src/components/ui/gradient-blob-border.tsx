"use client";

import React from "react";

interface GradientBlobBorderProps {
  children?: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export const GradientBlobBorder: React.FC<GradientBlobBorderProps> = ({ 
  children, 
  className = "",
  innerClassName = ""
}) => {
  return (
    <div className={`relative rounded-[16px] flex flex-col overflow-hidden p-[2px] 
                    shadow-[10px_10px_30px_#050505,-10px_-10px_30px_#18181b]
                    border border-[#c8f135]/30 ${className}`}>

      {/* Glassy Inner Content */}
      <div className={`relative bg-black/90 backdrop-blur-[24px]
                      rounded-[14px] border border-[#c8f135]/20 z-10 flex flex-col ${innerClassName}`}>
        {children}
      </div>

      {/* Animated Gradient Blob (Paperloo lime-green, emerald, and dark neon accents) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full opacity-80
                      filter blur-[24px] z-0 animate-blob 
                      bg-gradient-to-r from-[#c8f135] via-emerald-500 to-lime-400 pointer-events-none"></div>

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
            animation: blob 8s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default GradientBlobBorder;
