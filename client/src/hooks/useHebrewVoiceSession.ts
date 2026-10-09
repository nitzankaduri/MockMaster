import { useState, useEffect, useRef, useCallback } from 'react';
import type { HebrewPersona } from '../types/hebrewInterview';

// Web Speech API types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface UseHebrewVoiceSessionProps {
  persona: HebrewPersona;
  onSpeechInput: (transcript: string) => void;
}

export function useHebrewVoiceSession({
  persona,
  onSpeechInput
}: UseHebrewVoiceSessionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentCaption, setCurrentCaption] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Audio chimes using Web Audio API
  const playAudioCue = useCallback((type: 'start' | 'stop' | 'chime') => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'stop') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }, []);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'he-IL';

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      // Barge-in: if candidate speaks while interviewer is speaking, cancel AI speech immediately
      if ((interim.trim() || finalTranscript.trim()) && isSpeakingRef.current) {
        if (synthRef.current) {
          synthRef.current.cancel();
          setIsSpeaking(false);
          setCurrentCaption('');
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (finalTranscript.trim()) {
        const cleanText = finalTranscript.trim();
        setInterimTranscript('');
        onSpeechInput(cleanText);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition warning:', event.error);
      }
    };

    recognition.onend = () => {
      // If user intended to keep listening, restart automatically
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Restart error ignored
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Cleanup error ignored
      }
    };
  }, [onSpeechInput]);

  // Start / Stop listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('זיהוי דיבור אינו נתמך בדפדפן זה. מומלץ להשתמש ב-Google Chrome.');
      return;
    }
    try {
      setIsListening(true);
      isListeningRef.current = true;
      recognitionRef.current.start();
      playAudioCue('start');
    } catch {
      // If already started, ignore
    }
  }, [playAudioCue]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    playAudioCue('stop');
  }, [playAudioCue]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Hebrew Text-To-Speech with voice selection
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current || isMutedRef.current) {
        setCurrentCaption(text);
        if (onEnd) setTimeout(onEnd, 1500);
        return;
      }

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';

      // Pick Hebrew voice if available
      const voices = synthRef.current.getVoices();
      const hebrewVoice = voices.find(
        v =>
          v.lang.toLowerCase().startsWith('he') ||
          v.name.includes('Hebrew') ||
          v.name.includes('עברית') ||
          v.name.includes('Asaf') ||
          v.name.includes('Hila')
      );
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }

      // Persona voice dynamics
      if (persona === 'challenging') {
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
      } else {
        utterance.rate = 0.98;
        utterance.pitch = 1.05;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentCaption(text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      synthRef.current.speak(utterance);
    },
    [persona]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next && synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentCaption('');
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    isMuted,
    interimTranscript,
    currentCaption,
    toggleListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleMute,
    playAudioCue
  };
}

