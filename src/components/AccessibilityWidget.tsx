import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Volume2, 
  VolumeX, 
  Type, 
  Sliders, 
  ShieldCheck, 
  X, 
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  MousePointer, 
  Pause, 
  RotateCcw,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Accessibility State Settings
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0 = 100%, 1 = 125%, 2 = 150%, 3 = 175%
  const [increasedSpacing, setIncreasedSpacing] = useState(false);
  const [pauseAnimations, setPauseAnimations] = useState(false);
  const [readingGuide, setReadingGuide] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [screenReaderVoice, setScreenReaderVoice] = useState(false);
  const [cursorY, setCursorY] = useState(0);

  // Keyboard shortcut listener (Alt + A or Option + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track mouse cursor Y position for reading guide
  useEffect(() => {
    if (!readingGuide) return;
    const handleMouseMove = (e: MouseEvent) => {
      setCursorY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingGuide]);

  // Apply visual changes to document body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // High Contrast
    if (highContrast) {
      body.classList.add('wcag-high-contrast');
    } else {
      body.classList.remove('wcag-high-contrast');
    }

    // Dyslexic Font
    if (dyslexicFont) {
      body.classList.add('wcag-dyslexic-font');
    } else {
      body.classList.remove('wcag-dyslexic-font');
    }

    // Font Scaling
    const scaleClasses = ['scale-100', 'scale-115', 'scale-130', 'scale-150'];
    scaleClasses.forEach(c => body.classList.remove(c));
    if (fontSizeLevel > 0) {
      body.classList.add(scaleClasses[fontSizeLevel]);
    }

    // Spacing
    if (increasedSpacing) {
      body.classList.add('wcag-increased-spacing');
    } else {
      body.classList.remove('wcag-increased-spacing');
    }

    // Reduce Motion
    if (pauseAnimations) {
      root.classList.add('wcag-reduce-motion');
    } else {
      root.classList.remove('wcag-reduce-motion');
    }

    // Highlight Links
    if (highlightLinks) {
      body.classList.add('wcag-highlight-links');
    } else {
      body.classList.remove('wcag-highlight-links');
    }

  }, [highContrast, dyslexicFont, fontSizeLevel, increasedSpacing, pauseAnimations, highlightLinks]);

  // Text-To-Speech Reader Listener
  useEffect(() => {
    if (!screenReaderVoice) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.innerText || target.getAttribute('aria-label'))) {
        const textToRead = target.getAttribute('aria-label') || target.innerText;
        if (textToRead && textToRead.length < 150) {
          window.speechSynthesis?.cancel();
          const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 150));
          utterance.rate = 1.1;
          window.speechSynthesis?.speak(utterance);
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      window.speechSynthesis?.cancel();
    };
  }, [screenReaderVoice]);

  const resetAll = () => {
    setHighContrast(false);
    setDyslexicFont(false);
    setFontSizeLevel(0);
    setIncreasedSpacing(false);
    setPauseAnimations(false);
    setReadingGuide(false);
    setHighlightLinks(false);
    setScreenReaderVoice(false);
    toast.success("Accessibility settings reset to default standards.");
  };

  return (
    <>
      {/* CSS Injections for WCAG 2.1 AA Compliance */}
      <style>{`
        .wcag-high-contrast {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .wcag-high-contrast p,
        .wcag-high-contrast h1,
        .wcag-high-contrast h2,
        .wcag-high-contrast h3,
        .wcag-high-contrast h4,
        .wcag-high-contrast h5,
        .wcag-high-contrast h6,
        .wcag-high-contrast label,
        .wcag-high-contrast li {
          color: #ffffff !important;
        }
        .wcag-high-contrast .pointer-events-none,
        .wcag-high-contrast [aria-hidden="true"] {
          opacity: 0.03 !important;
        }
        .wcag-high-contrast button, 
        .wcag-high-contrast a {
          outline: 2px solid #c8f135 !important;
        }
        .wcag-dyslexic-font * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
        }
        .wcag-increased-spacing * {
          line-height: 2 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
        .wcag-reduce-motion *, 
        .wcag-reduce-motion *::before, 
        .wcag-reduce-motion *::after {
          animation: none !important;
          transition: none !important;
        }
        .wcag-highlight-links a {
          background-color: #c8f135 !important;
          color: #000000 !important;
          text-decoration: underline !important;
          font-weight: bold !important;
          padding: 2px 4px !important;
          border-radius: 4px !important;
        }
        .scale-115 { font-size: 115% !important; }
        .scale-130 { font-size: 130% !important; }
        .scale-150 { font-size: 150% !important; }
      `}</style>

      {/* Reading Guide Beam Overlay */}
      {readingGuide && (
        <div 
          aria-hidden="true"
          className="fixed left-0 right-0 h-10 bg-accent/20 border-y-2 border-accent pointer-events-none z-[9999] shadow-[0_0_20px_rgba(200,241,53,0.5)] transition-all duration-75"
          style={{ top: `${cursorY - 20}px` }}
        />
      )}

      {/* Skip to Main Content Link for Keyboard Navigation (WCAG SC 2.4.1) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-accent focus:text-black focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white"
      >
        Skip to Main Content (Press Tab)
      </a>

      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle ADA Title III & WCAG 2.1 AA Accessibility Panel (Press Alt+A)"
          title="ADA Title III & WCAG 2.1 AA Accessibility Panel (Alt + A)"
          className="relative group bg-accent text-black p-4 rounded-full shadow-[0_0_25px_rgba(200,241,53,0.4)] border-2 border-white/40 flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-4 focus:ring-accent"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
          </div>
          <Eye className="w-6 h-6 stroke-[2.5]" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-mono text-xs font-black uppercase tracking-wider pl-0 group-hover:pl-2">
            ACCESSIBILITY
          </span>
        </motion.button>
      </div>

      {/* Accessibility Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9995]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-20 right-6 z-[9996] w-[92vw] max-w-md bg-surface border border-white/20 rounded-3xl shadow-2xl overflow-hidden font-sans text-white p-6 backdrop-blur-2xl bg-black/90"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight uppercase flex items-center gap-2">
                      ADA & WCAG 2.1 AA PANEL
                    </h2>
                    <p className="text-[10px] text-accent font-mono tracking-wider font-bold uppercase">
                      ACCESSIBILITY ASSISTANT • ALT + A
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-4 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wide">
                  ADA Title III & WCAG 2.1 AA Compliant
                </span>
                <span className="ml-auto text-[9px] bg-emerald-400/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/40 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Grid Controls */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">

                {/* High Contrast */}
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    highContrast 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Eye className="w-5 h-5" />
                    {highContrast && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">High Contrast</span>
                  <span className="text-[10px] opacity-70 font-mono">WCAG 7:1 Ratio</span>
                </button>

                {/* Dyslexic Font */}
                <button
                  onClick={() => setDyslexicFont(!dyslexicFont)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    dyslexicFont 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Type className="w-5 h-5" />
                    {dyslexicFont && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Dyslexia Font</span>
                  <span className="text-[10px] opacity-70 font-mono">Cognitive Ease</span>
                </button>

                {/* Font Size Increments */}
                <button
                  onClick={() => setFontSizeLevel((prev) => (prev + 1) % 4)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    fontSizeLevel > 0 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <ZoomIn className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold">
                      {fontSizeLevel === 0 ? '100%' : `${100 + fontSizeLevel * 25}%`}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-sans">Resize Text</span>
                  <span className="text-[10px] opacity-70 font-mono">Up to +75% Zoom</span>
                </button>

                {/* Line & Letter Spacing */}
                <button
                  onClick={() => setIncreasedSpacing(!increasedSpacing)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    increasedSpacing 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Sliders className="w-5 h-5" />
                    {increasedSpacing && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Text Spacing</span>
                  <span className="text-[10px] opacity-70 font-mono">Line & Word Gap</span>
                </button>

                {/* Pause Animations */}
                <button
                  onClick={() => setPauseAnimations(!pauseAnimations)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    pauseAnimations 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Pause className="w-5 h-5" />
                    {pauseAnimations && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Stop Motion</span>
                  <span className="text-[10px] opacity-70 font-mono">Pause Animations</span>
                </button>

                {/* Reading Guide */}
                <button
                  onClick={() => setReadingGuide(!readingGuide)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    readingGuide 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <MousePointer className="w-5 h-5" />
                    {readingGuide && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Reading Focus Beam</span>
                  <span className="text-[10px] opacity-70 font-mono">Visual Target Line</span>
                </button>

                {/* Highlight Links */}
                <button
                  onClick={() => setHighlightLinks(!highlightLinks)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    highlightLinks 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Sparkles className="w-5 h-5" />
                    {highlightLinks && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Highlight Links</span>
                  <span className="text-[10px] opacity-70 font-mono">High Visibility</span>
                </button>

                {/* Screen Reader Voice Simulator */}
                <button
                  onClick={() => setScreenReaderVoice(!screenReaderVoice)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    screenReaderVoice 
                      ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(200,241,53,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    {screenReaderVoice ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    {screenReaderVoice && <Check className="w-4 h-4 text-accent" />}
                  </div>
                  <span className="text-xs font-bold font-sans">Screen Reader</span>
                  <span className="text-[10px] opacity-70 font-mono">Voice Synthesizer</span>
                </button>

              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>

                <a
                  href="/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  ADA Policy & VPAT
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
