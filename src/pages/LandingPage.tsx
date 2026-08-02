import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  ShieldCheck, 
  Activity, 
  Globe, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Zap, 
  Sparkles, 
  Code, 
  Scale, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Copy, 
  Check,
  Search,
  Sliders,
  Server
} from 'lucide-react';

import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';

const SERVICES = [
  { id: '01', name: 'AUTOMATED LEGAL COMPLIANCE ENGINE', description: 'Automatically generate, update, and publish bulletproof Privacy Policies, Terms of Service, and DPAs tailored to your tech stack and target jurisdictions.' },
  { id: '02', name: 'COMPLETE SAAS & AGENCY LEGAL STACK', description: 'A unified compliance workspace built specifically for SaaS platforms, e-commerce brands, and marketing agencies managing multiple client sites.' },
  { id: '03', name: 'ZERO-CODE COOKIE & CONSENT MANAGER', description: 'Deploy lightweight cookie banners that auto-block unauthorized trackers, handle opt-outs, and keep you compliant with GDPR & CCPA.' },
  { id: '04', name: 'REAL-TIME STATUTORY AUTO-UPDATES', description: 'When privacy laws change in Europe, California, or Australia, your legal documents automatically update on your live sites with zero downtime.' },
  { id: '05', name: '24/7 SITE RISK SCANNING', description: 'Continuous background monitoring scans your sites for missing disclosures, unmapped cookies, and legal vulnerabilities before fines happen.' },
];

const ADVANTAGES = [
  { title: 'INSTANT 1-CLICK INTEGRATION', content: 'Embed our lightweight script or connect your custom domain to publish legally binding disclosures across all client websites in under 3 minutes.' },
  { title: 'GLOBAL MULTI-REGION COVERAGE', content: 'Stay 100% protected across GDPR (EU/UK), CCPA/CPRA (California), PIPEDA (Canada), and APPs (Australia) with a single unified platform.' },
  { title: 'REDUCE LEGAL COSTS BY 90%', content: 'Skip $500/hr attorney fees. Generate customized, lawyer-vetted legal policies engineered specifically for digital businesses and SaaS.' },
  { title: 'WHITE-LABEL BRANDING FOR AGENCIES', content: 'Remove Paperloo logos and deliver fully customized, client-branded legal portals and compliance badges to boost client trust.' },
  { title: 'WORKS WITH ANY WEB STACK', content: 'Seamlessly integrates with Webflow, WordPress, React, Next.js, Shopify, custom Node.js backends, and headless CMS platforms.' },
  { title: 'LIGHTSPEED EDGE PERFORMANCE', content: 'High-speed CDN script loading in under 2ms ensures your page speed, user experience, and Google SEO rankings remain completely unimpacted.' },
];

const PROCESS = [
  { 
    title: 'AUTOMATED SITE AUDIT', 
    subtitle: 'Scan your website to automatically detect third-party scripts, data collection points, and missing legal disclosures.',
    bullets: ['Detect PII & Trackers', 'Map Target Jurisdictions', 'Identify Compliance Gaps'],
  },
  { 
    title: 'ONE-CLICK POLICY SETUP', 
    subtitle: 'Generate customized, lawyer-vetted legal policies and embed them on your site using a single line of code.',
    bullets: ['Tailored Agency/SaaS Clauses', 'Custom White-Label Branding', 'Zero-Code Script Embed'],
  },
  { 
    title: 'AUTONOMOUS PROTECTION', 
    subtitle: 'Sit back as Paperloo monitors global legislation changes and updates your live legal policies automatically.',
    bullets: ['Real-Time Law Updates', '24/7 Threat Monitoring', 'Downloadable Audit Reports'],
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

          <p className="text-muted text-xs sm:text-sm md:text-base tracking-[0.12em] max-w-3xl mx-auto mb-16 px-4 uppercase font-semibold leading-relaxed">
            AUTOMATE LEGAL COMPLIANCE FOR YOUR AGENCY OR SAAS. GENERATE BULLETPROOF PRIVACY POLICIES, TERMS OF SERVICE, AND COOKIE BANNERS IN MINUTES.
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

          {/* Client Logos - Liquid Glass Pill */}
          <div className="mt-20 inline-flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-8 py-4 rounded-full liquid-glass-item border border-white/20 shadow-xl reveal-up">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase text-white/70">Aether Analytics</span>
            <div className="w-px h-3 bg-accent/40"></div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase text-white/70">Quantum Platforms</span>
            <div className="w-px h-3 bg-accent/40"></div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase text-white/70">Apex Infrastructure</span>
          </div>
        </div>
      </section>

      {/* Live Product Demo & Control Center Section (Liquid Glass Theme) */}
      <section className="bg-black py-24 border-y border-white/10 relative overflow-hidden">
        {/* Floating Liquid Glow Orbs */}
        <div className="liquid-glow-orb bg-accent/20 w-[450px] h-[450px] -top-20 -left-20"></div>
        <div className="liquid-glow-orb bg-purple-600/15 w-[500px] h-[500px] top-1/2 -right-30"></div>
        <div className="liquid-glow-orb bg-cyan-400/15 w-[400px] h-[400px] -bottom-20 left-1/3"></div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="section-label mb-6 text-accent flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping"></span>
            PAPERLOO COMPLIANCE OPERATING SYSTEM v4.2
          </div>
          
          <div className="relative rounded-3xl liquid-glass-card overflow-hidden reveal-up">
            {/* Control Bar Header */}
            <div className="liquid-glass-header px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/90 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="h-4 w-px bg-white/20 mx-1"></div>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-1.5 text-xs text-muted font-mono shadow-inner">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-bold tracking-wide">https://app.your-agency.com/compliance-engine</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 px-3.5 py-1.5 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  STATUTORY HEALTH: 100%
                </span>
                <span className="bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white/80 font-bold">
                  4 REGIMES ACTIVE
                </span>
              </div>
            </div>

            {/* Main Interactive Control Center Grid */}
            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-black/40 backdrop-blur-xl">
              
              {/* Left Column: Active Legal Documents */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-xs font-bold tracking-widest text-white/80 uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" /> Active Disclosures
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    AUTO-SYNCHRONIZED
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Privacy Policy (GDPR / CCPA / PIPEDA)', ver: 'v2.4.1', status: 'COMPLIANT', time: 'Synced 2m ago', active: true },
                    { title: 'Terms of Service & EULA', ver: 'v1.9.0', status: 'ACTIVE', time: 'Synced 12m ago', active: true },
                    { title: 'Cookie Consent Manager & Telemetry', ver: 'v3.2.0', status: 'ENFORCING', time: '1,420 Consents Today', active: true },
                    { title: 'Data Processing Agreement (DPA + SCCs)', ver: 'v1.4.2', status: 'EXECUTED', time: 'Synced 1h ago', active: true }
                  ].map((doc, idx) => (
                    <div key={idx} className="liquid-glass-item p-4 rounded-2xl flex items-center justify-between group cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{doc.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-white/60 font-mono pl-7">
                          <span>{doc.ver}</span>
                          <span>•</span>
                          <span>{doc.time}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Column: Global Compliance Metrics */}
              <div className="lg:col-span-4 space-y-6">
                <div className="liquid-glass-item p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" /> Regional Matrix
                    </span>
                    <span className="text-xs text-accent font-mono font-bold drop-shadow-[0_0_10px_rgba(200,241,53,0.3)]">0 Violations</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { reg: 'EU / UK', law: 'GDPR / UK-GDPR', score: '100%', badge: 'PASS' },
                      { reg: 'USA', law: 'CCPA / CPRA / VCDPA', score: '100%', badge: 'PASS' },
                      { reg: 'CANADA', law: 'PIPEDA / Law 25', score: '100%', badge: 'PASS' },
                      { reg: 'GLOBAL', law: 'APPs / Privacy Act', score: '100%', badge: 'PASS' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/15 p-3.5 rounded-xl space-y-1.5 backdrop-blur-md">
                        <div className="flex justify-between items-center text-[10px] text-white/60 font-bold">
                          <span>{item.reg}</span>
                          <span className="text-emerald-400 font-mono">{item.badge}</span>
                        </div>
                        <div className="text-xs font-bold text-white font-mono">{item.law}</div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden p-0.5">
                          <div className="bg-emerald-400 h-full w-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/70 font-mono">
                    <span className="flex items-center gap-2 text-white font-semibold">
                      <Zap className="w-3.5 h-3.5 text-accent" /> Edge Injection CDN:
                    </span>
                    <span className="text-emerald-400 font-bold">1.2ms Avg Latency</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Audit Terminal Stream */}
              <div className="lg:col-span-3 space-y-4">
                <div className="liquid-glass-item p-5 rounded-2xl font-mono text-[11px] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2 text-white/60">
                    <span className="flex items-center gap-2 text-white font-bold">
                      <Terminal className="w-3.5 h-3.5 text-accent" /> Live Scanner Log
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </div>

                  <div className="space-y-2.5 text-white/70 leading-relaxed">
                    <p className="text-white/90"><span className="text-accent font-bold">[05:41:02]</span> Continuous DOM scan completed for app.your-agency.com</p>
                    <p className="text-emerald-300"><span className="text-accent font-bold">[05:41:05]</span> Verified 14 third-party trackers (GA4, Meta, Stripe, Hubspot)</p>
                    <p className="text-white/90"><span className="text-accent font-bold">[05:41:08]</span> Statutory policies synced to 12 CDN edge nodes</p>
                    <p className="text-emerald-300"><span className="text-accent font-bold">[05:41:12]</span> All statutory checks passed. Zero legal exposure.</p>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[10px] text-white/50">AUTO-SCAN FREQUENCY</span>
                    <span className="text-[10px] text-accent font-bold">EVERY 24 HOURS</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Key Value Proposition Bar - Liquid Glass Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="p-6 rounded-2xl liquid-glass-item space-y-2">
              <div className="text-3xl font-black font-sans text-accent drop-shadow-[0_0_12px_rgba(200,241,53,0.3)]">3 MINUTES</div>
              <p className="text-xs text-white/70 font-mono tracking-wider uppercase">Average setup time for full agency client site protection</p>
            </div>
            <div className="p-6 rounded-2xl liquid-glass-item space-y-2">
              <div className="text-3xl font-black font-sans text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">0 MANUAL UPDATES</div>
              <p className="text-xs text-white/70 font-mono tracking-wider uppercase">Policies automatically re-sync when global privacy laws change</p>
            </div>
            <div className="p-6 rounded-2xl liquid-glass-item space-y-2">
              <div className="text-3xl font-black font-sans text-white">100% WHITE-LABEL</div>
              <p className="text-xs text-white/70 font-mono tracking-wider uppercase">Deliver custom legal portals with your agency logo and domain</p>
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section id="solutions" className="py-32 px-6 relative overflow-hidden">
        {/* Spatial UI Floating Glow Orbs */}
        <div className="liquid-glow-orb bg-accent/15 w-[500px] h-[500px] top-10 -right-20"></div>
        <div className="liquid-glow-orb bg-cyan-500/10 w-[400px] h-[400px] bottom-10 -left-20"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 reveal-up">
            <div className="section-label mb-4 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              COMPLIANCE AS INFRASTRUCTURE
            </div>
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-sans font-black tracking-tighter uppercase">
              THE <span className="sm:whitespace-nowrap italic text-accent drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">PAPERLOO</span><br className="hidden sm:block" /> GOVERNANCE STACK
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {SERVICES.map((service, index) => (
              <div 
                key={service.id} 
                style={{ transitionDelay: `${index * 100}ms` }}
                className="group relative liquid-glass-item spatial-glass-hover rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between border border-white/15 overflow-hidden reveal-up shadow-xl hover:border-accent/60"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent via-emerald-400 to-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
                
                <div className="relative z-10 space-y-3 md:max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full shadow-sm">
                      MODULE {service.id}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      LIVE INJECTION
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-white group-hover:text-accent transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm tracking-wide leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="hidden md:block absolute right-16 top-6 text-[110px] font-sans font-black text-white/[0.04] group-hover:text-accent/[0.08] transition-colors leading-none pointer-events-none select-none">
                  {service.id}
                </div>

                <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:border-accent/60 group-hover:bg-accent/10 transition-all shadow-lg group-hover:scale-110">
                    <svg className="w-10 h-10 text-white/40 group-hover:text-accent transition-all duration-500" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {service.id === '01' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <rect x="20" y="15" width="40" height="50" rx="4" />
                          <path d="M35 45V40C35 37.2386 37.2386 35 40 35C42.7614 35 45 37.2386 45 40V45" />
                          <rect x="32" y="45" width="16" height="12" rx="2" />
                        </g>
                      )}
                      {service.id === '02' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <path d="M20 20C20 17.2386 22.2386 15 25 15H55C57.7614 15 60 17.2386 60 20V60C60 62.7614 57.7614 65 55 65H25C22.2386 65 20 62.7614 20 60V20Z" />
                          <path d="M20 25H60" />
                          <path d="M30 40H50" />
                          <path d="M30 50H45" />
                        </g>
                      )}
                      {service.id === '03' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <circle cx="40" cy="40" r="25" />
                          <circle cx="30" cy="30" r="3" fill="currentColor" />
                          <circle cx="50" cy="35" r="3" fill="currentColor" />
                          <circle cx="35" cy="50" r="3" fill="currentColor" />
                          <path d="M55 55L65 65" />
                        </g>
                      )}
                      {service.id === '04' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <circle cx="40" cy="40" r="25" />
                          <path d="M15 40H65" />
                          <path d="M40 15V65" />
                          <circle cx="50" cy="30" r="3" fill="var(--color-accent)" />
                        </g>
                      )}
                      {service.id === '05' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <path d="M40 15C31.7157 15 25 21.7157 25 30V45L20 50V55H60V50L55 45V30C55 21.7157 48.2843 15 40 15Z" />
                          <path d="M35 60C35 62.7614 37.2386 65 40 65C42.7614 65 45 62.7614 45 60" />
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="liquid-glow-orb bg-purple-600/10 w-[600px] h-[600px] top-1/3 -left-40"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 reveal-up">
            <div className="section-label mb-4 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              THE STANDARD FOR GLOBAL FIRMS
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-sans font-black tracking-tighter uppercase">
              WHY THE WORLD'S<br /><span className="text-accent italic drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">LEADING SaaS</span> TRUST US
            </h2>
          </div>

          <div className="space-y-4">
            {ADVANTAGES.map((adv, idx) => (
              <div 
                key={idx} 
                className="liquid-glass-item rounded-2xl p-6 sm:p-8 border border-white/15 hover:border-accent/60 transition-all reveal-up shadow-lg"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className={cn(
                    "text-xl sm:text-2xl md:text-3xl font-sans font-black tracking-tight transition-colors",
                    activeAccordion === idx ? "text-accent drop-shadow-[0_0_10px_rgba(200,241,53,0.3)]" : "text-white group-hover:text-accent"
                  )}>
                    {adv.title}
                  </span>
                  <div className={cn(
                    "w-9 h-9 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center transition-all duration-300 shadow-md shrink-0 ml-4",
                    activeAccordion === idx ? "rotate-45 border-accent text-accent bg-accent/20 shadow-[0_0_15px_rgba(200,241,53,0.3)]" : "group-hover:border-accent group-hover:text-accent"
                  )}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  <p className="pt-6 text-white/80 text-xs sm:text-sm tracking-wide leading-relaxed font-mono border-t border-white/10 mt-6">
                    {adv.content}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section (Spatial UI Liquid Glass) */}
      <section className="py-32 px-6 bg-black relative overflow-hidden border-t border-white/10">
        {/* Glowing atmospheric orbs */}
        <div className="liquid-glow-orb bg-accent/15 w-[550px] h-[550px] -top-20 -left-20"></div>
        <div className="liquid-glow-orb bg-emerald-500/10 w-[500px] h-[500px] bottom-0 right-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal-up">
            <div className="section-label mb-4 text-accent inline-block bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold backdrop-blur-md">
              SIMPLE 3-STEP WORKFLOW
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tighter uppercase">
              HOW <span className="text-accent italic drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">PAPERLOO</span> WORKS
            </h2>
            <p className="text-white/70 text-xs sm:text-sm tracking-widest max-w-xl mx-auto mt-4 uppercase font-mono">
              Automated legal protection for your agency clients and SaaS applications in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Step 1: Automated Site Audit (Spatial Glass Card) */}
            <div className="spatial-glass-card liquid-glass-card spatial-glass-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/20 shadow-2xl group reveal-up space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent bg-accent/15 border border-accent/40 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(200,241,53,0.2)]">
                    STEP 01
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center group-hover:border-accent/60 group-hover:text-accent transition-all">
                    <Search className="w-5 h-5 text-white/80 group-hover:text-accent transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-sans font-black tracking-tight text-white uppercase group-hover:text-accent transition-colors">
                    AUTOMATED SITE AUDIT
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Scan any client URL to automatically detect data collection points, analytics scripts, and missing required legal disclosures.
                  </p>
                </div>

                {/* Visual Widget 1: Spatial Scanner UI */}
                <div className="liquid-glass-item border border-white/20 p-4 rounded-2xl font-mono text-xs space-y-3 mt-4 shadow-inner">
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl border border-white/15 backdrop-blur-md">
                    <Search className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-[11px] text-white truncate font-bold">https://client-agency.com</span>
                    <span className="ml-auto text-[9px] text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">SCANNING</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-white/70">
                      <span>DOM Audit Progress</span>
                      <span className="text-accent font-bold">100% Complete</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="bg-gradient-to-r from-accent to-emerald-400 h-full w-full rounded-full shadow-[0_0_10px_rgba(200,241,53,0.8)]"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/15 text-center">
                      <span className="block font-black text-white text-base font-mono">14</span>
                      <span className="text-white/60">Trackers Found</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/15 text-center">
                      <span className="block font-black text-emerald-400 text-base font-mono">0</span>
                      <span className="text-emerald-300 font-bold">Missing Policies</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-white/15 text-[11px] text-white/80 font-mono">
                {['Detect PII & Third-Party Trackers', 'Map Target Global Jurisdictions', 'Identify Missing Disclosure Pages'].map((b, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 2: One-Click Policy Setup (Spatial Glass Card) */}
            <div className="spatial-glass-card liquid-glass-card spatial-glass-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/20 shadow-2xl group reveal-up space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent bg-accent/15 border border-accent/40 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(200,241,53,0.2)]">
                    STEP 02
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center group-hover:border-accent/60 group-hover:text-accent transition-all">
                    <Code className="w-5 h-5 text-white/80 group-hover:text-accent transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-sans font-black tracking-tight text-white uppercase group-hover:text-accent transition-colors">
                    ONE-CLICK POLICY SETUP
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Generate customized, attorney-vetted legal documents and embed them on your client sites using a single line of script.
                  </p>
                </div>

                {/* Visual Widget 2: Policy Snippet & Toggles */}
                <div className="liquid-glass-item border border-white/20 p-4 rounded-2xl font-mono text-xs space-y-3 mt-4 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-white/70 border-b border-white/15 pb-2">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-accent" /> Zero-Code Embed Snippet
                    </span>
                    <span className="text-accent text-[9px] font-bold bg-accent/15 px-2 py-0.5 rounded-full border border-accent/30">1-LINE SCRIPT</span>
                  </div>

                  <div className="bg-black/60 p-3 rounded-xl border border-white/15 text-[10px] text-muted overflow-x-auto">
                    <code className="text-emerald-300 font-bold whitespace-nowrap">
                      &lt;script src="https://cdn.paperloo.ai/v2/sdk.js" data-site="ag_8f921"&gt;&lt;/script&gt;
                    </code>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {[
                      { label: 'Privacy Policy (GDPR/CCPA)', enabled: true },
                      { label: 'Terms of Service', enabled: true },
                      { label: 'Cookie Banner + Opt-Out', enabled: true }
                    ].map((t, tidx) => (
                      <div key={tidx} className="flex items-center justify-between text-[10px] bg-black/40 px-3 py-1.5 rounded-lg border border-white/15">
                        <span className="text-white font-semibold">{t.label}</span>
                        <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-full">[ACTIVE]</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-white/15 text-[11px] text-white/80 font-mono">
                {['Tailored Agency & SaaS Clauses', 'White-Label Branding Customization', 'Zero-Code 1-Line Script Embed'].map((b, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 3: Autonomous Protection (Spatial Glass Card) */}
            <div className="spatial-glass-card liquid-glass-card spatial-glass-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/20 shadow-2xl group reveal-up space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent bg-accent/15 border border-accent/40 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(200,241,53,0.2)]">
                    STEP 03
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center group-hover:border-accent/60 group-hover:text-accent transition-all">
                    <Globe className="w-5 h-5 text-white/80 group-hover:text-accent transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-sans font-black tracking-tight text-white uppercase group-hover:text-accent transition-colors">
                    AUTONOMOUS PROTECTION
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Paperloo continuously monitors global legislation changes and updates your live policies automatically with zero downtime.
                  </p>
                </div>

                {/* Visual Widget 3: Live CDN Edge Status */}
                <div className="liquid-glass-item border border-white/20 p-4 rounded-2xl font-mono text-xs space-y-3 mt-4 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-white/70 border-b border-white/15 pb-2">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-accent" /> Global Edge CDN Distribution
                    </span>
                    <span className="text-emerald-300 text-[9px] font-bold bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">12 NODES LIVE</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] bg-black/40 p-2.5 rounded-xl border border-white/15">
                      <span className="text-white font-semibold">US-East Node (Virginia)</span>
                      <span className="text-emerald-400 font-bold font-mono">1.1ms</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] bg-black/40 p-2.5 rounded-xl border border-white/15">
                      <span className="text-white font-semibold">EU-Central Node (Frankfurt)</span>
                      <span className="text-emerald-400 font-bold font-mono">1.4ms</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/15 border border-emerald-400/30 p-3 rounded-xl flex items-center gap-2.5 shadow-inner">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">STATUTORY AUDIT CERTIFICATE ISSUED</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-white/15 text-[11px] text-white/80 font-mono">
                {['Real-Time Global Law Updates', '24/7 Automated Vulnerability Monitoring', 'Downloadable Legal Audit Certificates'].map((b, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section (Spatial Glass UI) */}
      <section className="py-32 px-6 bg-black text-center relative overflow-hidden">
        <div className="liquid-glow-orb bg-accent/20 w-[600px] h-[600px] top-10 left-1/2 -translate-x-1/2"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="spatial-glass-card liquid-glass-card rounded-3xl p-12 sm:p-20 border border-white/20 shadow-2xl relative overflow-hidden reveal-up">
            <h2 className="text-5xl sm:text-7xl md:text-[90px] font-sans font-black tracking-tight leading-none mb-8 uppercase text-white">
              READY FOR <br /><span className="text-accent italic drop-shadow-[0_0_30px_rgba(200,241,53,0.4)]">INFRASTRUCTURE?</span>
            </h2>
            <p className="text-white/80 text-xs sm:text-sm md:text-base tracking-widest mb-12 max-w-2xl mx-auto font-mono uppercase">
              WE ARE CURRENTLY ACCEPTING A LIMITED NUMBER OF ENTERPRISE PILOT PARTNERS.
            </p>
            {user ? (
              <Link to="/dashboard" className="bracket-btn inline-block border-accent text-accent shadow-[0_0_30px_rgba(200,241,53,0.3)] hover:scale-105 transition-transform">
                <span className="bracket-btn-inner"></span>
                GO TO DASHBOARD
              </Link>
            ) : (
              <Link to="/signup" className="bracket-btn inline-block shadow-[0_0_30px_rgba(200,241,53,0.3)] hover:scale-105 transition-transform">
                <span className="bracket-btn-inner"></span>
                APPLY FOR EARLY ACCESS
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust Center / Data Integrity Section (Spatial UI) */}
      <section className="py-32 px-6 border-y border-white/10 bg-black relative overflow-hidden">
        <div className="liquid-glow-orb bg-emerald-500/10 w-[500px] h-[500px] top-1/2 -right-30"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="spatial-glass-card liquid-glass-card p-8 sm:p-12 rounded-3xl border border-white/20 shadow-2xl reveal-up">
            <div className="section-label mb-6 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              TRUST CENTER & DATA INTEGRITY
            </div>
            <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tighter mb-6 italic uppercase text-white">
              YOUR DATA IS <span className="text-accent underline decoration-2 drop-shadow-[0_0_15px_rgba(200,241,53,0.3)]">SECURE.</span>
            </h2>
            <div className="space-y-4 text-white/80 text-xs sm:text-sm tracking-wide leading-relaxed font-mono">
              <p>THE PAPERLOO PLATFORM IS BUILT WITH A SECURITY-FIRST ARCHITECTURE. ALL DATA IS ENCRYPTED AT REST VIA AES-256 AND PROTECTED DURING TRANSIT WITH TLS 1.3 PROTOCOLS.</p>
              <p>WE ADHERE TO SOC2-ALIGNED GOVERNANCE PRACTICES, ENSURING THAT OUR AUTOMATED WORKFLOWS MEET THE RIGOROUS STANDARDS REQUIRED BY GLOBAL ENTERPRISE LEGAL DEPARTMENTS.</p>
            </div>
            <Link to="/trust" className="inline-flex items-center gap-2 mt-8 text-xs font-mono font-bold tracking-widest text-accent bg-accent/10 border border-accent/30 px-5 py-2.5 rounded-full hover:bg-accent/20 transition-all shadow-md">
              VIEW FULL SECURITY WHITEPAPER →
            </Link>
          </div>

          <div className="reveal-up delay-200">
            <div className="spatial-glass-card liquid-glass-card aspect-square rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
              <div className="absolute inset-0 grid-dots opacity-20"></div>
              <div className="w-28 h-28 border-2 border-accent/80 rounded-2xl flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700 bg-accent/10 shadow-[0_0_30px_rgba(200,241,53,0.25)] backdrop-blur-md">
                <ShieldCheck className="w-14 h-14 text-accent -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
              </div>
              <div className="space-y-3 mt-10">
                <p className="text-3xl font-sans font-black tracking-wide text-white">SOC2 ALIGNED</p>
                <p className="text-xs font-mono font-bold tracking-widest text-accent bg-accent/10 border border-accent/30 px-4 py-1.5 rounded-full">
                  ENTERPRISE-STRENGTH PROTECTION
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Spatial UI Liquid Glass) */}
      <section className="py-32 px-6 bg-black relative">
        <div className="liquid-glow-orb bg-accent/10 w-[450px] h-[450px] bottom-10 left-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-20 text-center reveal-up">
            <div className="section-label mb-4 text-accent inline-block bg-accent/10 border border-accent/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
              KNOWLEDGE BASE
            </div>
            <h2 className="text-4xl md:text-6xl font-sans font-black tracking-tighter italic uppercase text-white">
              FREQUENTLY ASKED <span className="text-accent drop-shadow-[0_0_20px_rgba(200,241,53,0.3)]">QUESTIONS</span>
            </h2>
          </div>

          <div className="space-y-4 reveal-up">
            {[
              { q: 'What is Paperloo?', a: 'Paperloo is a comprehensive compliance infrastructure platform designed to automate the generation of legal documents, cookie scanners, and governance policies for global agencies.' },
              { q: 'Is the compliance score accurate?', a: 'Yes, our high-fidelity auditing engine relies strictly on actual generated documents and deployed mechanisms across your domains, ensuring a 100% authentic compliance grade.' },
              { q: 'Do you provide legal advice?', a: 'No. Paperloo is an automated infrastructure platform. All generated documents should be reviewed by qualified legal counsel prior to use.' },
              { q: 'Can I connect multiple Github repositories?', a: 'Yes, our GitHub integration allows you to instantly import multiple live web properties and automatically inject compliance structures into them.' }
            ].map((faq, i) => (
              <div key={i} className="liquid-glass-item spatial-glass-hover rounded-2xl p-6 sm:p-8 border border-white/15 backdrop-blur-xl shadow-lg hover:border-accent/60 transition-all">
                <h3 className="text-lg sm:text-xl font-sans font-black tracking-tight text-white uppercase mb-3 flex items-center gap-3">
                  <span className="text-accent font-mono text-sm bg-accent/15 px-2.5 py-0.5 rounded-md border border-accent/30">Q</span>
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm font-mono text-white/70 leading-relaxed tracking-wide uppercase pl-9 border-l-2 border-accent/40">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-12 mb-24 uppercase">
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-6">
              <div className="text-2xl sm:text-3xl font-black logo tracking-wider leading-tight text-white block">
                PAPERLOO <span className="text-accent">INFRASTRUCTURE</span>
              </div>
              <p className="text-muted text-[10px] tracking-[0.15em] max-w-sm leading-relaxed">
                THE GLOBAL STANDARD FOR AUTOMATED COMPLIANCE INFRASTRUCTURE.
              </p>
              <div className="space-y-2">
                <p className="text-accent text-sm tracking-[0.1em]">compliance@paperloo.com</p>
                <div className="pt-2 space-y-1">
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
