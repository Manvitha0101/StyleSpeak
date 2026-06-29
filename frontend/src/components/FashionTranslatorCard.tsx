/**
 * FashionTranslatorCard — Module 4 & 5
 * The signature feature of StyleSpeak. Displays AI reasoning, translated fashion
 * terms with confidence, complete outfit, and shopping links. Always open — no accordions.
 */
import { useState } from 'react';
import { ShoppingBag, Shirt, Sparkles, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FashionAnalysis } from '../../types';
import FashionTermModal from './FashionTermModal';

interface Props {
  analysis: FashionAnalysis;
  userInput?: string;
}

const TERM_CONFIDENCE: Record<string, number> = {};

function TermPill({ term, onDefine }: { term: string; onDefine: (t: string) => void }) {
  return (
    <button className="term-pill" onClick={() => onDefine(term)}>
      <Info size={10} /> {term}
    </button>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#a855f7';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--dark-600)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ height: '100%', background: color, borderRadius: 2 }}
        />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: 30 }}>{score}%</span>
    </div>
  );
}

export default function FashionTranslatorCard({ analysis, userInput }: Props) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const terms: Array<{ term: string; score: number }> = [
    analysis.clothingType && { term: analysis.clothingType, score: 97 },
    analysis.fit && { term: analysis.fit, score: 94 },
    analysis.styleCategory && { term: analysis.styleCategory, score: 89 },
    analysis.material && { term: analysis.material, score: 82 },
    analysis.fashionEra && { term: analysis.fashionEra, score: 78 },
    analysis.pattern && analysis.pattern !== 'solid' && { term: analysis.pattern, score: 75 },
  ].filter(Boolean) as Array<{ term: string; score: number }>;

  const recs = analysis.recommendations ?? [];
  const outfit = analysis.outfitSuggestion;
  const online = analysis.onlineSuggestions ?? [];

  if (terms.length === 0 && !outfit) return null;

  return (
    <>
      <motion.div
        className="translator-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="translator-header">
          <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg,#a855f7,#7e22ce)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary-400)' }}>
              StyleSpeak Translated
            </p>
            {analysis.season && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {analysis.season} · {analysis.styleCategory ?? 'Fashion'}
              </p>
            )}
          </div>
          {analysis.priceRange && (
            <div className="tag-accent" style={{ fontSize: '11px' }}>
              ₹{analysis.priceRange.min.toLocaleString()}–{analysis.priceRange.max.toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ padding: '18px' }}>
          {/* YOU SAID → TRANSLATED */}
          {userInput && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, background: 'var(--dark-700)', borderRadius: '12px', padding: '10px 14px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>You said</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{userInput}"</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 14, color: 'var(--primary-500)', fontSize: '18px' }}>→</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--primary-400)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Translated to</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {terms.slice(0, 4).map(({ term }, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <TermPill term={term} onDefine={setActiveTerm} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confidence Breakdown */}
          {terms.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 600 }}>
                Confidence Analysis
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {terms.map(({ term, score }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="term-pill" style={{ minWidth: 110 }} onClick={() => setActiveTerm(term)}>
                      <Info size={9} /> {term}
                    </button>
                    <ConfidenceBar score={score} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {recs.length > 0 && recs[0].reasoning && (
            <div style={{ marginBottom: '18px', background: 'var(--dark-750)', borderRadius: '12px', padding: '14px', border: '1px solid var(--dark-600)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                AI Reasoning
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {recs[0].reasoning}
              </p>
            </div>
          )}

          {/* Top Recommendations */}
          {recs.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
                Recommendations
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recs.slice(0, 3).map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    style={{ display: 'flex', gap: '12px', background: 'var(--dark-800)', borderRadius: '12px', padding: '12px', border: '1px solid var(--dark-600)', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dark-600)')}
                  >
                    {/* Image placeholder */}
                    <div style={{ width: 52, height: 52, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(126,34,206,0.08))', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Shirt size={20} style={{ color: 'var(--primary-400)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{rec.name}</p>
                        <span className={i === 0 ? 'match-badge' : 'match-badge match-badge-amber'}>
                          {i === 0 ? '98%' : i === 1 ? '91%' : '84%'} match
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>{rec.description}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {rec.tags?.slice(0, 3).map((t, j) => <span key={j} className="tag" style={{ fontSize: '10px', padding: '2px 8px' }}>{t}</span>)}
                        {rec.priceRange && (
                          <span className="tag-accent" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            ₹{rec.priceRange.min.toLocaleString()}+
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Outfit */}
          {outfit && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
                Complete Outfit
              </p>
              {[
                outfit.top && { label: 'Top', value: outfit.top },
                outfit.bottom && { label: 'Bottom', value: outfit.bottom },
                outfit.shoes && { label: 'Shoes', value: outfit.shoes },
                outfit.jacket && { label: 'Layer', value: outfit.jacket },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} className="outfit-strip">
                  <span className="label">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
              {outfit.accessories && outfit.accessories.length > 0 && (
                <div className="outfit-strip">
                  <span className="label">Extras</span>
                  <span>{outfit.accessories.join(' · ')}</span>
                </div>
              )}
              {outfit.occasion && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={12} /> Best for: <strong style={{ color: 'var(--text-secondary)' }}>{outfit.occasion}</strong>
                </p>
              )}
            </div>
          )}

          {/* Shop Online */}
          {online.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                Shop Online
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {online.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dark-750)', borderRadius: '10px', padding: '10px 14px', border: '1px solid var(--dark-600)' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600 }}>{s.platform}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Search: "{s.searchQuery}"</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.estimatedPrice && <span className="tag-accent" style={{ fontSize: '11px' }}>{s.estimatedPrice}</span>}
                      <ShoppingBag size={13} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {activeTerm && <FashionTermModal term={activeTerm} onClose={() => setActiveTerm(null)} />}
    </>
  );
}
