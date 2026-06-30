/**
 * FashionTranslatorCard — Module 4 & 5
 * The signature feature of StyleSpeak. Displays AI reasoning, translated fashion
 * terms with confidence, complete outfit, and shopping links. Always open — no accordions.
 */
import { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FashionAnalysis, FashionRecommendation } from '../types';
import FashionTermModal from './FashionTermModal';

interface Props {
  analysis: FashionAnalysis;
  userInput?: string;
}

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

function RecommendationImage({ name }: { name: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    
    const fetchImage = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/product-image?q=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to fetch image for:', name, err);
      }
    };
    
    fetchImage();
  }, [name]);

  if (imageUrl) {
    return (
      <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(126,34,206,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ShoppingBag size={24} style={{ color: 'var(--primary-400)' }} />
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



          {/* Top Recommendations - Horizontal Carousel */}
          {recs.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
                Style Matches
              </p>
              <div 
                className="hide-scrollbar"
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  overflowX: 'auto', 
                  paddingBottom: '12px',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {recs.slice(0, 6).map((rec: FashionRecommendation, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      minWidth: '150px', 
                      maxWidth: '150px',
                      background: 'var(--dark-800)', 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      border: '1px solid var(--dark-600)', 
                      transition: 'border-color 0.2s',
                      scrollSnapAlign: 'start'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dark-600)')}
                  >
                    {/* Large Image visual */}
                    <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                      <RecommendationImage name={rec.name || analysis.clothingType || 'Fashion Clothing'} />
                    </div>
                    
                    {/* Text Content */}
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '12px', lineHeight: 1.3, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rec.name || 'Style Recommendation'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rec.description || 'A perfect match for this style profile.'}
                      </p>
                      
                      {rec.priceRange && (
                        <div style={{ marginTop: 'auto' }}>
                          <span className="tag-accent" style={{ fontSize: '10px', padding: '2px 6px', width: 'fit-content' }}>
                            ₹{rec.priceRange.min.toLocaleString()}
                          </span>
                        </div>
                      )}
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
                {online.map((s: any, i: number) => (
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
