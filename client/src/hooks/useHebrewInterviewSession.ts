import { useState, useEffect, useRef, useCallback } from 'react';
import {
  playInterviewerSpeech,
  stopSpeaking,
  getGeminiApiKey,
  saveGeminiApiKey
} from '../services/geminiVoiceService';
import {
  evaluateInterviewWithGemini,
  type Turn,
  type GeminiCritiqueReport
} from '../services/geminiEvaluationService';
import {
  getRoleIntroPrompt,
  generateDynamicRoleTurnWithGemini,
  type SessionStage
} from '../services/hebrewRoleInterviewService';

export type { SessionStage };

interface UseHebrewInterviewSessionProps {
  onEvaluationComplete?: (report: GeminiCritiqueReport) => void;
  initialRole?: string;
}

export function useHebrewInterviewSession({
  onEvaluationComplete,
  initialRole = 'Full Stack Developer'
}: UseHebrewInterviewSessionProps = {}) {
  // Target job role state
  const [targetRole, setTargetRole] = useState<string>(initialRole);

  // Session lifecycle states
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<SessionStage>('intro');
  const [callDuration, setCallDuration] = useState<number>(0);

  // Transcript turns history
  const [turns, setTurns] = useState<Turn[]>(() => {
    const initialIntro = getRoleIntroPrompt(initialRole);
    return [
      {
        speaker: 'interviewer',
        text: initialIntro,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [currentSubtitle, setCurrentSubtitle] = useState<string>(() => getRoleIntroPrompt(initialRole));
  const [lastQuestion, setLastQuestion] = useState<string>(() => getRoleIntroPrompt(initialRole));

  // Audio / STT states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return SpeechRec ? null : 'זיהוי דיבור אינו נתמך בדפדפן זה. מומלץ להשתמש ב-Google Chrome.';
  });

  // Evaluation & Analysis
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<GeminiCritiqueReport | null>(null);

  // API Key modal prompt state (hidden by default)
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>(() => getGeminiApiKey());

  // References for stable event handlers
  const recognitionRef = useRef<any>(null);
  const targetRoleRef = useRef<string>(targetRole);
  const stageRef = useRef<SessionStage>(currentStage);
  const turnsRef = useRef<Turn[]>(turns);
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const isListeningRef = useRef<boolean>(isListening);
  const handleResponseRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    targetRoleRef.current = targetRole;
  }, [targetRole]);

  useEffect(() => {
    stageRef.current = currentStage;
  }, [currentStage]);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Duration timer
  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Append a turn
  const addTurn = useCallback((speaker: 'interviewer' | 'candidate', text: string) => {
    const newTurn: Turn = {
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTurns((prev) => [...prev, newTurn]);
    return newTurn;
  }, []);

  // Speak with native Gemini 2.0 Flash Audio
  const speakText = useCallback(async (textToSpeak: string) => {
    try {
      await playInterviewerSpeech(
        textToSpeak,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.warn('Native Gemini audio playback notice:', err);
      setIsSpeaking(false);
    }
  }, []);

  // Candidate Response Handler & State Machine Transition
  const handleCandidateResponse = useCallback(
    async (answerText: string) => {
      const clean = answerText.trim();
      if (!clean) return;

      // 1. Record candidate turn
      addTurn('candidate', clean);

      // 2. Advance stage machine ('intro' -> 'behavioral' -> 'challenge' -> 'wrapup' -> 'completed')
      let nextStage: SessionStage = 'behavioral';
      switch (stageRef.current) {
        case 'intro':
          nextStage = 'behavioral';
          break;
        case 'behavioral':
          nextStage = 'challenge';
          break;
        case 'challenge':
          nextStage = 'wrapup';
          break;
        case 'wrapup':
        default:
          nextStage = 'completed';
          break;
      }

      setCurrentStage(nextStage);

      // 3. Dynamically generate role-tailored question
      const dynamicQuestion = await generateDynamicRoleTurnWithGemini({
        targetRole: targetRoleRef.current,
        nextStage,
        candidateAnswer: clean,
        history: turnsRef.current
      });

      setLastQuestion(dynamicQuestion);
      setCurrentSubtitle(dynamicQuestion);

      // 4. Record interviewer turn
      addTurn('interviewer', dynamicQuestion);

      // 5. Play speech using native Gemini Audio
      setTimeout(() => {
        speakText(dynamicQuestion);
      }, 300);
    },
    [addTurn, speakText]
  );

  useEffect(() => {
    handleResponseRef.current = handleCandidateResponse;
  }, [handleCandidateResponse]);

  // Web Speech API (he-IL, continuous: true, interimResults: false)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'he-IL';

    recognition.onresult = (event: any) => {
      // INSTANT BARGE-IN: Stop interviewer speaking immediately on first speech packet
      if (isSpeakingRef.current) {
        stopSpeaking();
        setIsSpeaking(false);
      }

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalCandidateText = event.results[i][0].transcript.trim();
          if (finalCandidateText) {
            handleResponseRef.current(finalCandidateText);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed') {
        setSpeechError('גישה למיקרופון נדחתה. אנא אשר הרשאות מיקרופון בדפדפן.');
        setIsListening(false);
        return;
      }
      console.warn('Speech recognition notice:', event.error);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignored
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      stopSpeaking();
      try {
        recognition.abort();
      } catch {
        // Ignored
      }
    };
  }, []);

  // Start interview session
  const startSession = useCallback(
    (chosenRole?: string) => {
      const activeRole = (chosenRole || targetRoleRef.current).trim() || 'Software Engineer';
      if (chosenRole) {
        setTargetRole(activeRole);
        targetRoleRef.current = activeRole;
      }

      const introText = getRoleIntroPrompt(activeRole);

      setTurns([
        {
          speaker: 'interviewer',
          text: introText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setCurrentStage('intro');
      setLastQuestion(introText);
      setCurrentSubtitle(introText);
      setReport(null);
      setCallDuration(0);

      setIsSessionActive(true);
      setIsListening(true);
      isListeningRef.current = true;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Ignored
        }
      }

      speakText(introText);
    },
    [speakText]
  );

  // Repeat current question
  const repeatQuestion = useCallback(() => {
    const textToSpeak = lastQuestion || getRoleIntroPrompt(targetRoleRef.current);
    setCurrentSubtitle(textToSpeak);
    speakText(textToSpeak);
  }, [lastQuestion, speakText]);

  // Toggle mic
  const toggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignored
        }
      }
    } else {
      setIsListening(true);
      isListeningRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Ignored
        }
      }
    }
  }, [isListening]);

  // Finish interview and trigger Gemini evaluation
  const finishInterview = useCallback(
    async (customApiKey?: string): Promise<GeminiCritiqueReport> => {
      stopSpeaking();
      setIsSpeaking(false);
      setIsAnalyzing(true);

      try {
        const critique = await evaluateInterviewWithGemini(
          turnsRef.current,
          customApiKey,
          targetRoleRef.current
        );
        setReport(critique);
        onEvaluationComplete?.(critique);
        return critique;
      } catch (err) {
        console.error('Interview evaluation error:', err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onEvaluationComplete]
  );

  // Restart interview
  const restartSession = useCallback(
    (chosenRole?: string) => {
      stopSpeaking();
      setIsSpeaking(false);
      const activeRole = (chosenRole || targetRoleRef.current).trim() || 'Software Engineer';
      if (chosenRole) {
        setTargetRole(activeRole);
        targetRoleRef.current = activeRole;
      }

      const introText = getRoleIntroPrompt(activeRole);
      setTurns([
        {
          speaker: 'interviewer',
          text: introText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setCurrentStage('intro');
      setCallDuration(0);
      setLastQuestion(introText);
      setCurrentSubtitle(introText);
      setReport(null);
      setIsSessionActive(true);
      setIsListening(true);
      isListeningRef.current = true;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Ignored
        }
      }

      speakText(introText);
    },
    [speakText]
  );

  // Handle saving API key from UI
  const handleSaveApiKey = useCallback((key: string) => {
    saveGeminiApiKey(key);
    setCustomKeyInput(key);
    setShowKeyModal(false);
  }, []);

  return {
    // Role selection state
    targetRole,
    setTargetRole,

    // Session state
    isSessionActive,
    currentStage,
    callDuration,
    turns,
    addTurn,
    currentSubtitle,
    lastQuestion,

    // Voice & speech
    isListening,
    isSpeaking,
    speechError,
    stopSpeaking,
    toggleListening,
    repeatQuestion,

    // Lifecycle actions
    startSession,
    handleCandidateResponse,
    finishInterview,
    restartSession,

    // Gemini evaluation
    isAnalyzing,
    report,
    setReport,

    // Key management
    showKeyModal,
    setShowKeyModal,
    customKeyInput,
    setCustomKeyInput,
    handleSaveApiKey
  };
}
