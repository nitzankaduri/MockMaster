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
import { generateGeminiLeetCodeResponse } from '../services/geminiLeetCodeInterviewer';
import type { AudioCueType } from './useRealtimeVoiceSession';

interface UseInterviewerAgentProps {
  problem: CodingProblem;
  language: SupportedLanguage;
  candidateCode?: string;
  speak: (text: string) => void;
  playAudioCue?: (type: AudioCueType) => void;
  lastCodeEditTime?: number;
  initialPersona?: PersonaType;
}

export function useInterviewerAgent({
  problem,
  language,
  candidateCode = '',
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
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string>('');

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const playAudioCueRef = useRef(playAudioCue);
  useEffect(() => {
    playAudioCueRef.current = playAudioCue;
  }, [playAudioCue]);

  const candidateCodeRef = useRef(candidateCode);
  useEffect(() => {
    candidateCodeRef.current = candidateCode;
  }, [candidateCode]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender,
        text,
        timestamp: new Date(),
        metadata: {
          hintLevel,
          personaId: personaType
        }
      };

      setMessages(prev => [...prev, newMessage]);

      // Sarah (mentor) communicates exclusively via text chat, never speak messages aloud
      const isSarah = personaType === 'mentor';
      if (shouldSpeak && sender === 'ai' && !isSarah) {
        speakRef.current(text);
      }

      return newMessage;
    },
    [personaType]
  );

  // Initial greeting when problem changes or persona switches
  useEffect(() => {
    let isCancelled = false;

    const startInterview = async () => {
      setMessages([]);
      setInterviewState('GREETING');
      setMood('Attentive');
      setHintIndex(0);
      lastActiveRef.current = Date.now();
      hasTriggeredIdleNudgeRef.current = false;
      setIsAiThinking(true);

      try {
        const output = await generateGeminiLeetCodeResponse({
          problem,
          persona: personaType,
          messages: [],
          candidateCode: candidateCodeRef.current || '',
          language
        });

        if (isCancelled) return;

        setIsAiThinking(false);
        setMood(output.mood || 'Attentive');
        setCurrentCaption(output.caption || output.text);
        addMessage('ai', output.text, true);
        playAudioCueRef.current?.('start');
      } catch (e) {
        if (isCancelled) return;
        setIsAiThinking(false);
        const fallback =
          personaType === 'mentor'
            ? `שלום! אני שרה חן, מהנדסת תוכנה בכירה ב-MockMaster. נעים מאוד להכיר! היום נעבוד יחד על **${problem.title}** (${problem.difficulty} — ${problem.category}). עיין בתיאור הבעיה משמאל. כיצד אתה חושב לגשת לפתרון?`
            : `שלום, שמי מרקוס ואנס, ארכיטקט מערכות ראשי. אתגר הראיון היום הוא **${problem.title}**. לפני כתיבת קוד, תאר את הגישה האלגוריתמית שלך ואת ציפיות זמן הריצה.`;
        setCurrentCaption(fallback);
        addMessage('ai', fallback, true);
        playAudioCueRef.current?.('start');
      }
    };

    const timer = setTimeout(() => {
      startInterview();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [problem.id, personaType, language]);

  // Evaluates candidate's vocal or typed message via Gemini
  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      lastActiveRef.current = Date.now();

      // 1. Add user message to conversation immediately
      const userMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: 'user',
        text,
        timestamp: new Date()
      };
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);

      setIsAiThinking(true);

      try {
        const output = await generateGeminiLeetCodeResponse({
          problem,
          persona: personaType,
          messages: updatedMessages,
          userMessage: text,
          candidateCode: candidateCodeRef.current || '',
          language
        });

        setIsAiThinking(false);
        setMood(output.mood || 'Evaluating Strategy');
        if (output.nextState) {
          setInterviewState(output.nextState);
        }
        setCurrentCaption(output.caption || output.text);
        addMessage('ai', output.text, true);
      } catch (err) {
        console.error('Failed to generate Gemini response:', err);
        setIsAiThinking(false);
        addMessage(
          'ai',
          `שמעתי את הנקודה שהעלית: "${text}". בוא נחשוב כיצד נוכל לפרק את הבעיה: מה תהיה גישת הכוח הגס (Brute-force) הפשוטה ביותר כאן?`,
          true
        );
      }
    },
    [addMessage, personaType, problem, language]
  );

  // Progressive Socratic Hint Dispenser via Gemini
  const requestHint = useCallback(async () => {
    lastActiveRef.current = Date.now();
    const currentLevel = (hintIndex % problem.hints.length) + 1;
    setHintIndex(prev => prev + 1);

    const hintPrompt = `אשמח לרמז (רמה ${currentLevel} מתוך ${problem.hints.length}) לגבי דרך הפתרון של "${problem.title}". תוכל לתת לי רמז מנחה סוקרטי מבלי לגלות את הפתרון המלא?`;

    // Add user hint request
    const userMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      text: hintPrompt,
      timestamp: new Date()
    };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(updatedMessages);

    setIsAiThinking(true);

    try {
      const output = await generateGeminiLeetCodeResponse({
        problem,
        persona: personaType,
        messages: updatedMessages,
        userMessage: hintPrompt,
        candidateCode: candidateCodeRef.current || '',
        language
      });

      setIsAiThinking(false);
      setMood('Probing Trade-offs');
      setCurrentCaption(output.caption || output.text);
      addMessage('ai', output.text, true, currentLevel);
    } catch {
      setIsAiThinking(false);
      const rawHint = problem.hints[hintIndex % problem.hints.length];
      addMessage('ai', `הנה רמז מכוון עבורך: ${rawHint}`, true, currentLevel);
    }
  }, [addMessage, hintIndex, problem, personaType, language]);

  // Evaluates code execution outcome (Run or Submit) via Gemini
  const handleExecutionResult = useCallback(
    async (execResult: ExecutionResult, testResults?: TestCaseResult[]) => {
      lastActiveRef.current = Date.now();
      const isSubmission = Boolean(testResults && testResults.length > 0);

      // Play audio cues
      if (execResult.stderr || execResult.code !== 0) {
        playAudioCueRef.current?.('alert');
      } else if (testResults && testResults.length > 0) {
        const allPassed = testResults.every(tc => tc.passed);
        if (allPassed) {
          playAudioCueRef.current?.('success');
        } else {
          playAudioCueRef.current?.('alert');
        }
      }

      setIsAiThinking(true);

      try {
        const output = await generateGeminiLeetCodeResponse({
          problem,
          persona: personaType,
          messages: messagesRef.current,
          candidateCode: candidateCodeRef.current || '',
          language,
          executionResult: execResult,
          testResults,
          isCodeRun: !isSubmission,
          isSubmission
        });

        setIsAiThinking(false);
        setMood(output.mood || (isSubmission ? 'Complexity Review' : 'Evaluating Strategy'));
        if (output.nextState) {
          setInterviewState(output.nextState);
        }
        setCurrentCaption(output.caption || output.text);
        addMessage('ai', output.text, true);
      } catch (err) {
        console.error('Failed to analyze execution result with Gemini:', err);
        setIsAiThinking(false);
        if (execResult.stderr) {
          addMessage('ai', `שמתי לב לשגיאת ריצה בקוד שלך: \`${execResult.stderr.slice(0, 100)}\`. בוא נבדוק היכן בדיוק זה קרה.`, true);
        } else if (testResults) {
          const passed = testResults.filter(t => t.passed).length;
          addMessage('ai', `עברת ${passed}/${testResults.length} מקרי בדיקה. בדוק את המקרה שנכשל בלשונית הבדיקות כדי לראות איזה תנאי קצה פוספס.`, true);
        }
      }
    },
    [addMessage, personaType, problem, language]
  );

  const resetInterview = useCallback(() => {
    setMessages([]);
    setInterviewState('GREETING');
    setMood('Attentive');
    setHintIndex(0);
    lastActiveRef.current = Date.now();
    hasTriggeredIdleNudgeRef.current = false;
  }, []);

  return {
    personaType,
    setPersonaType,
    mood,
    interviewState,
    messages,
    hintIndex,
    isAiThinking,
    currentCaption,
    handleUserMessage,
    handleExecutionResult,
    requestHint,
    resetInterview,
    addMessage
  };
}
