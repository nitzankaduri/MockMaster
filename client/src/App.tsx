import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import type { AppMode } from './components/Header';
import { InterviewerPanel } from './components/InterviewerPanel';
import { CodeSandbox } from './components/CodeSandbox';
import { ConsoleOutput } from './components/ConsoleOutput';
import { HebrewInterviewStage } from './components/HebrewInterviewStage';
import { PROBLEMS } from './data/problems';
import type {
  AvatarVisualState,
  CodingProblem,
  CustomTestCase,
  ExecutionResult,
  PersonaType,
  SupportedLanguage,
  TestCaseResult
} from './types';
import { useRealtimeVoiceSession } from './hooks/useRealtimeVoiceSession';
import { useInterviewerAgent } from './hooks/useInterviewerAgent';
import { buildTestHarness, executeCode, parseHarnessOutput } from './services/codeExecution';

export default function App() {
  // Top-level mode switcher: LeetCode Sandbox vs Hebrew HR & Behavioral Interviewer
  const [activeMode, setActiveMode] = useState<AppMode>('hebrew_interview');

  // Active problem & language selection
  const [currentProblem, setCurrentProblem] = useState<CodingProblem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(PROBLEMS[0].starterCode.python);
  const [customTestCases, setCustomTestCases] = useState<CustomTestCase[]>([]);
  const [lastCodeEditTime, setLastCodeEditTime] = useState<number>(0);
  const [activePersona, setActivePersona] = useState<PersonaType>('mentor');

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  // Full-Duplex Real-Time Voice Session Hook (for Coding Sandbox)
  const {
    isListening,
    isSpeaking,
    isMuted,
    interimTranscript,
    currentCaption,
    toggleListening,
    speak,
    toggleMute,
    playAudioCue
  } = useRealtimeVoiceSession({
    persona: activePersona,
    onSpeechInput: (transcript) => {
      handleUserMessage(transcript);
    }
  });

  // Interviewer Agent Hook (for Coding Sandbox)
  const {
    personaType,
    setPersonaType,
    mood,
    interviewState,
    messages,
    hintIndex,
    handleUserMessage,
    handleExecutionResult,
    requestHint,
    resetInterview
  } = useInterviewerAgent({
    problem: currentProblem,
    language,
    speak,
    playAudioCue,
    lastCodeEditTime,
    initialPersona: activePersona
  });

  const handleSelectPersona = useCallback(
    (persona: PersonaType) => {
      setActivePersona(persona);
      setPersonaType(persona);
    },
    [setPersonaType]
  );

  // Handle user typing in Monaco editor
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setLastCodeEditTime(Date.now());
  }, []);

  // When problem or language changes, update the editor code
  const handleSelectProblem = useCallback(
    (problem: CodingProblem) => {
      setCurrentProblem(problem);
      setCode(problem.starterCode[language] || problem.starterCode.python);
      setExecutionResult(null);
      setTestResults(null);
      setCustomTestCases([]);
      setLastCodeEditTime(Date.now());
    },
    [language]
  );

  const handleLanguageChange = useCallback(
    (newLang: SupportedLanguage) => {
      setLanguage(newLang);
      setCode(currentProblem.starterCode[newLang] || '');
      setExecutionResult(null);
      setTestResults(null);
      setLastCodeEditTime(Date.now());
    },
    [currentProblem]
  );

  const handleResetCode = useCallback(() => {
    setCode(currentProblem.starterCode[language] || '');
    setLastCodeEditTime(Date.now());
  }, [currentProblem, language]);

  // Add custom test case
  const handleAddCustomTestCase = useCallback((input: string, expected?: string) => {
    setCustomTestCases((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        input,
        expected: expected || ''
      }
    ]);
  }, []);

  const handleRemoveCustomTestCase = useCallback((id: string) => {
    setCustomTestCases((prev) => prev.filter((tc) => tc.id !== id));
  }, []);

  // Run Code against visible test cases
  const handleRunCode = useCallback(async () => {
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setExecutionResult(null);
    setTestResults(null);

    playAudioCue('submit');

    try {
      const harnessCode = buildTestHarness(currentProblem, language, code, customTestCases);
      const rawResult = await executeCode(language, harnessCode);

      const { testResults: parsedResults, cleanStdout } = parseHarnessOutput(
        rawResult.stdout,
        currentProblem,
        customTestCases
      );
      setTestResults(parsedResults);

      const cleanedResult: ExecutionResult = {
        ...rawResult,
        stdout: cleanStdout
      };
      setExecutionResult(cleanedResult);

      handleExecutionResult(cleanedResult, parsedResults);
    } catch (err: any) {
      const errorResult: ExecutionResult = {
        stdout: '',
        stderr: err.message || 'Execution failed to connect to execution engine.',
        code: 1,
        executionTime: '0ms'
      };
      setExecutionResult(errorResult);
      handleExecutionResult(errorResult, []);
    } finally {
      setIsRunning(false);
    }
  }, [
    isRunning,
    isSubmitting,
    currentProblem,
    customTestCases,
    language,
    code,
    handleExecutionResult,
    playAudioCue
  ]);

  // Submit Code against all test cases
  const handleSubmitCode = useCallback(async () => {
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setExecutionResult(null);
    setTestResults(null);

    playAudioCue('submit');

    try {
      const harnessCode = buildTestHarness(currentProblem, language, code, customTestCases);
      const rawResult = await executeCode(language, harnessCode);

      const { testResults: parsedResults, cleanStdout } = parseHarnessOutput(
        rawResult.stdout,
        currentProblem,
        customTestCases
      );
      setTestResults(parsedResults);

      const cleanedResult: ExecutionResult = {
        ...rawResult,
        stdout: cleanStdout
      };
      setExecutionResult(cleanedResult);

      handleExecutionResult(cleanedResult, parsedResults);
    } catch (err: any) {
      const errorResult: ExecutionResult = {
        stdout: '',
        stderr: err.message || 'Submission failed.',
        code: 1,
        executionTime: '0ms'
      };
      setExecutionResult(errorResult);
      handleExecutionResult(errorResult, []);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isRunning,
    isSubmitting,
    currentProblem,
    customTestCases,
    language,
    code,
    handleExecutionResult,
    playAudioCue
  ]);

  // Derive visual avatar state for coding sandbox
  const visualState: AvatarVisualState = isSpeaking
    ? 'SPEAKING'
    : isListening
    ? 'LISTENING'
    : isRunning || isSubmitting
    ? 'THINKING'
    : 'IDLE';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a10] text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        currentProblem={currentProblem}
        onSelectProblem={handleSelectProblem}
        isListening={isListening}
        onToggleListening={toggleListening}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onResetSession={resetInterview}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
      />

      {/* Main Workspace: Hebrew HR/Behavioral Stage vs Coding Sandbox */}
      {activeMode === 'hebrew_interview' ? (
        <div className="flex-1 overflow-hidden">
          <HebrewInterviewStage
            onSwitchToCoding={() => setActiveMode('coding_sandbox')}
          />
        </div>
      ) : (
        /* LeetCode Multi-Tab Sandbox & English Interviewer Panel */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Side: Visual AI Interviewer Persona Panel */}
          <div className="w-full md:w-[40%] lg:w-[36%] h-1/2 md:h-full shrink-0 flex flex-col overflow-hidden">
            <InterviewerPanel
              problem={currentProblem}
              interviewState={interviewState}
              personaType={personaType}
              onSelectPersona={handleSelectPersona}
              mood={mood}
              visualState={visualState}
              currentCaption={currentCaption}
              messages={messages}
              hintIndex={hintIndex}
              onSendMessage={handleUserMessage}
              onRequestHint={requestHint}
              isListening={isListening}
              onToggleListening={toggleListening}
              interimTranscript={interimTranscript}
            />
          </div>

          {/* Right Side: Monaco Multi-Tab Sandbox + Terminal Console */}
          <div className="flex-1 h-1/2 md:h-full flex flex-col overflow-hidden bg-[#070a10] border-t md:border-t-0 md:border-l border-cyan-500/20">
            <div className="flex-1 overflow-hidden">
              <CodeSandbox
                problem={currentProblem}
                language={language}
                onLanguageChange={handleLanguageChange}
                code={code}
                onCodeChange={handleCodeChange}
                onResetCode={handleResetCode}
                onRunCode={handleRunCode}
                onSubmitCode={handleSubmitCode}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
                customTestCases={customTestCases}
                onAddCustomTestCase={handleAddCustomTestCase}
                onRemoveCustomTestCase={handleRemoveCustomTestCase}
                executionResult={executionResult}
                testResults={testResults}
              />
            </div>

            <div className="shrink-0">
              <ConsoleOutput
                executionResult={executionResult}
                testResults={testResults}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

