export type HebrewRole =
  | 'software_engineer'
  | 'qa_automation'
  | 'devops'
  | 'product_manager'
  | 'data_analyst'
  | 'cyber_security'
  | string;

export type HebrewInterviewType = 'hr' | 'behavioral' | 'technical';

export type HebrewPersona = 'mentor' | 'challenging';

export interface JobRolePreset {
  id: string;
  titleHe: string;
  titleEn: string;
  icon: string;
  description: string;
  tags: string[];
}

export const DEFAULT_ROLE_PRESETS: JobRolePreset[] = [
  {
    id: 'fullstack',
    titleHe: 'מפתח/ת Full Stack',
    titleEn: 'Full Stack Developer',
    icon: '💻',
    description: 'פיתוח מקצה לקצה, חיבור בין ממשק משתמש למערכות שרת ו-APIs',
    tags: ['React', 'Node.js', 'System Architecture', 'APIs']
  },
  {
    id: 'backend',
    titleHe: 'מהנדס/ת Backend',
    titleEn: 'Backend Engineer',
    icon: '⚙️',
    description: 'מערכות מבוזרות, בסיסי נתונים, ביצועים ומיקרו-סרביסים',
    tags: ['Microservices', 'Databases', 'High Scale', 'APIs']
  },
  {
    id: 'frontend',
    titleHe: 'מפתח/ת Frontend',
    titleEn: 'Frontend Developer',
    icon: '🎨',
    description: 'ממשקי משתמש מורכבים, ניהול State, Web Vitals וביצועי לקוח',
    tags: ['React/Vue', 'State Management', 'Web Performance', 'UI/UX']
  },
  {
    id: 'devops',
    titleHe: 'מהנדס/ת DevOps & Cloud',
    titleEn: 'DevOps & Cloud Engineer',
    icon: '☁️',
    description: 'תשתיות ענן, קוברנטיס, צינורות CI/CD וניטור פרודקשן',
    tags: ['Kubernetes', 'CI/CD', 'AWS/GCP', 'Observability']
  },
  {
    id: 'product',
    titleHe: 'מנהל/ת מוצר (Product Manager)',
    titleEn: 'Product Manager',
    icon: '🎯',
    description: 'אסטרטגיית מוצר, תעדוף פיצ׳רים, ניתוח מדדים ועבודה מול לקוחות',
    tags: ['Product Strategy', 'KPIs & Metrics', 'Stakeholder Management', 'Discovery']
  },
  {
    id: 'qa',
    titleHe: 'מהנדס/ת אוטומציה ובדיקות (QA)',
    titleEn: 'QA & Automation Engineer',
    icon: '🧪',
    description: 'ארכיטקטורת בדיקות אוטומטיות, ניהול סיכונים ובקרת איכות גרסאות',
    tags: ['Playwright/Cypress', 'Automation Architecture', 'CI/CD Quality', 'Bug Triage']
  },
  {
    id: 'data',
    titleHe: 'מדען/ית נתונים ו-AI',
    titleEn: 'Data Scientist / AI Engineer',
    icon: '📊',
    description: 'מודלי שפה ו-ML, הנדסת תכונות, צינורות נתונים והערכת מודלים',
    tags: ['LLMs & ML', 'Python', 'Feature Engineering', 'Data Pipelines']
  },
  {
    id: 'cyber',
    titleHe: 'מומחה/ית אבטחת מידע וסייבר',
    titleEn: 'Cyber Security Specialist',
    icon: '🛡️',
    description: 'אבטחת אפליקציות, מודלי איומים, תגובה לאירועי סייבר והגנת ענן',
    tags: ['Application Security', 'Threat Modeling', 'Incident Response', 'Zero Trust']
  },
  {
    id: 'mobile',
    titleHe: 'מפתח/ת מובייל (iOS / Android)',
    titleEn: 'Mobile Developer',
    icon: '📱',
    description: 'פיתוח אפליקציות מובייל, ניהול זיכרון, עבודה Offline ו-App Stores',
    tags: ['React Native / Flutter', 'iOS / Android', 'Offline Sync', 'Mobile UX']
  },
  {
    id: 'lead',
    titleHe: 'ראש צוות פיתוח (Tech Lead / R&D)',
    titleEn: 'Tech Lead / Engineering Manager',
    icon: '👥',
    description: 'הובלת צוות, מנטורינג טכנולוגי, תכנון ארכיטקטורה וקבלת החלטות הנדסיות',
    tags: ['Team Leadership', 'Mentorship', 'Delivery', 'Architecture']
  }
];

export interface HebrewInterviewConfig {
  candidateName: string;
  role: HebrewRole;
  targetRole?: string;
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
