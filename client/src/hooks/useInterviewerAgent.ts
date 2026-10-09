import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CodingProblem,
  ExecutionResult,
  InterviewMood,
  InterviewState,
  Message,
  PersonaType,
  SupportedLanguage,
  TestCaseResult
} from '../types';
import {
  generateComplexityFeedback,
  generateGreeting,
  generateIdleNudge,
  generateStrategyFeedback,
  generateSubmissionFeedback,
  generateTracebackFeedback
} from '../services/interviewerPersona';
import type { AudioCueType } from './useRealtimeVoiceSession';

interface UseInterviewerAgentProps {
  problem: CodingProblem;
  language: SupportedLanguage;
  speak: (text: string) => void;
  playAudioCue?: (type: AudioCueType) => void;
  lastCodeEditTime?: number;
  initialPersona?: PersonaType;
}

export function useInterviewerAgent({
  problem,
  language: _language,
  speak,
  playAudioCue,
  lastCodeEditTime = 0,
  initialPersona = 'mentor'
}: UseInterviewerAgentProps) {
  const [personaType, setPersonaType] = useState<PersonaType>(initialPersona);
  const [interviewState, setInterviewState] = useState<InterviewState>('GREETING');
  const [mood, setMood] = useState<InterviewMood>('Attentive');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hintIndex, setHintIndex] = useState(0);

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const playAudioCueRef = useRef(playAudioCue);
  useEffect(() => {
    playAudioCueRef.current = playAudioCue;
  }, [playAudioCue]);

  // Track candidate activity to detect idle state (> 90 seconds)
  const lastActiveRef = useRef<number>(0);
  const hasTriggeredIdleNudgeRef = useRef<boolean>(false);

  useEffect(() => {
    lastActiveRef.current = lastCodeEditTime > 0 ? lastCodeEditTime : Date.now();
    hasTriggeredIdleNudgeRef.current = false;
  }, [lastCodeEditTime]);

  // Append message and optionally speak it
  const addMessage = useCallback(
    (
      sender: 'ai' | 'user' | 'system',
      text: string,
      shouldSpeak: boolean = false,
      hintLevel?: number
    ) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        sender,
        text,
        timestamp: new Date(),
        metadata: {
          hintLevel,
          personaId: personaType
        }
      };

      setMessages(prev => [...prev, newMessage]);

      if (shouldSpeak && sender === 'ai') {
        speakRef.current(text);
      }

      return newMessage;
    },
    [personaType]
  );

  // Progressive Socratic Hint Dispenser
  const requestHint = useCallback(() => {
    lastActiveRef.current = Date.now();
    const currentLevel = (hintIndex % problem.hints.length) + 1;
    const rawHint = problem.hints[hintIndex % problem.hints.length];
    setHintIndex(prev => prev + 1);

    const hintText = generateIdleNudge(personaType, rawHint, currentLevel, problem.hints.length);
    setMood('Probing Trade-offs');
    addMessage('ai', hintText, true, currentLevel);
  }, [addMessage, hintIndex, problem.hints, personaType]);

  // Idle Monitor: Trigger Socratic nudge if inactive for > 90 seconds in CODING phase
  useEffect(() => {
    const idleCheckInterval = setInterval(() => {
      if (interviewState !== 'CODING') return;

      const idleDuration = Date.now() - lastActiveRef.current;
      if (idleDuration >= 90000 && !hasTriggeredIdleNudgeRef.current) {
        hasTriggeredIdleNudgeRef.current = true;
        const currentLevel = (hintIndex % problem.hints.length) + 1;
        const nextHint = problem.hints[hintIndex % problem.hints.length];
        setHintIndex(prev => prev + 1);

        const nudgeText = generateIdleNudge(personaType, nextHint, currentLevel, problem.hints.length);
        setMood('Probing Trade-offs');
        addMessage('ai', nudgeText, true, currentLevel);
      }
    }, 10000);

    return () => clearInterval(idleCheckInterval);
  }, [interviewState, hintIndex, problem.hints, addMessage, personaType]);

  // Initial greeting when session starts, problem changes, or persona switches
  useEffect(() => {
    const greetingText = generateGreeting(personaType, problem);

    const timer = setTimeout(() => {
      setMessages([]);
      setInterviewState('GREETING');
      setMood('Attentive');
      setHintIndex(0);
      lastActiveRef.current = Date.now();
      hasTriggeredIdleNudgeRef.current = false;
      addMessage('ai', greetingText, true);
      playAudioCueRef.current?.('start');
    }, 350);

    return () => clearTimeout(timer);
  }, [problem.id, personaType, addMessage, problem]);

  // Evaluates candidate's vocal or typed message
  const handleUserMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      lastActiveRef.current = Date.now();

      // Add user message to conversation
      addMessage('user', text, false);

      const lower = text.toLowerCase();

      setTimeout(() => {
        // 1. Candidate asks for hints
        if (
          lower.includes('hint') ||
          lower.includes('stuck') ||
          lower.includes('clue') ||
          lower.includes('help') ||
          lower.includes('nudge')
        ) {
          requestHint();
          return;
        }

        // 2. State-specific flow
        if (interviewState === 'GREETING' || interviewState === 'PROBLEM_CLARIFICATION' || interviewState === 'CODING') {
          const feedback = generateStrategyFeedback(personaType, text, problem);
          setMood(feedback.mood);
          setInterviewState(feedback.nextState);
          addMessage('ai', feedback.text, true);
        } else if (interviewState === 'REVIEW_AND_COMPLEXITY') {
          const feedback = generateComplexityFeedback(personaType, text, problem);
          setMood(feedback.mood);
          if (feedback.completed) {
            setInterviewState('COMPLETED');
            playAudioCueRef.current?.('success');
          }
          addMessage('ai', feedback.text, true);
        } else if (interviewState === 'COMPLETED') {
          setMood('Impressed');
          addMessage(
            'ai',
            `You've mastered this problem! Select another challenge from the top navigation or try switching personas to practice different interview pressures.`,
            true
          );
        }
      }, 450);
    },
    [addMessage, interviewState, personaType, problem, requestHint]
  );

  // Evaluates code execution outcome
  const handleExecutionResult = useCallback(
    (execResult: ExecutionResult, testResults?: TestCaseResult[]) => {
      lastActiveRef.current = Date.now();

      // 1. Crash or Compilation Error
      if (execResult.stderr || execResult.code !== 0) {
        const errorText = execResult.stderr || 'Runtime error';
        const feedback = generateTracebackFeedback(personaType, errorText);
        setMood(feedback.mood);
        playAudioCueRef.current?.('alert');
        addMessage('ai', feedback.text, true);
        return;
      }

      // 2. Test Cases Evaluation (Submission)
      if (testResults && testResults.length > 0) {
        const failedCases = testResults.filter(tc => !tc.passed);
        const passedCount = testResults.length - failedCases.length;

        if (failedCases.length === 0) {
          playAudioCueRef.current?.('success');
        } else {
          playAudioCueRef.current?.('alert');
        }

        const feedback = generateSubmissionFeedback(
          personaType,
          passedCount,
          testResults.length,
          failedCases[0],
          problem
        );

        setMood(feedback.mood);
        if (feedback.nextState) {
          setInterviewState(feedback.nextState);
        }
        addMessage('ai', feedback.text, true);
        return;
      }

      // 3. Normal Run Code
      if (execResult.stdout) {
        setMood('Evaluating Strategy');
        addMessage(
          'ai',
          `Your code ran and printed output to the console. When you are confident, click "Submit" to test your solution against our full suite.`,
          true
        );
      }
    },
    [addMessage, personaType, problem]
  );

  const resetInterview = useCallback(() => {
    setMessages([]);
    setInterviewState('GREETING');
    setMood('Attentive');
    setHintIndex(0);
    lastActiveRef.current = Date.now();
    hasTriggeredIdleNudgeRef.current = false;
    const greetingText = generateGreeting(personaType, problem);
    addMessage('ai', greetingText, true);
    playAudioCueRef.current?.('start');
  }, [addMessage, personaType, problem]);

  return {
    personaType,
    setPersonaType,
    mood,
    interviewState,
    messages,
    hintIndex,
    handleUserMessage,
    handleExecutionResult,
    requestHint,
    resetInterview,
    addMessage
  };
}
