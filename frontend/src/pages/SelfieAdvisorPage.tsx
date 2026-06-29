import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Sparkles, Camera, X } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import type { SelfieAnalysis } from '../types';

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result.split(',')[1], mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const COLOR_MAP: Record<string, string> = {
  black: '#1a1a1a', white: '#f5f5f5', navy: '#1e3a5f', beige: '#d4b896',
  cream: '#fffdd0', burgundy: '#800020', olive: '#6b6b2a', grey: '#888',
  gray: '#888', camel: '#c19a6b', brown: '#795548', forest: '#228b22',
  sage: '#77a67b', dusty: '#a8908c', slate: '#708090', cobalt: '#0047ab',
  emerald: '#50c878', rust: '#b7410e', terracotta: '#c66b33', lavender: '#967bb6',
  pink: '#e75480', coral: '#ff6b6b', yellow: '#f5c542', orange: '#f97316',
  purple: '#a855f7', blue: '#3b82f6', green: '#22c55e', red: '#ef4444',
  teal: '#14b8a6', gold: '#d4af37', silver: '#c0c0c0',
};

function getColorSwatch(colorName: string): string {
  const lower = colorName.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return '#666';
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--dark-700)', borderRadius: '10px', border: '1px solid var(--dark-600)' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: getColorSwatch(color), border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{color}</span>
    </div>
  );
}

function AnalysisResult({ analysis, message }: { analysis: SelfieAnalysis; message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* AI Message */}
      <div style={{ background: 'var(--dark-700)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'linear-gradient(135deg, #f97316, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✨</div>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>StyleSense AI Advisor</p>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{message}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Skin Tone */}
        {analysis.skinTone && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Skin Tone</p>
            <p style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize' }}>{analysis.skinTone}</p>
          </div>
        )}

        {/* Recommended Colors */}
        {analysis.recommendedColors && analysis.recommendedColors.length > 0 && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>✅ Colors That Work For You</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.recommendedColors.map((c, i) => <ColorSwatch key={i} color={c} />)}
            </div>
          </div>
        )}

        {/* Colors to Avoid */}
        {analysis.colorsToAvoid && analysis.colorsToAvoid.length > 0 && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>⚠️ Colors to Tone Down</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.colorsToAvoid.map((c, i) => <ColorSwatch key={i} color={c} />)}
            </div>
          </div>
        )}

        {/* Recommended Fits */}
        {analysis.recommendedFits && analysis.recommendedFits.length > 0 && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>👕 Best Fits For You</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.recommendedFits.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(168,85,247,0.08)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--primary-400)', fontSize: '12px' }}>◆</span>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Style Recommendations */}
        {analysis.recommendedStyles && analysis.recommendedStyles.length > 0 && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>🌟 Your Style Directions</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {analysis.recommendedStyles.map((s, i) => <span key={i} className="tag" style={{ textTransform: 'capitalize' }}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Outfit Ideas */}
        {analysis.outfitIdeas && analysis.outfitIdeas.length > 0 && (
          <div style={{ background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '20px', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>💡 Outfit Ideas For You</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.outfitIdeas.map((idea, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'var(--dark-700)', borderRadius: '10px' }}>
                  <span style={{ color: 'var(--accent-400)', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>0{i + 1}</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {analysis.tips && analysis.tips.length > 0 && (
          <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '16px', padding: '20px', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>✨ Stylist Tips</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-400)', fontSize: '14px', flexShrink: 0 }}>→</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SelfieAdvisorPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: SelfieAnalysis; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const data = await fileToBase64(file);
    setPreview(url);
    setImageData(data);
    setResult(null);
    setError(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    if (!imageData) return;
    setLoading(true); setError(null);
    try {
      const res = await geminiService.analyzeSelfie(imageData.base64, imageData.mimeType);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPreview(null); setImageData(null); setResult(null); setError(null); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--dark-600)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--dark-800)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} /> Home
        </Link>
        <span style={{ color: 'var(--dark-500)' }}>·</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>AI Selfie Advisor</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '42px', marginBottom: '12px' }}>
            Your Personal{' '}
            <span className="gradient-brand-text">Color & Style</span> Reading
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            Upload a selfie and get a personalized color palette, best fits, style directions, and outfit ideas — all tailored to you.
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary-500)' : 'var(--dark-500)'}`,
              borderRadius: '24px',
              padding: '80px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(168,85,247,0.05)' : 'var(--dark-800)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: '20px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Upload size={28} style={{ color: 'var(--primary-400)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>Drop your selfie here</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>or click to browse · JPG, PNG, WEBP</p>
            <button className="btn-primary" style={{ pointerEvents: 'none' }}>
              <Camera size={16} /> Choose Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--dark-800)', border: '1px solid var(--dark-600)', borderRadius: '20px', padding: '20px' }}>
              <img src={preview} alt="Your selfie" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--dark-600)' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>Photo ready for analysis</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  AI will analyze skin tone, facial features, and suggest your personal style palette.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={analyze} disabled={loading} style={{ padding: '10px 24px' }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                        Analyzing...
                      </span>
                    ) : (
                      <><Sparkles size={16} /> Analyze My Style</>
                    )}
                  </button>
                  <button className="btn-secondary" onClick={reset} style={{ padding: '10px 20px' }}>
                    <X size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 18px', color: '#ef4444', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Results */}
            <AnimatePresence>
              {result && <AnalysisResult analysis={result.analysis} message={result.message} />}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Privacy Note */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '32px' }}>
          🔒 Your photo is processed securely and never stored. Analysis happens via Gemini AI.
        </p>
      </div>
    </div>
  );
}
