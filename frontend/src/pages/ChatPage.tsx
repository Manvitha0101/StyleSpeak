/**
 * ChatPage — Modules 3, 4, 6, 8
 * ChatGPT-quality experience with slim sidebar, FashionTranslatorCard (always open),
 * suggestion chips, voice input, typing indicator with brand copy, improved empty state.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, ImagePlus, Plus, Trash2, X, ArrowLeft, Sparkles, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types';
import FashionTranslatorCard from '../components/FashionTranslatorCard';
import VoiceInput from '../components/VoiceInput';

/* ─── Logo ─── */
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <defs>
        <linearGradient id="clg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="26" height="18" rx="6" fill="url(#clg)" />
      <path d="M8 22 L6 28 L14 22 Z" fill="url(#clg)" />
      <path d="M16 8 C16 8 16 6 18 6 C20 6 20 8 18 9 L11 13 L21 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── File utility ─── */
function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Suggestion chips ─── */
const REFINE_CHIPS = [
  { label: '🟣 More Formal', prompt: 'Make it more formal' },
  { label: '🟣 Different Color', prompt: 'Show me different colors' },
  { label: '🟣 Lower Budget', prompt: 'Can we find a lower budget option?' },
  { label: '🟣 Summer Friendly', prompt: 'Make it summer friendly' },
  { label: '🟣 Luxury Brands', prompt: 'Suggest luxury brands' },
];

const QUICK_STARTERS = [
  "I want the oversized shirt Korean actors wear",
  "Something for a job interview that's not boring",
  "Gen Z streetwear under ₹2000",
  "What is a Cuban collar?",
  "Outfit for a rooftop date night",
];

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#f97316,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✨</div>
      <div style={{ background: 'var(--dark-700)', border: '1px solid var(--dark-600)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-500)' }} />
          ))}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>StyleSpeak is translating your fashion...</span>
      </div>
    </motion.div>
  );
}

/* ─── Message bubble ─── */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  if (message.isLoading) return <TypingIndicator />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isUser ? 'linear-gradient(135deg,#a855f7,#7e22ce)' : 'none' }}>
        {isUser ? <span style={{ fontSize: '13px' }}>👤</span> : <LogoMark size={32} />}
      </div>

      <div style={{ maxWidth: '76%' }}>
        {/* Image preview */}
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded" style={{ borderRadius: '12px', maxWidth: '220px', maxHeight: '220px', objectFit: 'cover', display: 'block', marginBottom: '8px' }} />
        )}

        {/* Text bubble */}
        {message.content && (
          <div style={{
            background: isUser ? 'linear-gradient(135deg,#a855f7,#7e22ce)' : 'var(--dark-700)',
            border: isUser ? 'none' : '1px solid var(--dark-600)',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: '12px 16px',
            fontSize: '14px',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
          }}>
            {message.content}
          </div>
        )}

        {/* Translator Card — always shown, no accordion */}
        {!isUser && message.metadata && (
          <FashionTranslatorCard
            analysis={message.metadata}
            userInput={undefined}
          />
        )}

        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px', textAlign: isUser ? 'right' : 'left' }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Slim collapsible sidebar ─── */
function Sidebar({ collapsed, onToggle, isMobile }: { collapsed: boolean; onToggle: () => void; isMobile: boolean }) {
  const { conversations, activeConversationId, setActiveConversation, createConversation, deleteConversation } = useChatStore();

  return (
    <motion.div
      animate={{ width: collapsed ? (isMobile ? 0 : 56) : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{ 
        background: 'var(--dark-800)', 
        borderRight: '1px solid var(--dark-600)', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden', 
        flexShrink: 0,
        position: isMobile ? 'absolute' : 'relative',
        zIndex: isMobile ? 50 : 1,
        left: 0,
        top: 0
      }}
    >
      {/* Top */}
      <div style={{ padding: '14px', borderBottom: '1px solid var(--dark-600)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '8px' }}>
        {!collapsed && (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <LogoMark size={24} />
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Style<span className="gradient-brand-text">Speak</span>
            </span>
          </Link>
        )}
        {collapsed && <Link to="/"><ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} /></Link>}
        <button onClick={onToggle} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* New chat */}
      <div style={{ padding: '10px' }}>
        <button
          onClick={createConversation}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: collapsed ? '10px' : '9px 14px', fontSize: '12px', gap: collapsed ? 0 : 6 }}
          title="New Style Session"
        >
          <Plus size={14} />
          {!collapsed && 'New Session'}
        </button>
      </div>

      {/* Conversation list */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }} className="no-scrollbar">
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions</p>
          {conversations.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px 8px' }}>Start your first translation</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} onClick={() => setActiveConversation(conv.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: '9px', cursor: 'pointer', background: activeConversationId === conv.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: activeConversationId === conv.id ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent', marginBottom: '2px' }}
            >
              <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: activeConversationId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {conv.title}
              </span>
              <button onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Chat Page ─── */
export default function ChatPage() {
  const { getActiveConversation, sendTextMessage, sendImageMessage, isLoading, createConversation, activeConversationId } = useChatStore();
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<{ base64: string; mimeType: string; url: string } | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [dragOver, setDragOver] = useState(false);
  const [searchParams] = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isMobile) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const conversation = getActiveConversation();
  const messages = conversation?.messages ?? [];

  useEffect(() => { if (!activeConversationId) createConversation(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  // Auto-focus mic if coming from voice mode
  useEffect(() => {
    if (searchParams.get('mode') === 'image') fileInputRef.current?.click();
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !previewImage) return;
    setInput('');
    if (previewImage) {
      await sendImageMessage(text || 'Please analyze this fashion item.', previewImage.base64, previewImage.mimeType);
      setPreviewImage(null);
    } else {
      await sendTextMessage(text);
    }
  }, [input, previewImage, sendTextMessage, sendImageMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const data = await fileToBase64(file);
    setPreviewImage({ ...data, url: URL.createObjectURL(file) });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };

  const handleChip = (prompt: string) => setInput(prompt);
  const handleStarter = (s: string) => { setInput(s); };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--dark-900)', overflow: 'hidden', position: 'relative' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} isMobile={isMobile} />

      {/* Mobile overlay backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div 
          onClick={() => setSidebarCollapsed(true)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} 
        />
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--dark-600)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--dark-800)', flexShrink: 0 }}>
          {isMobile && (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', marginRight: '4px' }}
            >
              <Menu size={20} />
            </button>
          )}
          <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#a855f7,#7e22ce)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={15} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>{conversation?.title ?? 'Style Session'}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Fashion Translator</p>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', position: 'relative' }}
          className="no-scrollbar"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {/* Drop overlay */}
          {dragOver && (
            <div style={{ position: 'absolute', inset: 16, zIndex: 20, background: 'rgba(168,85,247,0.08)', border: '2px dashed var(--primary-500)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: 'var(--primary-400)' }}>
              Drop your fashion image here
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '48px', maxWidth: '560px', margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', marginTop: '16px', marginBottom: '8px' }}>
                What would you like to translate?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>
                Say it in your words. StyleSpeak speaks fashion.
              </p>

              {/* Starter chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {QUICK_STARTERS.map((s, i) => (
                  <button key={i} className="chip" onClick={() => handleStarter(s)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(m => <MessageBubble key={m.id} message={m} />)}

          {/* Suggestion chips after last AI message */}
          {messages.length > 0 && !isLoading && messages[messages.length - 1].role === 'assistant' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '16px', paddingLeft: 42 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Would you like to refine this outfit?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {REFINE_CHIPS.map(({ label, prompt }) => (
                  <button key={label} className="chip" onClick={() => handleChip(prompt)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--dark-600)', background: 'var(--dark-800)', flexShrink: 0 }}>
          {/* Image preview */}
          <AnimatePresence>
            {previewImage && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <img src={previewImage.url} alt="preview" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--dark-600)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Fashion image ready</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Add context or send to translate</p>
                </div>
                <button onClick={() => setPreviewImage(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', background: 'var(--dark-700)', border: '1px solid var(--dark-600)', borderRadius: '16px', padding: '10px 12px', transition: 'border-color 0.2s' }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--dark-600)'}
          >
            {/* Image upload */}
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', flexShrink: 0, transition: 'color 0.2s' }}
              title="Upload clothing photo"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ImagePlus size={18} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

            {/* Text input */}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say it your way — StyleSpeak translates it..."
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', resize: 'none', maxHeight: '100px' }}
            />

            {/* Voice input */}
            <VoiceInput onTranscript={t => setInput(prev => prev ? `${prev} ${t}` : t)} disabled={isLoading} />

            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !previewImage)}
              style={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, background: (isLoading || (!input.trim() && !previewImage)) ? 'var(--dark-600)' : 'linear-gradient(135deg,#a855f7,#7e22ce)', border: 'none', cursor: (isLoading || (!input.trim() && !previewImage)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            >
              <Send size={14} color="white" />
            </motion.button>
          </div>

          <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
            Enter to send · Shift+Enter for new line · Drag image to upload
          </p>
        </div>
      </div>
    </div>
  );
}
