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
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
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
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isSessionActiveRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const accumulatedFinalRef = useRef<string>('');
  const candidateSpeechRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
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

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

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

  // Dedicated helper to start/resume speech recognition cleanly for the candidate
  const startListening = useCallback(() => {
    if (!isSessionActiveRef.current) return;
    accumulatedFinalRef.current = '';
    candidateSpeechRef.current = '';
    setInterimTranscript('');
    setIsListening(true);
    isListeningRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition might be in transitional state; retry shortly
        setTimeout(() => {
          if (isListeningRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            try {
              recognitionRef.current?.start();
            } catch {}
          }
        }, 150);
      }
    }
  }, []);

  // Speak with native Gemini Voice Audio or browser SpeechSynthesis fallback
  const speakText = useCallback(
    async (textToSpeak: string) => {
      try {
        await playInterviewerSpeech(
          textToSpeak,
          () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            // Abort recognition while interviewer speaks so no speaker echo is captured
            try {
              recognitionRef.current?.abort();
            } catch {}
          },
          () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            // Interviewer finished speaking -> candidate's turn to speak!
            startListening();
          }
        );
      } catch (err) {
        console.warn('Interviewer audio playback notice:', err);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        startListening();
      }
    },
    [startListening]
  );

  // Candidate Response Handler & State Machine Transition
  const handleCandidateResponse = useCallback(
    async (answerText: string) => {
      const clean = answerText.trim();
      if (!clean) return;

      // Prevent duplicate concurrent requests
      if (isProcessingRef.current) {
        console.warn('Already processing candidate turn, ignoring duplicate call.');
        return;
      }
      isProcessingRef.current = true;
      setIsAiThinking(true);
      setInterimTranscript('');
      accumulatedFinalRef.current = '';
      candidateSpeechRef.current = '';

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // 1. Record candidate turn
      addTurn('candidate', clean);

      try {
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
        stageRef.current = nextStage;

        // 3. Dynamically generate role-tailored question
        const dynamicQuestion = await generateDynamicRoleTurnWithGemini({
          targetRole: targetRoleRef.current,
          nextStage,
          candidateAnswer: clean,
          history: turnsRef.current
        });

        setIsAiThinking(false);
        setLastQuestion(dynamicQuestion);
        setCurrentSubtitle(dynamicQuestion);

        // 4. Record interviewer turn
        addTurn('interviewer', dynamicQuestion);

        // 5. Play speech (when Rotem finishes, recognition starts listening)
        await speakText(dynamicQuestion);
      } catch (err) {
        console.error('Error handling candidate response:', err);
        setIsAiThinking(false);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [addTurn, speakText]
  );

  useEffect(() => {
    handleResponseRef.current = handleCandidateResponse;
  }, [handleCandidateResponse]);

  // Flush and immediately submit any candidate speech
  const submitCurrentSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const pendingText = (candidateSpeechRef.current || interimTranscript).trim();
    if (pendingText.length >= 2) {
      accumulatedFinalRef.current = '';
      candidateSpeechRef.current = '';
      setInterimTranscript('');
      handleResponseRef.current(pendingText);
    }
  }, [interimTranscript]);

  // Web Speech API (he-IL, continuous: true, interimResults: true)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'he-IL';

    recognition.onresult = (event: any) => {
      // If interviewer is speaking or AI is currently generating response, ignore mic audio
      if (isSpeakingRef.current || isProcessingRef.current) {
        return;
      }

      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const piece = item[0]?.transcript || '';
        if (item.isFinal) {
          finalChunk += piece + ' ';
        } else {
          interimChunk += piece;
        }
      }

      if (finalChunk) {
        accumulatedFinalRef.current = (accumulatedFinalRef.current + ' ' + finalChunk).trim();
      }

      const totalSpeech = (accumulatedFinalRef.current + ' ' + interimChunk).trim();
      if (!totalSpeech) return;

      candidateSpeechRef.current = totalSpeech;
      setInterimTranscript(totalSpeech);

      // Auto-submit after 2.0s of silence when candidate stops speaking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        const fullAnswer = candidateSpeechRef.current.trim();
        if (fullAnswer.length >= 3 && !isSpeakingRef.current && !isProcessingRef.current) {
          accumulatedFinalRef.current = '';
          candidateSpeechRef.current = '';
          setInterimTranscript('');
          handleResponseRef.current(fullAnswer);
        }
      }, 2000);
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
      if (
        isSessionActiveRef.current &&
        isListeningRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current
      ) {
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (
              isSessionActiveRef.current &&
              isListeningRef.current &&
              !isSpeakingRef.current &&
              !isProcessingRef.current
            ) {
              try {
                recognition.start();
              } catch {}
            }
          }, 200);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      stopSpeaking();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
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
      stopSpeaking();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsAiThinking(false);
      isProcessingRef.current = false;
      accumulatedFinalRef.current = '';
      candidateSpeechRef.current = '';
      setInterimTranscript('');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      const activeRole = (chosenRole || targetRoleRef.current).trim() || 'Software Engineer';
      if (chosenRole) {
        setTargetRole(activeRole);
        targetRoleRef.current = activeRole;
      }

      const introText = getRoleIntroPrompt(activeRole);
      const initialTurn: Turn = {
        speaker: 'interviewer',
        text: introText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTurns([initialTurn]);
      turnsRef.current = [initialTurn];
      setCurrentStage('intro');
      stageRef.current = 'intro';
      setLastQuestion(introText);
      setCurrentSubtitle(introText);
      setReport(null);
      setCallDuration(0);

      setIsSessionActive(true);
      isSessionActiveRef.current = true;

      // Speak intro question (when Rotem finishes, recognition will start listening)
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
      isSpeakingRef.current = false;
      setIsListening(false);
      isListeningRef.current = false;
      isSessionActiveRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      // Capture any unsubmitted live candidate speech so it is NEVER lost
      const pendingSpeech = (candidateSpeechRef.current || interimTranscript).trim();
      let activeTurns = [...turnsRef.current];
      if (pendingSpeech.length >= 3) {
        const last = activeTurns[activeTurns.length - 1];
        if (!last || last.speaker !== 'candidate' || last.text !== pendingSpeech) {
          const newTurn: Turn = {
            speaker: 'candidate',
            text: pendingSpeech,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          activeTurns.push(newTurn);
          setTurns(activeTurns);
          turnsRef.current = activeTurns;
        }
        candidateSpeechRef.current = '';
        setInterimTranscript('');
      }

      setIsAnalyzing(true);

      try {
        const critique = await evaluateInterviewWithGemini(
          activeTurns,
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
    [interimTranscript, onEvaluationComplete]
  );

  // Restart interview completely
  const restartSession = useCallback(
    (chosenRole?: string) => {
      stopSpeaking();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsAiThinking(false);
      isProcessingRef.current = false;
      accumulatedFinalRef.current = '';
      candidateSpeechRef.current = '';
      setInterimTranscript('');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      const activeRole = (chosenRole || targetRoleRef.current).trim() || 'Software Engineer';
      if (chosenRole) {
        setTargetRole(activeRole);
        targetRoleRef.current = activeRole;
      }

      const introText = getRoleIntroPrompt(activeRole);
      const initialTurn: Turn = {
        speaker: 'interviewer',
        text: introText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTurns([initialTurn]);
      turnsRef.current = [initialTurn];
      setCurrentStage('intro');
      stageRef.current = 'intro';
      setCallDuration(0);
      setLastQuestion(introText);
      setCurrentSubtitle(introText);
      setReport(null);
      setIsSessionActive(true);
      isSessionActiveRef.current = true;

      // Speak intro question
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
    isAiThinking,
    interimTranscript,
    speechError,
    stopSpeaking,
    toggleListening,
    repeatQuestion,
    submitCurrentSpeech,

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
