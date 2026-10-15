import React, { useEffect, useState } from 'react';

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const current = (window.scrollY / totalHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, current)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed top-0 left-0 right-0 h-[3px] z-[150] bg-white/5 pointer-events-none"
    >
      <div 
        className="h-full bg-gradient-to-r from-accent via-emerald-400 to-cyan-400 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(200,241,53,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
