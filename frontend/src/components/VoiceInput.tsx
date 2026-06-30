/**
 * VoiceInput — Module 8
 * Browser Web Speech API voice recognition with listening/idle animations.
 * Gracefully degrades when unsupported.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Type shim for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({ onTranscript, disabled }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) { setSupported(false); return; }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => { setListening(false); setInterim(''); };
    recognition.onerror = () => { setListening(false); setInterim(''); };

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterim(interim);
      if (final) { onTranscript(final.trim()); setListening(false); }
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) { rec.stop(); }
    else { try { rec.start(); } catch { /* already started */ } }
  }, [listening]);

  if (!supported) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className={`voice-btn ${listening ? 'listening' : ''}`}
        onClick={toggle}
        disabled={disabled}
        title={listening ? 'Stop listening' : 'Speak to StyleSpeak'}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {listening ? <MicOff size={15} /> : <Mic size={15} />}
      </button>

      {/* Interim transcript tooltip */}
      <AnimatePresence>
        {interim && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: '44px',
              right: 0,
              background: 'var(--dark-700)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              maxWidth: '240px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              zIndex: 10,
            }}
          >
            🎙️ {interim}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
