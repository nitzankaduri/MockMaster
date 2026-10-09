export type HebrewRole =
  | 'software_engineer'
  | 'qa_automation'
  | 'devops'
  | 'product_manager'
  | 'data_analyst'
  | 'cyber_security';

export type HebrewInterviewType = 'hr' | 'behavioral' | 'technical';

export type HebrewPersona = 'mentor' | 'challenging';

export interface HebrewInterviewConfig {
  candidateName: string;
  role: HebrewRole;
  interviewType: HebrewInterviewType;
  persona: HebrewPersona;
}

export interface StarEvaluation {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  score: number; // 0-100
  notesHe: string;
}

export interface HebrewDialogueMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  starEvaluation?: StarEvaluation;
  feedbackNote?: string;
}

export interface HebrewFeedbackReport {
  overallScore: number;
  scores: {
    fluency: number;         // שטף ביטוי וביטחון
    starStructure: number;   // יישום מתודולוגיית STAR
    technicalDepth: number;  // עומק מקצועי והבנה
    conciseness: number;     // מיקוד וללא סטיות
  };
  summaryHe: string;
  strengthsHe: string[];
  improvementsHe: string[];
  annotatedTranscript: HebrewDialogueMessage[];
}

