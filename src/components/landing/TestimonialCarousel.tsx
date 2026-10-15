import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, CheckCircle2, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  handle: string;
  role: string;
  company: string;
  metric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Paperloo eliminated attorney bottlenecks completely. When California passed CPRA amendments, our 42 client websites updated autonomously within 3 minutes without touching code.",
    author: "Marcus Vance",
    handle: "@marcus_vance",
    role: "Founder & Technical Director",
    company: "Vance Digital Studio (London)",
    metric: "42 Client Sites Protected"
  },
  {
    quote: "The zero-code consent blocker is the cleanest implementation we've tested. No layout shift, sub-millisecond edge injection, and European privacy auditors cleared our stack on first review.",
    author: "Elena Rostova",
    handle: "@elena_tech",
    role: "Head of Infrastructure",
    company: "Kinetix Cloud (Berlin)",
    metric: "100% GDPR Audit Pass"
  },
  {
    quote: "We were paying $600/hr for legal counsel to draft bespoke DPAs for our B2B customers. Paperloo generated watertight, execution-ready Standard Contractual Clauses in seconds.",
    author: "David Chen",
    handle: "@dchen_saas",
    role: "Co-Founder & CEO",
    company: "Synthetix AI (San Francisco)",
    metric: "$28,000 Saved in Legal Fees"
  },
  {
    quote: "White-label client portals transformed how we pitch enterprise accounts. Our agency now offers guaranteed regulatory compliance as a high-margin recurring retainer.",
    author: "Sophia Al-Mansoor",
    handle: "@sophia_agency",
    role: "Managing Partner",
    company: "Apex Strategy Group (Dubai / NYC)",
    metric: "98% Client Retention"
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate every 5 seconds (Palmo pattern)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section 
      className="py-28 px-6 bg-black relative overflow-hidden border-t border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header matching Palmo's "Sippers Say !" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="section-label mb-3 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              VERIFIED OPERATOR EXPERIENCES
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black tracking-tighter uppercase text-white leading-none">
              FOUNDERS & AGENCIES <span className="text-accent italic drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">SAY !</span>
            </h2>
          </div>

          {/* Navigation Arrows with Palmo bracket button design */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-xl bg-surface border border-white/20 flex items-center justify-center text-white/80 hover:text-accent hover:border-accent transition-all duration-200 active:scale-95 shadow-md"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-xl bg-surface border border-white/20 flex items-center justify-center text-white/80 hover:text-accent hover:border-accent transition-all duration-200 active:scale-95 shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonial Active Card */}
        <div className="p-8 sm:p-14 rounded-3xl bg-surface border border-white/20 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1 text-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-accent stroke-accent" />
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              {current.metric}
            </span>
          </div>

          <p className="text-lg sm:text-2xl md:text-3xl font-sans font-extrabold text-white leading-relaxed tracking-tight uppercase mb-10">
            "{current.quote}"
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-white/10 font-mono">
            <div>
              <div className="text-base font-bold text-white uppercase flex items-center gap-2">
                {current.author}
                <span className="text-xs text-accent font-normal">{current.handle}</span>
              </div>
              <p className="text-xs text-white/60">
                {current.role} · <span className="text-white/80">{current.company}</span>
              </p>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx 
                      ? 'w-8 bg-accent shadow-[0_0_8px_rgba(200,241,53,0.8)]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
