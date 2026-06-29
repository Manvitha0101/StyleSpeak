/**
 * FashionTermModal — Module 7
 * Clicking any fashion term in StyleSpeak opens this modal with a full definition,
 * history, use cases, and related styles — powered by Gemini.
 */
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Props {
  term: string;
  onClose: () => void;
}

interface TermData {
  definition: string;
  history?: string;
  whoWears?: string;
  whenToWear?: string;
  similarStyles?: string[];
}

// Simple in-memory cache so we don't re-fetch the same term
const termCache: Record<string, TermData> = {};

function parseTermData(text: string): TermData {
  // Try to parse structured response, fall back to full text as definition
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) as TermData; } catch { /* fall through */ }
  }
  return { definition: text };
}

export default function FashionTermModal({ term, onClose }: Props) {
  const [data, setData] = useState<TermData | null>(termCache[term] ?? null);
  const [loading, setLoading] = useState(!termCache[term]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termCache[term]) { setData(termCache[term]); setLoading(false); return; }

    setLoading(true);
    const prompt = `You are StyleSpeak, an AI fashion dictionary. Explain the fashion term "${term}" with this JSON structure:
{
  "definition": "Clear 2-sentence definition",
  "history": "Brief origin/history (1-2 sentences)",
  "whoWears": "Who typically wears it (celebrities, subcultures, etc.)",
  "whenToWear": "Best occasions or contexts to wear it",
  "similarStyles": ["related term 1", "related term 2", "related term 3"]
}
Only return the JSON object. No extra text.`;

    geminiService.explainTerm(prompt)
      .then(text => {
        const parsed = parseTermData(text);
        termCache[term] = parsed;
        setData(parsed);
      })
      .catch(() => {
        const fallback: TermData = { definition: `${term} is a fashion style or construction technique. Please check your API key to see the full definition.` };
        setData(fallback);
      })
      .finally(() => setLoading(false));
  }, [term]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            background: 'var(--dark-800)',
            border: '1px solid var(--dark-600)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-600)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} style={{ color: 'var(--primary-400)' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Fashion Dictionary</p>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 600 }}>{term}</h3>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--dark-700)', border: '1px solid var(--dark-600)', borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  StyleSpeak is looking this up...
                </div>
                {[80, 60, 90, 70].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
                ))}
              </div>
            ) : data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Definition</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7 }}>{data.definition}</p>
                </div>
                {data.history && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Origin</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.history}</p>
                  </div>
                )}
                {data.whoWears && (
                  <div style={{ background: 'var(--dark-700)', borderRadius: '12px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Who Wears It</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.whoWears}</p>
                  </div>
                )}
                {data.whenToWear && (
                  <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: '12px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>When to Wear</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.whenToWear}</p>
                  </div>
                )}
                {data.similarStyles && data.similarStyles.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Similar Styles</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.similarStyles.map((s, i) => <span key={i} className="tag">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
