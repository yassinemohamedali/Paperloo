import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';

const SERVICES = [
  { id: '01', name: 'GLOBAL DISCLOSURE ENGINE', description: 'ENTERPRISE-GRADE AUTOMATED DRAFTING FOR INTERNATIONAL COMPLIANCE.' },
  { id: '02', name: 'GOVERNANCE FRAMEWORKS', description: 'SCALABLE LEGAL INFRASTRUCTURE FOR MULTI-TENANT PLATFORMS.' },
  { id: '03', name: 'CONSENT ARCHITECTURE', description: 'DYNAMIC DATA PRIVACY AND CONSENT MANAGEMENT PIPELINES.' },
  { id: '04', name: 'JURISDICTIONAL ADAPTATION', description: 'REAL-TIME REGULATORY SYNCHRONIZATION ACROSS ALL REGIONS.' },
  { id: '05', name: 'RISK MITIGATION ALERTS', description: 'PROACTIVE MONITORING OF GLOBAL REGULATORY SHIFTS.' },
];

const ADVANTAGES = [
  { title: 'COMPLIANCE INFRASTRUCTURE', content: 'THE PAPERLOO PLATFORM INTEGRATES DIRECTLY INTO YOUR TECH STACK, PROVIDING AUTOMATED LEGAL DISCLOSURES AT SCALE.' },
  { title: 'ENTERPRISE GOVERNANCE', content: 'FULL GDPR, CCPA, AND PIPEDA ALIGNMENT THROUGH OUR PROPRIETARY AUTOMATED COMPLIANCE PROTOCOLS.' },
  { title: 'INSTANT DEPLOYMENT', content: 'REDUCE TIME-TO-COMPLIANCE FROM MONTHS TO MILLISECONDS WITH OUR CLOUD-NATIVE INFRASTRUCTURE.' },
  { title: 'MINIMALIST ARCHITECTURE', content: 'HIGH-AUTHORITY DOCUMENT DESIGN THAT REINFORCES BRAND TRUST WITHOUT ADDING OVERHEAD.' },
  { title: 'PLATFORM AGNOSTIC', content: 'UNIFIED API ACCESS FOR CUSTOM BUILDS, E-COMMERCE, AND ENTERPRISE CMS ECOSYSTEMS.' },
  { title: 'ZERO-LATENCY DELIVERY', content: 'EDGE-COMPUTING POWERED SCRIPTS ENSURING REVENUE-CRITICAL PERFORMANCE IS NEVER COMPROMISED.' },
];

const PROCESS = [
  { 
    title: 'AUDIT & ASSESSMENT', 
    bullets: ['ENTERPRISE DATA AUDIT', 'JURISDICTIONAL MAPPING', 'INFRASTRUCTURE ANALYSIS'],
    icon: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  { 
    title: 'GOVERNANCE SETUP', 
    bullets: ['SaaS GOVERNANCE PLAN', 'API INTEGRATION', 'SECURITY PROTOCOLS'],
    icon: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    )
  },
  { 
    title: 'GLOBAL DEPLOYMENT', 
    bullets: ['INFRASTRUCTURE ROLLOUT', 'LIVE MONITORING', 'COMPLIANCE SYNC'],
    icon: (
      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    )
  },
];

const AnimatedHeadline = ({ text }: { text: string }) => {
  return (
    <span className="inline-block overflow-visible whitespace-normal">
      {text.split(' ').map((word, wordIndex) => (
        <span 
          key={wordIndex} 
          className="inline-block whitespace-nowrap hyphens-none"
          style={{ wordBreak: 'keep-all' }}
        >
          {word.split('').map((char, charIndex) => {
            const globalIndex = text.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0) + charIndex;
            return (
              <span 
                key={charIndex} 
                className="letter-reveal inline-block"
                style={{ animationDelay: `${globalIndex * 30}ms` }}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < text.split(' ').length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

const GlobeSVG = () => {
  return (
    <svg width="600" height="600" viewBox="0 0 600 600" className="opacity-20">
      <defs>
        <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="250" fill="url(#globeGradient)" />
      {Array.from({ length: 15 }).map((_, i) => (
        <g key={i} style={{ transform: `rotate(${i * 24}deg)`, transformOrigin: '300px 300px' }}>
          {Array.from({ length: 10 }).map((_, j) => (
            <circle 
              key={j} 
              cx="300" 
              cy={100 + j * 40} 
              r="1.5" 
              fill="white" 
              style={{ 
                animation: 'pulse-soft 3s infinite',
                animationDelay: `${(i + j) * 0.2}s`
              }} 
            />
          ))}
        </g>
      ))}
    </svg>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile on landing page:', err);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black font-mono overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/10",
        isScrolled ? "bg-black/90 backdrop-blur-md" : "bg-black"
      )}>
        <div className="flex items-center gap-12">
          <Link to="/" className="text-xl sm:text-3xl logo">
            PAPERLOO INFRASTRUCTURE
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <div className="group relative">
              <button className="text-[10px] tracking-[0.2em] font-bold text-muted hover:text-accent flex items-center gap-1 uppercase">
                Solutions <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div className="absolute top-full left-0 mt-4 w-64 bg-surface border border-white/10 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <ul className="space-y-4">
                  <li><Link to="/solutions/agencies" className="block text-[10px] tracking-widest hover:text-accent uppercase">Marketing Agencies</Link></li>
                  <li><Link to="/solutions/ecommerce" className="block text-[10px] tracking-widest hover:text-accent uppercase">E-Commerce</Link></li>
                  <li><Link to="/solutions/enterprise" className="block text-[10px] tracking-widest hover:text-accent uppercase">Global Enterprise</Link></li>
                </ul>
              </div>
            </div>
            <Link to="/trust" className="text-[10px] tracking-[0.2em] font-bold text-muted hover:text-accent">SECURITY</Link>
            <Link to="/docs" className="text-[10px] tracking-[0.2em] font-bold text-muted hover:text-accent">DEVELOPERS</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-3 group relative z-10 animate-fade-in">
              <span className="hidden sm:inline text-[9px] tracking-[0.2em] font-bold text-muted group-hover:text-accent uppercase">
                {profile?.agency_name || 'DASHBOARD'}
              </span>
              {profile?.logo_url || user.user_metadata?.avatar_url ? (
                <img 
                  src={profile?.logo_url || user.user_metadata?.avatar_url} 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-accent hover:border-white transition-all hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent text-black font-extrabold flex items-center justify-center text-sm tracking-widest hover:bg-white hover:text-black transition-all hover:scale-105">
                  {(profile?.agency_name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-[10px] tracking-[0.2em] font-bold text-muted hover:text-accent">LOGIN</Link>
              <Link to="/signup" className="bracket-btn py-2 px-6 text-[10px] tracking-widest">
                <span className="bracket-btn-inner"></span>
                REQUEST ACCESS
              </Link>
            </>
          )}
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:text-accent transition-colors lg:hidden"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-0.5 bg-white"></div>
              <div className="w-8 h-0.5 bg-white"></div>
              <div className="w-8 h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-24">
              <span className="text-3xl logo">PAPERLOO INF</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:text-accent">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-8">
              {[
                { label: 'SOLUTIONS', path: '/#solutions' },
                { label: 'SECURITY', path: '/trust' },
                { label: 'DEVELOPERS', path: '/docs' },
                { label: 'PILOT PROGRAM', path: '/signup' }
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => {
                    setMenuOpen(false);
                    if (item.path.startsWith('/#')) {
                      if (window.location.pathname !== '/') {
                        navigate(item.path);
                      } else {
                        document.getElementById(item.path.substring(2))?.scrollIntoView({ behavior: 'smooth' });
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className="text-4xl md:text-6xl font-sans font-black text-left hover:text-accent transition-colors tracking-tighter italic uppercase"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-auto flex flex-col md:flex-row justify-between gap-8 pt-12 border-t border-white/10">
              <div className="space-y-2">
                <p className="text-muted text-xs tracking-[0.2em]">GET IN TOUCH</p>
                <p className="text-accent text-xl">paperloo.official@gmail.com</p>
              </div>
              <div className="flex gap-8">
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-xl hover:text-accent">DASHBOARD</Link>
                    <button 
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }} 
                      className="text-xl hover:text-accent text-left uppercase"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-xl hover:text-accent">LOGIN</Link>
                    <Link to="/signup" className="text-xl hover:text-accent">SIGN UP</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 scan-lines pointer-events-none opacity-20"></div>
        
        {/* Globe Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <GlobeSVG />
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[25vw] font-sans font-extrabold text-white/[0.02] tracking-[0.04em]">PAPERLOO</span>
        </div>

        <div className="relative z-10 text-center max-w-6xl w-full">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 border border-white rounded-full">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-[10px] tracking-[0.3em] font-bold whitespace-nowrap uppercase">Compliance Infrastructure · Automated</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-[120px] leading-[0.9] font-sans font-extrabold mb-12 tracking-[0.04em] break-words">
            <AnimatedHeadline text="GLOBAL DISCLOSURE" /><br />
            <AnimatedHeadline text="INFRASTRUCTURE." />
          </h1>

          <p className="text-muted text-xs sm:text-sm md:text-lg tracking-[0.15em] max-w-3xl mx-auto mb-16 px-4">
            WE PROVIDE THE UNDERLYING LEGAL ARCHITECTURE FOR SCALE-UP AGENCIES AND GLOBAL ENTERPRISE SaaS SOLUTIONS.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 px-6">
            {user ? (
              <Link to="/dashboard" className="bracket-btn w-full md:w-auto group py-5 sm:py-4 border-accent text-accent">
                <span className="bracket-btn-inner"></span>
                GO TO DASHBOARD
              </Link>
            ) : (
              <Link to="/signup" className="bracket-btn w-full md:w-auto group py-5 sm:py-4">
                <span className="bracket-btn-inner"></span>
                APPLY FOR PILOT PROGRAM
              </Link>
            )}
            <Link to="/trust" className="bracket-btn w-full md:w-auto border-accent text-accent group py-5 sm:py-4">
              <span className="bracket-btn-inner"></span>
              <div className="flex items-center justify-center gap-2">
                TRUST CENTER
              </div>
            </Link>
          </div>

          {/* Client Logos */}
          <div className="mt-24 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 grayscale">
            <span className="text-xs tracking-[0.3em] font-bold uppercase">Aether Analytics</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="text-xs tracking-[0.3em] font-bold uppercase">Quantum Platforms</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="text-xs tracking-[0.3em] font-bold uppercase">Apex Infrastructure</span>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="bg-black py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative aspect-video bg-surface border border-white/10 overflow-hidden group reveal-up">
            <img 
              src="https://picsum.photos/seed/paperloo-dashboard/1920/1080" 
              alt="Dashboard" 
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-black border border-white/20 shadow-2xl overflow-hidden">
                 <div className="h-6 bg-surface-2 border-b border-white/10 flex items-center px-3 gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                 </div>
                 <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-white/10"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-32 bg-white/5"></div>
                      <div className="h-32 bg-white/5"></div>
                      <div className="h-32 bg-white/5"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 relative aspect-[21/9] bg-surface border border-white/10 overflow-hidden reveal-up">
            <img 
              src="https://picsum.photos/seed/cash-roi/1920/800?grayscale" 
              alt="ROI" 
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-12 left-12">
              <h2 className="text-4xl font-sans font-extrabold tracking-[0.04em]">ROI DRIVEN <span className="whitespace-nowrap">COMPLIANCE.</span></h2>
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section id="solutions" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-dots-animated opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24 reveal-up">
            <div className="section-label mb-8">COMPLIANCE AS INFRASTRUCTURE</div>
          <h2 className="text-3xl sm:text-6xl md:text-8xl font-sans font-black tracking-tighter">
            THE <span className="sm:whitespace-nowrap italic">PAPERLOO</span><br className="hidden sm:block" /> GOVERNANCE STACK
          </h2>
          </div>

          <div className="flex flex-col">
            {SERVICES.map((service, index) => (
              <div 
                key={service.id} 
                style={{ transitionDelay: `${index * 100}ms` }}
                className="group relative bg-surface border-b border-white/10 p-12 flex flex-col md:flex-row md:items-center justify-between hover:bg-surface-2 transition-colors overflow-hidden reveal-up"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
                
                <div className="relative z-10 space-y-4 md:max-w-xl">
                  <h3 className="text-2xl md:text-4xl font-sans font-extrabold tracking-[0.04em]">{service.name}</h3>
                  <p className="text-muted text-[10px] sm:text-xs tracking-[0.2em]">{service.description}</p>
                </div>

                <div className="hidden md:block absolute right-12 top-8 text-[120px] font-sans font-extrabold text-white/[0.15] leading-none pointer-events-none">
                  {service.id}
                </div>

                <div className="mt-12 md:mt-0 relative z-10">
                  <svg className="w-20 h-20 text-white/20 group-hover:text-accent transition-all duration-500 group-hover:scale-110" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {service.id === '01' && (
                      <g stroke="currentColor" strokeWidth="1.5">
                        <rect x="20" y="15" width="40" height="50" rx="2" />
                        <path d="M35 45V40C35 37.2386 37.2386 35 40 35C42.7614 35 45 37.2386 45 40V45" />
                        <rect x="32" y="45" width="16" height="12" rx="1" />
                      </g>
                    )}
                    {service.id === '02' && (
                      <g stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 20C20 17.2386 22.2386 15 25 15H55C57.7614 15 60 17.2386 60 20V60C60 62.7614 57.7614 65 55 65H25C22.2386 65 20 62.7614 20 60V20Z" />
                        <path d="M20 25H60" />
                        <path d="M30 40H50" />
                        <path d="M30 50H45" />
                      </g>
                    )}
                    {service.id === '03' && (
                      <g stroke="currentColor" strokeWidth="1.5">
                        <circle cx="40" cy="40" r="25" />
                        <circle cx="30" cy="30" r="2" fill="currentColor" />
                        <circle cx="50" cy="35" r="2" fill="currentColor" />
                        <circle cx="35" cy="50" r="2" fill="currentColor" />
                        <path d="M55 55L65 65" />
                        <path d="M50 20C55 25 60 30 60 40" />
                      </g>
                    )}
                    {service.id === '04' && (
                      <g stroke="currentColor" strokeWidth="1.5">
                        <circle cx="40" cy="40" r="25" />
                        <path d="M15 40H65" />
                        <path d="M40 15V65" />
                        <path d="M40 15C45 25 45 55 40 65" />
                        <path d="M40 15C35 25 35 55 40 65" />
                        <circle cx="50" cy="30" r="3" fill="var(--color-accent)" />
                      </g>
                    )}
                    {service.id === '05' && (
                      <g stroke="currentColor" strokeWidth="1.5">
                        <path d="M40 15C31.7157 15 25 21.7157 25 30V45L20 50V55H60V50L55 45V30C55 21.7157 48.2843 15 40 15Z" />
                        <path d="M35 60C35 62.7614 37.2386 65 40 65C42.7614 65 45 62.7614 45 60" />
                        <path d="M60 20L65 15" stroke="var(--color-accent)" />
                        <path d="M65 25L70 20" stroke="var(--color-accent)" />
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 reveal-up">
            <div className="section-label mb-8">THE STANDARD FOR GLOBAL FIRMS</div>
            <h2 className="text-6xl md:text-8xl font-sans font-black tracking-tighter">
              WHY THE WORLD'S<br />LEADING SaaS TRUST US
            </h2>
          </div>

          <div className="space-y-4">
            {ADVANTAGES.map((adv, idx) => (
              <div key={idx} className="border-b border-white/10 reveal-up" style={{ transitionDelay: `${idx * 50}ms` }}>
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                  className="w-full py-8 flex items-center justify-between group"
                >
                  <span className={cn(
                    "text-2xl md:text-4xl font-sans font-extrabold tracking-[0.04em] transition-colors",
                    activeAccordion === idx ? "text-accent" : "text-white group-hover:text-accent"
                  )}>
                    {adv.title}
                  </span>
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center border border-white/20 transition-transform duration-300",
                    activeAccordion === idx ? "rotate-45 border-accent text-accent" : ""
                  )}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: activeAccordion === idx ? 'auto' : 0, opacity: activeAccordion === idx ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="pb-8 text-muted text-sm tracking-[0.15em] max-w-2xl">
                    {adv.content}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-sans font-extrabold tracking-[0.04em] mb-24 text-center reveal-up uppercase">
            UPGRADE YOUR<br /><span className="whitespace-nowrap">GOVERNANCE ENGINE</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {PROCESS.map((step, idx) => (
              <div key={idx} className="relative group reveal-up" style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="aspect-square bg-surface border border-white/10 flex items-center justify-center mb-12 group-hover:border-accent transition-all duration-500 group-hover:-translate-y-2">
                  {step.icon}
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl font-sans font-extrabold tracking-[0.04em]">{step.title}</h3>
                  <ul className="space-y-3">
                    {step.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-3 text-muted text-[10px] tracking-[0.2em]">
                        <div className="w-1 h-1 bg-accent"></div>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                {idx < PROCESS.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 -right-6 w-12 h-px bg-white/10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 px-6 bg-black text-center relative overflow-hidden">
        <div className="absolute inset-0 scan-lines pointer-events-none opacity-10"></div>
        <div className="relative z-10 max-w-5xl mx-auto reveal-up">
          <h2 className="text-7xl md:text-[120px] font-sans font-extrabold tracking-[0.04em] leading-[0.9] mb-12">
            READY FOR <br />INFRASTRUCTURE?
          </h2>
          <p className="text-muted text-sm md:text-lg tracking-[0.15em] mb-16 max-w-2xl mx-auto">
            WE ARE CURRENTLY ACCEPTING A LIMITED NUMBER OF ENTERPRISE PILOT PARTNERS.
          </p>
          {user ? (
            <Link to="/dashboard" className="bracket-btn inline-block border-accent text-accent">
              <span className="bracket-btn-inner"></span>
              GO TO DASHBOARD
            </Link>
          ) : (
            <Link to="/signup" className="bracket-btn inline-block">
              <span className="bracket-btn-inner"></span>
              APPLY FOR EARLY ACCESS
            </Link>
          )}
        </div>
      </section>

      {/* Trust Center / Data Integrity Section */}
      <section className="py-32 px-6 border-y border-white/5 bg-surface/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="reveal-up">
            <div className="section-label mb-8">TRUST CENTER & DATA INTEGRITY</div>
            <h2 className="text-5xl font-sans font-black tracking-tighter mb-8 italic uppercase">
              YOUR DATA IS <span className="text-accent underline decoration-2">SECURE.</span>
            </h2>
            <div className="space-y-6 text-muted text-sm tracking-widest leading-loose">
              <p>THE PAPERLOO PLATFORM IS BUILT WITH A SECURITY-FIRST ARCHITECTURE. ALL DATA IS ENCRYPTED AT REST VIA AES-256 AND PROTECTED DURING TRANSIT WITH TLS 1.3 PROTOCOLS.</p>
              <p>WE ADHERE TO SOC2-ALIGNED GOVERNANCE PRACTICES, ENSURING THAT OUR AUTOMATED WORKFLOWS MEET THE RIGOROUS STANDARDS REQUIRED BY GLOBAL ENTERPRISE LEGAL DEPARTMENTS.</p>
            </div>
            <Link to="/trust" className="inline-block mt-12 text-[10px] font-bold tracking-[0.4em] text-accent hover:underline">
              VIEW FULL SECURITY WHITEPAPER →
            </Link>
          </div>
          <div className="reveal-up delay-200">
            <div className="aspect-square bg-black border border-white/10 p-1 relative overflow-hidden group">
              <div className="absolute inset-0 grid-dots opacity-20"></div>
              <div className="relative h-full flex flex-col items-center justify-center space-y-12 text-center p-12">
                <div className="w-24 h-24 border border-accent flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="-rotate-45 group-hover:rotate-0 transition-transform duration-700">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <p className="text-3xl font-sans font-black tracking-[0.1em]">SOC2 ALIGNED</p>
                  <p className="text-[10px] tracking-[0.3em] text-accent">ENTERPRISE-STRENGTH PROTECTION</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-black relative">
        <div className="absolute inset-0 radial-fade-top opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-20 text-center reveal-up">
            <div className="section-label mb-8 inline-block">KNOWLEDGE BASE</div>
            <h2 className="text-4xl md:text-6xl font-sans font-black tracking-tighter italic uppercase">
              FREQUENTLY ASKED <span className="text-accent">QUESTIONS</span>
            </h2>
          </div>

          <div className="space-y-6 reveal-up">
            {[
              { q: 'What is Paperloo?', a: 'Paperloo is a comprehensive compliance infrastructure platform designed to automate the generation of legal documents, cookie scanners, and governance policies for global agencies.' },
              { q: 'Is the compliance score accurate?', a: 'Yes, our high-fidelity auditing engine relies strictly on actual generated documents and deployed mechanisms across your domains, ensuring a 100% authentic compliance grade.' },
              { q: 'Do you provide legal advice?', a: 'No. Paperloo is an automated infrastructure platform. All generated documents should be reviewed by qualified legal counsel prior to use.' },
              { q: 'Can I connect multiple Github repositories?', a: 'Yes, our GitHub integration allows you to instantly import multiple live web properties and automatically inject compliance structures into them.' }
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 p-6 bg-zinc-950 hover:border-accent/30 transition-colors">
                <h3 className="text-xl font-sans font-black italic tracking-tighter text-white uppercase mb-2">Q. {faq.q}</h3>
                <p className="text-sm font-mono text-muted leading-relaxed uppercase tracking-widest">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24 uppercase">
            <div className="lg:col-span-1 space-y-8">
              <span className="text-4xl logo">PAPERLOO INFRASTRUCTURE</span>
              <p className="text-muted text-[10px] tracking-[0.15em] max-w-xs leading-relaxed">
                THE GLOBAL STANDARD FOR AUTOMATED COMPLIANCE INFRASTRUCTURE.
              </p>
              <div className="space-y-2">
                <p className="text-accent text-sm tracking-[0.1em]">compliance@paperloo.com</p>
                <div className="pt-4 space-y-1">
                  <p className="text-[9px] text-white/40 tracking-[0.3em]">GLOBAL PRESENCE</p>
                  <p className="text-[10px] tracking-[0.2em] font-bold">ALEXANDRIA | NEW YORK | LONDON</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] tracking-[0.3em] font-bold text-white/40">SOLUTIONS</p>
              <ul className="space-y-4 text-[10px] tracking-[0.15em]">
                <li><Link to="/solutions/agencies" className="hover:text-accent transition-colors">MARKETING AGENCIES</Link></li>
                <li><Link to="/solutions/ecommerce" className="hover:text-accent transition-colors">E-COMMERCE</Link></li>
                <li><Link to="/solutions/enterprise" className="hover:text-accent transition-colors">GLOBAL ENTERPRISE</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] tracking-[0.3em] font-bold text-white/40">INFRASTRUCTURE</p>
              <ul className="space-y-4 text-[10px] tracking-[0.15em]">
                <li><Link to="/docs" className="hover:text-accent transition-colors">DOCUMENTATION</Link></li>
                <li><Link to="/docs/api" className="hover:text-accent transition-colors">API REFERENCE</Link></li>
                <li><Link to="/status" className="hover:text-accent transition-colors">SYSTEM STATUS</Link></li>
                <li><Link to="/contact" className="hover:text-accent transition-colors">CONTACT US</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] tracking-[0.3em] font-bold text-white/40">GOVERNANCE</p>
              <ul className="space-y-4 text-[10px] tracking-[0.15em]">
                <li><Link to="/trust" className="hover:text-accent transition-colors">TRUST CENTER</Link></li>
                <li><Link to="/trust/security" className="hover:text-accent transition-colors">SECURITY POLICY</Link></li>
                <li><Link to="/trust/privacy" className="hover:text-accent transition-colors">DATA PRIVACY</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] tracking-[0.3em] font-bold text-white/40">LEGAL</p>
              <ul className="space-y-4 text-[10px] tracking-[0.15em]">
                <li><Link to="/legal" className="hover:text-accent transition-colors">PRIVACY POLICY</Link></li>
                <li><Link to="/legal" className="hover:text-accent transition-colors">TERMS OF SERVICE</Link></li>
                <li><Link to="/legal" className="hover:text-accent transition-colors">DISCLAIMER</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-[10px] tracking-[0.2em] text-muted">© 2026 THE PAPERLOO PLATFORM. ALL RIGHTS RESERVED.</p>
              <div className="max-w-2xl bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="text-[9px] leading-relaxed text-muted uppercase tracking-wider">
                  <span className="text-red-400 font-black block mb-1">MANDATORY LEGAL DISCLOSURE</span>
                  Paperloo Infrastructure is an automated AI platform and is not a law firm. We do not provide legal advice, 
                  opinion or recommendations about your legal rights or strategies. Use of this service does not create an attorney-client relationship. All generated documents should be reviewed by 
                  qualified legal counsel prior to use.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4">
              <p className="text-[10px] tracking-[0.2em] text-muted">BUILT FOR GLOBAL ENTERPRISE.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
