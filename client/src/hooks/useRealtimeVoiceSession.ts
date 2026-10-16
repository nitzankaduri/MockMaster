import { useState, useEffect, useRef, useCallback } from 'react';
import type { PersonaType } from '../types';
import { hebrewAudio } from '../services/hebrewAudioService';

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): {
      length: number;
      item(index: number): { transcript: string };
      isFinal?: boolean;
      0: { transcript: string };
    };
    [index: number]: {
      isFinal?: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export type AudioCueType = 'start' | 'submit' | 'success' | 'alert' | 'barge_in';

interface UseRealtimeVoiceSessionProps {
  onSpeechInput?: (transcript: string) => void;
  persona?: PersonaType;
}

export function useRealtimeVoiceSession({
  onSpeechInput,
  persona: _persona = 'mentor'
}: UseRealtimeVoiceSessionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isManuallyStoppedRef = useRef(false);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const onSpeechInputRef = useRef(onSpeechInput);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    onSpeechInputRef.current = onSpeechInput;
  }, [onSpeechInput]);

  // Initialize Web Audio API for synthesized cyber feedback cues
  const playAudioCue = useCallback((type: AudioCueType) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'submit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'barge_in') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch {
      // Audio cue error ignored
    }
  }, []);

  // Preload synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize Speech Recognition with continuous listening & barge-in support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'he-IL';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        // BARGE-IN INTERRUPTION SUPPORT:
        // If candidate speaks while interviewer is speaking, immediately cut off speech synthesis!
        if ((currentInterim.trim() || finalChunk.trim()) && isSpeakingRef.current) {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setIsSpeaking(false);
          setCurrentCaption('');
          playAudioCue('barge_in');
        }

        setInterimTranscript(currentInterim);

        if (finalChunk.trim()) {
          const cleanedText = finalChunk.trim();
          setTranscript(cleanedText);
          setInterimTranscript('');
          if (onSpeechInputRef.current) {
            onSpeechInputRef.current(cleanedText);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone access denied. Please enable mic permissions.');
          isListeningRef.current = false;
          setIsListening(false);
          return;
        }
        console.warn('Speech recognition notice:', event.error);
      };

      recognition.onend = () => {
        if (!isManuallyStoppedRef.current && isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to construct SpeechRecognition:', e);
    }

    return () => {
      if (recognitionRef.current) {
        isManuallyStoppedRef.current = true;
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [playAudioCue]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Voice recognition is unavailable.');
      return;
    }

    if (isListening) {
      isManuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      isManuallyStoppedRef.current = false;
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setError('Could not access microphone.');
          setIsListening(false);
        }
      }
    }
  }, [isListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    hebrewAudio.stopSpeaking();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentCaption('');
  }, []);

  // Full-duplex speech synthesis with warm human female voice and live caption streaming
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      if (isMuted) return;

      const plainText = text
        .replace(/`{1,3}[^`]*`{1,3}/g, 'קטע קוד')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[*_~#>[\]()]/g, '')
        .replace(/[\u200E\u200F\u200B\u200C\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!plainText) return;

      // Abort previous playback
      hebrewAudio.stopSpeaking();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Speak using warm, natural female Hebrew voice
      hebrewAudio.speak(plainText, {
        onStart: () => {
          setIsSpeaking(true);
          setCurrentCaption(plainText);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setTimeout(() => {
            if (!isSpeakingRef.current) {
              setCurrentCaption('');
            }
          }, 3000);
        },
        onSubtitle: (subText) => {
          setCurrentCaption(subText);
        }
      });
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        hebrewAudio.stopSpeaking();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setCurrentCaption('');
      }
      return next;
    });
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    isMuted,
    transcript,
    interimTranscript,
    currentCaption,
    error,
    toggleListening,
    speak,
    stopSpeaking,
    toggleMute,
    playAudioCue
  };
}
