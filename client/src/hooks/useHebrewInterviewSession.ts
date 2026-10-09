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

export type SessionStage = 'intro' | 'behavioral' | 'challenge' | 'wrapup' | 'completed';

export const STAGE_PROMPTS: Record<SessionStage, string> = {
  intro:
    'שלום וברוך הבא לראיון העבודה שלך במוק מאסטר! שמי רותם, מנהלת גיוס ומשאבי אנוש. אשמח שתספר לי קצת על עצמך, על המסלול המקצועי שלך ומה מביא אותך לחפש את האתגר הבא?',
  behavioral:
    'תודה על השיתוף! בוא נעבור להתמודדות בתוך צוות: תאר לי סיטואציה שבה היית בחוסר הסכמה מקצועי עם חבר צוות או מנהל ישיר. מה היה שורש המחלוקת, איך ניגשת לפתור את זה, ומה הייתה התוצאה הסופית?',
  challenge:
    'עכשיו אשמח לשמוע על התמודדות עם מורכבות, לחץ ואי-ודאות: ספר על פרויקט או משימה שלא התפתחו כמתוכנן, או אפילו נכשלו. מה קרה, מה היה החלק האישי שלך בזה, ומה למדת מזה להמשך דרכך?',
  wrapup:
    'תודה רבה על השיתוף המעמיק! הגענו לשלב השאלות שלך: האם יש לך שאלות אליי לגבי התפקיד, התרבות הארגונית בצוות או החברה?',
  completed:
    'תודה רבה על ראיון מעשיר, מעמיק ופתוח! נהניתי מאוד להכיר אותך. נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב המפורט של Gemini AI.'
};

interface UseHebrewInterviewSessionProps {
  onEvaluationComplete?: (report: GeminiCritiqueReport) => void;
}

export function useHebrewInterviewSession({
  onEvaluationComplete
}: UseHebrewInterviewSessionProps = {}) {
  // Session lifecycle states
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<SessionStage>('intro');
  const [callDuration, setCallDuration] = useState<number>(0);

  // Transcript turns history
  const [turns, setTurns] = useState<Turn[]>(() => [
    {
      speaker: 'interviewer',
      text: STAGE_PROMPTS.intro,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [currentSubtitle, setCurrentSubtitle] = useState<string>(STAGE_PROMPTS.intro);
  const [lastQuestion, setLastQuestion] = useState<string>(STAGE_PROMPTS.intro);

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
  const stageRef = useRef<SessionStage>(currentStage);
  const turnsRef = useRef<Turn[]>(turns);
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const isListeningRef = useRef<boolean>(isListening);
  const handleResponseRef = useRef<(text: string) => void>(() => {});

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
    (answerText: string) => {
      const clean = answerText.trim();
      if (!clean) return;

      // 1. Record candidate turn
      addTurn('candidate', clean);

      // 2. Advance stage machine ('intro' -> 'behavioral' -> 'challenge' -> 'wrapup' -> 'completed')
      let nextStage: SessionStage = 'behavioral';
      let nextPrompt = STAGE_PROMPTS.behavioral;

      switch (stageRef.current) {
        case 'intro':
          nextStage = 'behavioral';
          nextPrompt = `תודה רבה על השיתוף! ${STAGE_PROMPTS.behavioral}`;
          break;
        case 'behavioral':
          nextStage = 'challenge';
          nextPrompt = `דוגמה מעניינת וחשובה. ${STAGE_PROMPTS.challenge}`;
          break;
        case 'challenge':
          nextStage = 'wrapup';
          nextPrompt = `תודה על הכנות והתובנות המקצועיות. ${STAGE_PROMPTS.wrapup}`;
          break;
        case 'wrapup':
        default:
          nextStage = 'completed';
          nextPrompt = STAGE_PROMPTS.completed;
          break;
      }

      setCurrentStage(nextStage);
      setLastQuestion(nextPrompt);
      setCurrentSubtitle(nextPrompt);

      // 3. Record interviewer turn
      addTurn('interviewer', nextPrompt);

      // 4. Play speech using native Gemini Audio
      setTimeout(() => {
        speakText(nextPrompt);
      }, 350);
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
  const startSession = useCallback(() => {
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

    speakText(STAGE_PROMPTS.intro);
  }, [speakText]);

  // Repeat current question
  const repeatQuestion = useCallback(() => {
    const textToSpeak = lastQuestion || STAGE_PROMPTS.intro;
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
        const critique = await evaluateInterviewWithGemini(turnsRef.current, customApiKey);
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
  const restartSession = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setTurns([
      {
        speaker: 'interviewer',
        text: STAGE_PROMPTS.intro,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentStage('intro');
    setCallDuration(0);
    setLastQuestion(STAGE_PROMPTS.intro);
    setCurrentSubtitle(STAGE_PROMPTS.intro);
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

    speakText(STAGE_PROMPTS.intro);
  }, [speakText]);

  // Handle saving API key from UI
  const handleSaveApiKey = useCallback((key: string) => {
    saveGeminiApiKey(key);
    setCustomKeyInput(key);
    setShowKeyModal(false);
  }, []);

  return {
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
