/**
 * LandingPage — Module 2
 * Hero communicates the product in 5 seconds: animated translation demo,
 * three entry actions, strong StyleSpeak brand identity.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ImagePlus, MessageSquare, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import { useChatStore } from '../store/chatStore';

/* ── Logo mark ── */
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
        <rect x="2" y="4" width="26" height="18" rx="6" fill="url(#lg)" />
        <path d="M8 22 L6 28 L14 22 Z" fill="url(#lg)" />
        <path d="M16 8 C16 8 16 6 18 6 C20 6 20 8 18 9 L11 13 L21 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── Animated Translation Demo ── */
const DEMO_EXAMPLES = [
  {
    input: "I want that loose shirt with big sleeves",
    terms: ["Drop Shoulder", "Relaxed Fit", "Camp Collar", "Korean Casual"],
  },
  {
    input: "The hoodie from Stranger Things",
    terms: ["Vintage Wash", "Boxy Crop", "Streetwear Core", "Oversized Fleece"],
  },
  {
    input: "Office shoes that aren't boring",
    terms: ["Chelsea Boot", "Monk Strap", "Derby Oxford", "Business Casual"],
  },
];

function TranslationDemo() {
  const [exIdx, setExIdx] = useState(0);
  const [visibleTerms, setVisibleTerms] = useState<number>(0);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const example = DEMO_EXAMPLES[exIdx];
    setVisibleTerms(0);
    setShowTerms(false);
    const t1 = setTimeout(() => setShowTerms(true), 800);
    const timers: ReturnType<typeof setTimeout>[] = [t1];
    example.terms.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleTerms(i + 1), 1000 + i * 350));
    });
    timers.push(setTimeout(() => {
      setExIdx(prev => (prev + 1) % DEMO_EXAMPLES.length);
    }, 4200));
    return () => timers.forEach(clearTimeout);
  }, [exIdx]);

  const ex = DEMO_EXAMPLES[exIdx];

  return (
    <div style={{
      background: 'var(--dark-800)',
      border: '1px solid var(--dark-600)',
      borderRadius: '20px',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
    }}>
      {/* Top bar */}
      <div style={{ background: 'var(--dark-750)', borderBottom: '1px solid var(--dark-600)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: ['#ef4444','#f59e0b','#22c55e'][i] }} />)}
        <span style={{ marginLeft: 8, fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>StyleSpeak — Live Translation</span>
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', minHeight: 130 }}>
        {/* User input column */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>You say</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={exIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{ background: 'linear-gradient(135deg,#a855f7,#7e22ce)', borderRadius: '12px', padding: '12px 14px' }}
            >
              <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.5, fontStyle: 'italic' }}>"{ex.input}"</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow */}
        <div style={{ paddingTop: 28, color: 'var(--primary-500)', fontSize: '20px', flexShrink: 0 }}>→</div>

        {/* Translated terms column */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 700 }}>StyleSpeak translates</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ex.terms.map((term, i) => (
              <AnimatePresence key={`${exIdx}-${i}`}>
                {showTerms && visibleTerms > i && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>✓</span>
                    <span className="term-pill" style={{ cursor: 'default', fontSize: '12px' }}>{term}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Three Entry Actions ── */
function EntryActions() {
  const navigate = useNavigate();
  const { createConversation } = useChatStore();

  const goToChat = (mode?: string) => {
    createConversation();
    navigate(mode ? `/chat?mode=${mode}` : '/chat');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      {[
        { icon: Mic, label: 'Speak', sub: 'Talk to StyleSpeak', mode: 'voice', accent: '#a855f7' },
        { icon: ImagePlus, label: 'Upload Photo', sub: 'Show what you mean', mode: 'image', accent: '#f97316' },
        { icon: MessageSquare, label: 'Describe', sub: 'Type in your words', mode: 'text', accent: '#22c55e' },
      ].map(({ icon: Icon, label, sub, mode, accent }) => (
        <motion.button
          key={mode}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => goToChat(mode)}
          style={{
            background: 'var(--dark-800)',
            border: `1px solid var(--dark-600)`,
            borderRadius: '16px',
            padding: '20px 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = `${accent}50`;
            e.currentTarget.style.boxShadow = `0 8px 32px ${accent}15`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--dark-600)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${accent}15`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} style={{ color: accent }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Main Landing Page ── */
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark-900)', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoMark size={32} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600 }}>
            Style<span className="gradient-brand-text">Speak</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <Link to="/chat" className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
            Start Translating <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '110px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '15%', left: '30%', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(126,34,206,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}
        >


          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '20px' }}
          >
            Fashion is a language.
            <br />
            <span className="gradient-brand-text">We translate it.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 48px', lineHeight: 1.7 }}
          >
            Describe clothes in your own words. StyleSpeak converts them into professional fashion terms and recommends complete outfits.
          </motion.p>

          {/* Translation Demo */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginBottom: '36px' }}>
            <TranslationDemo />
          </motion.div>

          {/* Three Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              How do you want to start?
            </p>
            <EntryActions />
          </motion.div>
        </motion.div>
      </section>



      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--dark-600)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogoMark size={24} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: 'var(--text-secondary)' }}>StyleSpeak</span>
        </div>


      </footer>
    </div>
  );
}
