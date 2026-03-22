import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface ThoughtInputProps {
  onSubmit: (thought: string) => void;
  isLoading: boolean;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

const speechSupported = !!SpeechRecognitionAPI;

export function ThoughtInput({ onSubmit, isLoading }: ThoughtInputProps) {
  const [thought, setThought] = useState('');
  // Live partial transcript shown while the user is mid-sentence
  const [interim, setInterim] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  // Controls whether onend should restart recognition (Chrome stops it on silence)
  const keepListeningRef = useRef(false);

  // What the textarea actually displays
  const displayValue = interim ? (thought ? `${thought} ${interim}` : interim) : thought;

  function resizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }

  useEffect(() => {
    if (textareaRef.current) resizeTextarea(textareaRef.current);
  }, [displayValue]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setThought(e.target.value);
    setInterim('');
    resizeTextarea(e.currentTarget);
  }

  function handleSubmit() {
    const text = displayValue.trim();
    if (!text || isLoading) return;
    onSubmit(text);
  }

  const stopListening = useCallback(() => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    // Commit any pending interim text into thought
    setThought(prev => {
      if (!interim.trim()) return prev;
      return prev ? `${prev} ${interim.trim()}` : interim.trim();
    });
    setInterim('');
  }, [interim]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true; // ← show text AS you speak
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let newFinal = '';
      let newInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          newInterim += result[0].transcript;
        }
      }

      if (newFinal) {
        setThought(prev => (prev ? `${prev} ${newFinal.trim()}` : newFinal.trim()));
        setInterim('');
      } else if (newInterim) {
        setInterim(newInterim);
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is non-fatal; let onend handle the restart
      if (event.error !== 'no-speech') {
        keepListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      // Chrome auto-stops on silence even in continuous mode — restart if still wanted
      if (keepListeningRef.current) {
        try { recognition.start(); } catch (_) {}
      } else {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    recognition.start();
    setIsListening(true);
  }, []);

  function toggleMic() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Heading */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Describe Your Approach
        </h2>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Write your intuition, even if it's incomplete or wrong. We'll show you exactly what's right, what's off, and give you hints to guide you to the solution.
        </p>
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          placeholder="e.g. I think we can use a hash map to avoid the O(n²) brute force. For each number, we store it and look for its complement..."
          style={{
            width: '100%',
            minHeight: '160px',
            padding: 'var(--space-4)',
            paddingBottom: '28px',
            background: 'var(--color-bg-primary)',
            border: isListening ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-relaxed)',
            resize: 'none',
            outline: 'none',
            transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast)',
            caretColor: 'var(--color-accent)',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            if (!isListening) {
              e.currentTarget.style.borderColor = 'var(--color-border-focus)';
              e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
            }
          }}
          onBlur={e => {
            if (!isListening) {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        />

        {/* Bottom bar: mic (left) + char count (right) */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-2)',
            left: 'var(--space-3)',
            right: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {speechSupported ? (
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Stop recording' : 'Speak your approach'}
              style={{
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: 'var(--radius-sm)',
                color: isListening ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                transition: 'color var(--duration-fast)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{
                  flexShrink: 0,
                  animation: isListening ? 'mic-pulse 1.2s ease-in-out infinite' : 'none',
                }}
              >
                <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M2 7a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="7" y1="12" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {isListening ? 'Listening…' : 'Use mic'}
            </button>
          ) : (
            <span />
          )}

          <span
            style={{
              pointerEvents: 'none',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {displayValue.length} chars
          </span>
        </div>
      </div>

      <style>{`
        @keyframes mic-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          size="md"
          isLoading={isLoading}
          onClick={handleSubmit}
          disabled={!displayValue.trim()}
          leftIcon={
            !isLoading ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8zm4 0l2-2 2 2M8 6v5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : undefined
          }
        >
          {isLoading ? 'Analyzing…' : 'Analyze My Approach'}
        </Button>
      </div>
    </div>
  );
}
