/**
 * Hebrew HR & Behavioral Interview Engine
 * State machine managing introduction, behavioral questions (STAR methodology),
 * dynamic follow-ups, candidate questions, and comprehensive report generation.
 */

export type InterviewStage =
  | 'INTRO'                 // היכרות ורקע
  | 'STAR_TEAMWORK'        // עבודת צוות וקונפליקטים
  | 'STAR_PRESSURE'        // למידה עצמאית ועמידה בלחץ
  | 'STAR_CHALLENGE'       // אתגר מורכב / התמודדות עם כישלון
  | 'CANDIDATE_QUESTIONS'  // שאלות המועמד
  | 'CLOSING'              // סיום וסיכום
  | 'COMPLETED';           // הראיון הושלם

export interface StarAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  score: number; // 0-100
  notesHe: string;
}

export interface DialogueTurn {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: Date;
  stage: InterviewStage;
  starAnalysis?: StarAnalysis;
}

export interface HebrewInterviewReport {
  overallScore: number;
  scores: {
    fluency: number;         // שטף ביטוי וביטחון עצמי
    starStructure: number;   // שימוש במתודולוגיית STAR
    clarityAndFit: number;   // בהירות והתאמה לתפקיד
    depthAndImpact: number;  // עומק מקצועי והנמקה
  };
  summaryHe: string;
  strengthsHe: string[];
  improvementsHe: string[];
  turns: DialogueTurn[];
}

// Opening greeting
export const INITIAL_GREETING =
  'שלום וברוך הבא לראיון העבודה שלך במוק מאסטר! שמי רותם, מנהלת גיוס ומשאבי אנוש. המטרה שלנו במפגש היום היא להכיר אותך מעבר לקורות החיים – את הדרך שבה אתה חושב, את סגנון העבודה שלך וההתמודדות עם אתגרים בצוות. לפני שנצלול לשאלות המעמיקות, אשמח שתספר לי קצת על עצמך, על המסלול המקצועי שלך ומה מביא אותך לחפש את האתגר הבא?';

// Core Question Bank
export const STAGE_QUESTIONS: Record<InterviewStage, string> = {
  INTRO: INITIAL_GREETING,
  STAR_TEAMWORK:
    'תודה על השיתוף! בוא נעבור להתמודדות בתוך צוות: תאר לי סיטואציה שבה היית בחוסר הסכמה מקצועי עם חבר צוות או מנהל ישיר. מה היה שורש המחלוקת, איך ניגשת לפתור את זה, ומה הייתה התוצאה הסופית?',
  STAR_PRESSURE:
    'עכשיו אשמח לשמוע על למידה עצמאית ועמידה בלחץ: ספר על מקרה שבו נדרשת ללמוד נושא או טכנולוגיה חדשה לחלוטין בלוח זמנים צפוף במיוחד עבור פרויקט קריטי. איך תכננת את העבודה ואיך התמודדת עם הלחץ?',
  STAR_CHALLENGE:
    'שאלה נוספת שחשובה לי מאוד נוגעת להתמודדות עם מורכבות ואי-ודאות: ספר על פרויקט או משימה שלא התפתחו כמתוכנן, או אפילו נכשלו. מה קרה, מה היה החלק האישי שלך בזה, ומה למדת מזה להמשך דרכך?',
  CANDIDATE_QUESTIONS:
    'תודה על הדוגמאות המפורטות. הגענו לחלק שבו הבמה היא לגמרי שלך: האם יש לך שאלות אליי לגבי התפקיד, התרבות הארגונית בצוות או החברה בכלל?',
  CLOSING:
    'תודה רבה על השאלות המצוינות ועל ראיון מעשיר ופתוח! נהניתי מאוד להכיר אותך ולשמוע על הניסיון והתובנות שלך. נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב המפורט.',
  COMPLETED: ''
};

/**
 * Heuristic detector for STAR (Situation, Task, Action, Result) in Hebrew
 */
export function analyzeStarResponse(text: string): StarAnalysis {
  const clean = text.toLowerCase();

  // Situation indicators
  const situationKeywords = [
    'קרה', 'חברה', 'פרויקט', 'עבדתי ב', 'בעיה', 'אתגר', 'סביבה', 'מצב', 'רקע', 'לקוח', 'צוות', 'מערכת'
  ];
  // Task indicators
  const taskKeywords = [
    'מטרה', 'אחריות', 'יעד', 'תפקידי', 'נדרשתי', 'היה צריך', 'משימה', 'לוח זמנים', 'דדליין', 'אחראי'
  ];
  // Action indicators
  const actionKeywords = [
    'עשיתי', 'פיתחתי', 'יצרתי', 'הובלתי', 'פתרתי', 'בניתי', 'החלטתי', 'כתבתי', 'חקרתי', 'בדקתי', 'יזמתי', 'הצעתי', 'דיברתי'
  ];
  // Result indicators
  const resultKeywords = [
    'תוצאה', 'הצלחה', 'שיפור', 'למדתי', 'אחוזים', 'חסכנו', 'בסוף', 'הסתיים', 'העלה', 'מדד', 'השלמנו', 'אימפקט', 'עמדנו'
  ];

  const hasSituation = situationKeywords.some((w) => clean.includes(w));
  const hasTask = taskKeywords.some((w) => clean.includes(w));
  const hasAction = actionKeywords.some((w) => clean.includes(w));
  const hasResult = resultKeywords.some((w) => clean.includes(w));

  let score = 25;
  if (hasSituation) score += 20;
  if (hasTask) score += 20;
  if (hasAction) score += 20;
  if (hasResult) score += 15;

  let notesHe = '';
  if (hasSituation && hasTask && hasAction && hasResult) {
    notesHe = 'מענה מלא ומצוין לפי כל עקרונות מתודולוגיית STAR!';
  } else if (!hasResult) {
    notesHe = 'תשובה טובה ומפורטת, אך חסרה הדגשה של התוצאה הסופית והאימפקט (Result).';
  } else if (!hasAction) {
    notesHe = 'הסבר יפה של הסיטואציה, אך כדאי להרחיב על הפעולות שנקטת בעצמך (Action).';
  } else {
    notesHe = 'מומלץ לתבל את התשובה במבנה STAR: הרקע (S), המשימה (T), הפעולה שלך (A) והתוצאה (R).';
  }

  return {
    hasSituation,
    hasTask,
    hasAction,
    hasResult,
    score: Math.min(100, score),
    notesHe
  };
}

/**
 * Generates dynamic follow-ups based on candidate's answer and current stage
 */
export function generateFollowUpQuestion(
  candidateText: string,
  currentStage: InterviewStage
): { feedbackLead: string; nextStage: InterviewStage; nextPrompt: string } {
  const star = analyzeStarResponse(candidateText);
  const words = candidateText.trim().split(/\s+/).length;

  let lead = '';
  if (words < 10) {
    lead = 'תודה על התשובה. ';
  } else if (star.hasResult && star.hasAction) {
    lead = 'תשובה מעולה וממוקדת! אהבתי מאוד את הדוגמה וההנמקה. ';
  } else if (!star.hasResult && words > 20) {
    lead = 'זה נשמע כמו תהליך מעניין מאוד ומאתגר. ';
  } else {
    lead = 'תודה רבה על השיתוף המפורט. ';
  }

  // Advance stage
  switch (currentStage) {
    case 'INTRO':
      return {
        feedbackLead: lead,
        nextStage: 'STAR_TEAMWORK',
        nextPrompt: `${lead}${STAGE_QUESTIONS.STAR_TEAMWORK}`
      };

    case 'STAR_TEAMWORK':
      return {
        feedbackLead: lead,
        nextStage: 'STAR_PRESSURE',
        nextPrompt: `${lead}${STAGE_QUESTIONS.STAR_PRESSURE}`
      };

    case 'STAR_PRESSURE':
      return {
        feedbackLead: lead,
        nextStage: 'STAR_CHALLENGE',
        nextPrompt: `${lead}${STAGE_QUESTIONS.STAR_CHALLENGE}`
      };

    case 'STAR_CHALLENGE':
      return {
        feedbackLead: lead,
        nextStage: 'CANDIDATE_QUESTIONS',
        nextPrompt: `${lead}${STAGE_QUESTIONS.CANDIDATE_QUESTIONS}`
      };

    case 'CANDIDATE_QUESTIONS':
      return {
        feedbackLead: lead,
        nextStage: 'CLOSING',
        nextPrompt: `שאלה מצוינת! אצלנו במוק מאסטר אנחנו שמים דגש עליון על שקיפות, למידה הדדית והובלה טכנולוגית עצמאית. כל חבר צוות מקבל מרחב השפעה רחב לצד תמיכה הדוקה מההנהלה. ${STAGE_QUESTIONS.CLOSING}`
      };

    default:
      return {
        feedbackLead: lead,
        nextStage: 'COMPLETED',
        nextPrompt: STAGE_QUESTIONS.CLOSING
      };
  }
}

/**
 * Generate comprehensive analytical feedback report
 */
export function generateFeedbackReport(turns: DialogueTurn[]): HebrewInterviewReport {
  const candidateTurns = turns.filter((t) => t.sender === 'candidate');
  const count = candidateTurns.length;

  if (count === 0) {
    return {
      overallScore: 65,
      scores: {
        fluency: 70,
        starStructure: 60,
        clarityAndFit: 65,
        depthAndImpact: 65
      },
      summaryHe: 'הראיון הסתיים מוקדם. מומלץ לבצע ראיון מלא ולענות על כל שאלות ה-STAR לקבלת תמונת מצב מקיפה.',
      strengthsHe: ['נכונות להתנסות בסימולציית ראיון בעברית'],
      improvementsHe: ['להשלים ראיון מלא כולל שאלות מורכבות'],
      turns
    };
  }

  let totalStar = 0;
  let totalLength = 0;

  candidateTurns.forEach((t) => {
    const star = t.starAnalysis || analyzeStarResponse(t.text);
    totalStar += star.score;
    totalLength += t.text.length;
  });

  const avgStar = Math.round(totalStar / count);
  const avgLen = Math.round(totalLength / count);

  // Fluency score (based on completeness and flow)
  const fluency = Math.min(96, Math.max(68, Math.round(62 + avgLen / 12)));
  // STAR structure
  const starStructure = avgStar;
  // Clarity and fit
  const clarityAndFit = Math.min(95, Math.max(70, Math.round(avgStar * 0.5 + 45)));
  // Depth and impact
  const depthAndImpact = Math.min(94, Math.max(65, Math.round(avgStar * 0.45 + (avgLen > 150 ? 50 : 35))));

  const overall = Math.round(
    fluency * 0.25 + starStructure * 0.35 + clarityAndFit * 0.2 + depthAndImpact * 0.2
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  // Tailored points based on actual answers
  if (starStructure >= 75) {
    strengths.push('שליטה גבוהה במתודולוגיית STAR – מענה מובנה עם פירוט סיטואציה, משימה ופעולות אישיות.');
  } else {
    improvements.push('הקפדה על מבנה תשובה מסודר: התחלת הרקע בקצרה, פירוט הפעולה שלך, וסיום תמיד בתוצאה המדידה (Result).');
  }

  if (fluency >= 80) {
    strengths.push('כושר ביטוי ושטף דיבור מצוינים, ביטחון עצמי גבוה ושימוש במינוחים מקצועיים מדויקים.');
  } else {
    improvements.push('הרחבת התשובות והימנעות ממענה תמציתי מדי; המראיין מחפש לשמוע את דרך החשיבה שלך.');
  }

  if (depthAndImpact >= 80) {
    strengths.push('הצגת אימפקט אישי מובהק ויכולת רפלקציה עצמית על טעויות והפקת לקחים.');
  } else {
    improvements.push('הדגשת החלק האישי שלך בפתרון הבעיה (מה את/ה עשית ולא רק מה הצוות עשה).');
  }

  // Quote or specific insight
  const longestAnswer = [...candidateTurns].sort((a, b) => b.text.length - a.text.length)[0];
  if (longestAnswer && longestAnswer.text.length > 50) {
    strengths.push(`דוגמה יפה מתוך תשובתך: "${longestAnswer.text.slice(0, 75)}..." – שיקפה מעורבות ויוזמה.`);
  }

  const summaryHe = `מועמד/ת הפגין/ה רמת מוכנות טובה מאוד בראיון ההתנהגותי (ציון משוקלל: ${overall}/100). התשובות שיקפו יחסי אנוש מעולים, יכולת התמודדות עם שינויים ולמידה מהירה בסביבת עבודה דינמית.`;

  return {
    overallScore: overall,
    scores: {
      fluency,
      starStructure,
      clarityAndFit,
      depthAndImpact
    },
    summaryHe,
    strengthsHe: strengths,
    improvementsHe: improvements,
    turns
  };
}
