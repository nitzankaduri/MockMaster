import { useState, useEffect, useRef, useCallback } from 'react';
import { speakWithElevenLabs, stopSpeaking } from '../services/elevenlabs';

// Web Speech Recognition Types
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

interface UseVoiceAgentProps {
  onSpeechInput?: (transcript: string) => void;
  autoStart?: boolean;
}

export function useVoiceAgent({
  onSpeechInput,
  autoStart = false
}: UseVoiceAgentProps = {}) {
  const [isListening, setIsListening] = useState(autoStart);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const hasSpeech = Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    return hasSpeech ? null : 'זיהוי דיבור אינו נתמך בדפדפן זה. מומלץ להשתמש ב-Google Chrome.';
  });
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isListeningRef = useRef(autoStart);
  const isSpeakingRef = useRef(false);
  const onSpeechInputRef = useRef(onSpeechInput);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    onSpeechInputRef.current = onSpeechInput;
  }, [onSpeechInput]);

  // ElevenLabs Speak Wrapper
  const speak = useCallback(
    async (text: string, onEnd?: () => void) => {
      if (isMuted) {
        onEnd?.();
        return;
      }

      await speakWithElevenLabs(
        text,
        () => {
          setIsSpeaking(true);
        },
        () => {
          setIsSpeaking(false);
          onEnd?.();
        }
      );
    },
    [isMuted]
  );

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Initialize Web Speech Recognition configured explicitly for Hebrew (he-IL)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'he-IL';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        // FULL-DUPLEX BARGE-IN: If candidate starts speaking, stop ElevenLabs speech immediately
        if ((interim.trim() || final.trim()) && isSpeakingRef.current) {
          stopSpeaking();
          setIsSpeaking(false);
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final.trim()) {
          const cleanedText = final.trim();
          setTranscript(cleanedText);
          setInterimTranscript('');

          if (onSpeechInputRef.current) {
            onSpeechInputRef.current(cleanedText);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('גישה למיקרופון נדחתה. יש לאשר הרשאות מיקרופון בדפדפן.');
          isListeningRef.current = false;
          setIsListening(false);
          return;
        }
        console.warn('Speech recognition notice:', event.error);
      };

      recognition.onend = () => {
        // Automatically restart if user hasn't toggled off and permissions are intact
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // Ignored if already active
          }
        }
      };

      recognitionRef.current = recognition;

      if (autoStart) {
        try {
          recognition.start();
        } catch {
          // Ignored
        }
      }
    } catch (e) {
      console.error('Failed to construct SpeechRecognition:', e);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignored
        }
      }
      stopSpeaking();
    };
  }, [autoStart]);

  const startListening = useCallback(() => {
    setIsListening(true);
    isListeningRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Ignored
      }
    }
  }, []);

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
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    isListening,
    isSpeaking,
    isMuted,
    transcript,
    interimTranscript,
    error,
    speak,
    stopSpeaking: handleStopSpeaking,
    startListening,
    stopListening,
    toggleListening,
    toggleMute
  };
}
