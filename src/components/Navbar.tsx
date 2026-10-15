import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Menu, X, ShieldCheck, Terminal, Search, FileText } from 'lucide-react';

interface NavbarProps {
  isDarkTheme?: boolean;
  onRequestBrief?: () => void;
  onOpenScanner?: () => void;
  onOpenCockpit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRequestBrief,
  onOpenScanner,
  onOpenCockpit,
}) => {
  const [isOverPaleSection, setIsOverPaleSection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'The Statute' | 'Pillars' | 'Audit Stack' | 'Cockpit'>('Overview');
  const navRef = useRef<HTMLElement | null>(null);

  // Passive scroll listener: set isOverPaleSection after scrollY > window.innerHeight * 0.7
  useEffect(() => {
    const handleScroll = () => {
      const paleThreshold = window.innerHeight * 0.7;
      setIsOverPaleSection(window.scrollY > paleThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Lock body overflow when mobile menu is open, handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navItems: Array<'Overview' | 'The Statute' | 'Pillars' | 'Audit Stack' | 'Cockpit'> = [
    'Overview',
    'The Statute',
    'Pillars',
    'Audit Stack',
    'Cockpit',
  ];

  const handleNavClick = (label: 'Overview' | 'The Statute' | 'Pillars' | 'Audit Stack' | 'Cockpit') => {
    setActiveTab(label);
    setMobileMenuOpen(false);

    if (label === 'Overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'The Statute') {
      const el = document.getElementById('about-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (label === 'Pillars') {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (label === 'Audit Stack') {
      if (onOpenScanner) onOpenScanner();
    } else if (label === 'Cockpit') {
      if (onOpenCockpit) onOpenCockpit();
    }
  };

  return (
    <>
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-10 py-4 transition-colors duration-300"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Mark: Paperloo Geometric Compliance Mark */}
          <button
            onClick={() => handleNavClick('Overview')}
            aria-label="Paperloo Home"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-lg p-1 transition-transform active:scale-98"
          >
            {/* Paperloo high-precision geometric mark */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg
                className={`w-8 h-8 transition-colors duration-300 ${
                  isOverPaleSection ? 'text-black' : 'text-white'
                }`}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Shield / Document outer contour */}
                <rect
                  x="4"
                  y="4"
                  width="24"
                  height="24"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-90"
                />
                {/* Clean statutory lines */}
                <path
                  d="M10 11H22M10 16H18M10 21H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Verified emerald pulse pin */}
                <circle cx="21" cy="21" r="3" className="fill-[#10B981]" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span
                  className={`font-jetbrains font-bold tracking-widest text-sm transition-colors duration-300 ${
                    isOverPaleSection ? 'text-black' : 'text-white'
                  }`}
                >
                  PAPERLOO
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                  STATUTORY V4.2
                </span>
              </div>
            </div>
          </button>

          {/* Center Desktop Navigation: white rounded-lg pill with shadow */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center bg-white/95 backdrop-blur-md rounded-lg shadow-md px-1.5 py-1 border border-black/5"
          >
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeTab === item;
                return (
                  <button
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className={`font-jetbrains text-xs tracking-tight transition-all duration-150 px-3.5 py-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] active:scale-98 ${
                      isActive
                        ? 'bg-black text-white font-medium shadow-xs'
                        : 'text-black/70 hover:text-black font-normal hover:bg-black/5'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Desktop CTA: black rounded-lg button with white/10 36px square */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => {
                if (onOpenScanner) onOpenScanner();
              }}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-black text-white px-3 py-1.5 font-jetbrains text-xs font-medium tracking-tight shadow-sm hover:bg-zinc-900 active:scale-98 transition-all duration-150 border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              <span className="pl-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#10B981]" />
                Audit Stack
              </span>
              <span className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center transition-transform duration-150 group-hover:translate-x-0.5">
                <ChevronRight className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className={`w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] active:scale-98 ${
                isOverPaleSection && !mobileMenuOpen
                  ? 'bg-black/5 border-black/10 text-black'
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    mobileMenuOpen
                      ? 'opacity-0 rotate-90 scale-75'
                      : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X
                  className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform ${
                    mobileMenuOpen
                      ? 'opacity-100 rotate-0 scale-100 text-white'
                      : 'opacity-0 -rotate-90 scale-75'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Overlay */}
      <div
        id="mobile-navigation-menu"
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl lg:hidden flex flex-col justify-between px-6 pt-24 pb-8 transition-opacity duration-700 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex flex-col space-y-3 pt-6">
          {navItems.map((item, index) => {
            const isActive = activeTab === item;
            const staggerDelay = mobileMenuOpen
              ? 150 + index * 70
              : (navItems.length - index) * 30;

            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                style={{
                  transitionDelay: `${staggerDelay}ms`,
                  transitionDuration: '500ms',
                }}
                className={`w-full flex items-center justify-between text-left p-4 rounded-xl font-jetbrains text-2xl tracking-tight transition-all active:scale-98 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                  isActive
                    ? 'text-white bg-white/10 font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5 font-normal'
                } ${
                  mobileMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <span>{item}</span>
                {isActive && (
                  <ChevronRight className="w-6 h-6 text-[#10B981]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom CTA container */}
        <div className="pt-6 space-y-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenScanner) onOpenScanner();
            }}
            className="w-full py-4 px-6 rounded-xl bg-[#10B981] text-black font-jetbrains text-base font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] active:scale-98 transition-transform shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Scan Your Stack Live</span>
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
          <p className="font-jetbrains text-xs text-white/40 text-center tracking-tight">
            Automated compliance infrastructure for engineering founders.
          </p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
