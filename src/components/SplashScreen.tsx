import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsFading(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const blockSize = 10;
    const duration = 1800; // ms
    const maxRadius = Math.sqrt(width * width + height * height) / 2;

    // Pre-generate 360 ring blocks with angle (2πi/360) + random jitter ±0.01 and offset factor 0.85–1.15
    const ring1: { angle: number; offsetFactor: number }[] = [];
    for (let i = 0; i < 360; i++) {
      const angle = (2 * Math.PI * i) / 360 + (Math.random() - 0.5) * 0.02;
      const offsetFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
      ring1.push({ angle, offsetFactor });
    }

    // Second ring of 180 blocks at radius factor 0.92–1.04, sized at 80% of block
    const ring2: { angle: number; radiusFactor: number }[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = (2 * Math.PI * i) / 180 + (Math.random() - 0.5) * 0.03;
      const radiusFactor = 0.92 + Math.random() * 0.12; // 0.92 to 1.04
      ring2.push({ angle, radiusFactor });
    }

    const startTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - t, 3);
      const currentRadius = ease * maxRadius;

      // Clear & fill black
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Punch expanding hole
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';

      const cx = width / 2;
      const cy = height / 2;

      // Filled circle at currentRadius - blockSize * 2
      const innerRadius = Math.max(0, currentRadius - blockSize * 2);
      if (innerRadius > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Punch 360 square blocks at offset radii
      for (let i = 0; i < 360; i++) {
        const item = ring1[i];
        const r = currentRadius * item.offsetFactor;
        const bx = cx + Math.cos(item.angle) * r - blockSize / 2;
        const by = cy + Math.sin(item.angle) * r - blockSize / 2;
        ctx.fillRect(bx, by, blockSize, blockSize);
      }

      // Punch second ring of 180 blocks at radius factor 0.92–1.04, sized at 80% of block
      const size2 = blockSize * 0.8;
      for (let i = 0; i < 180; i++) {
        const item = ring2[i];
        const r = currentRadius * item.radiusFactor;
        const bx = cx + Math.cos(item.angle) * r - size2 / 2;
        const by = cy + Math.sin(item.angle) * r - size2 / 2;
        ctx.fillRect(bx, by, size2, size2);
      }

      if (t < 1) {
        animId = requestAnimationFrame(render);
      } else {
        // Complete! Fade overlay to zero over 400ms, disable pointer events while fading, call onComplete after 400ms
        setIsFading(true);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-400 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default SplashScreen;
