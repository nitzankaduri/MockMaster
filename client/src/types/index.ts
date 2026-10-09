export type MessageSender = 'ai' | 'user' | 'system';

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
  metadata?: {
    stage?: InterviewState;
    hintType?: 'syntax' | 'logic' | 'complexity' | 'encouragement' | 'idle-nudge';
    hintLevel?: number;
    personaId?: PersonaType;
  };
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  code: number;
  executionTime?: string;
  memory?: string;
  error?: string;
}

export interface TestCaseResult {
  index: number;
  input: string;
  expected: string;
  actual?: string;
  passed: boolean;
  error?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface CustomTestCase {
  id: string;
  input: string;
  expected: string;
}

export type SupportedLanguage = 'python' | 'javascript' | 'cpp';

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  acceptanceRate: string;
  description: string;
  constraints: string[];
  examples: ProblemExample[];
  starterCode: Record<SupportedLanguage, string>;
  testCases: TestCase[];
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
  hints: string[];
}

export type InterviewState =
  | 'GREETING'
  | 'PROBLEM_CLARIFICATION'
  | 'CODING'
  | 'REVIEW_AND_COMPLEXITY'
  | 'COMPLETED';

export type AvatarVisualState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export type PersonaType = 'mentor' | 'bar_raiser';

export type InterviewMood =
  | 'Attentive'
  | 'Evaluating Strategy'
  | 'Probing Trade-offs'
  | 'Analyzing Traceback'
  | 'Complexity Review'
  | 'Impressed';

export interface InterviewerPersona {
  id: PersonaType;
  name: string;
  title: string;
  company: string;
  seniority: string;
  avatarSeed: string;
  accentColor: string;
  tagline: string;
  styleDescription: string;
}

export interface VoiceAgentState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export interface PerformanceMetrics {
  runtimeMs: number;
  memoryKb?: number;
  passedTests: number;
  totalTests: number;
  optimalTime: string;
  optimalSpace: string;
  status: 'passed' | 'failed' | 'idle';
}
