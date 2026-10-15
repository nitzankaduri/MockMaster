/**
 * Gemini-Powered Interview Critique & Report Evaluation Service
 * Evaluates candidate Hebrew HR & Behavioral interview transcripts using Gemini API
 * producing rigorous critique, STAR coverage verification, quoted strengths/weaknesses, and concrete tips.
 */

import { getGeminiApiKey } from './geminiVoiceService';

export interface Turn {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
}

export interface GeminiCritiqueReport {
  overallScore: number;
  hiringVerdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
  executiveSummary: string;
  criteriaScores: {
    communication: number;
    starMethodology: number;
    problemSolving: number;
    authenticity: number;
  };
  starAnalysis: {
    situationCovered: boolean;
    taskDefined: boolean;
    actionExplained: boolean;
    resultsQuantified: boolean;
    verdict: string;
  };
  strongAnswers: Array<{
    quote: string;
    analysis: string;
  }>;
  weakAnswers: Array<{
    quote: string;
    critique: string;
  }>;
  concreteTips: string[];
  source: 'gemini' | 'heuristic_engine';
}

/**
 * Heuristic fallback evaluation engine when offline or no API key is set
 */
export function generateHeuristicCritique(
  turns: Turn[],
  targetRole?: string
): GeminiCritiqueReport {
  const candidateTurns = turns.filter((t) => t.speaker === 'candidate');
  const count = candidateTurns.length;
  const roleName = targetRole?.trim() || 'מקצועי בהייטק';

  if (count === 0) {
    return {
      overallScore: 65,
      hiringVerdict: 'Lean Hire',
      executiveSummary: `הראיון לתפקיד ${roleName} הסתיים מוקדם ללא מענה מספק על שאלות הראיון. מומלץ לבצע סימולציה מלאה בעברית.`,
      criteriaScores: {
        communication: 70,
        starMethodology: 60,
        problemSolving: 65,
        authenticity: 75
      },
      starAnalysis: {
        situationCovered: false,
        taskDefined: false,
        actionExplained: false,
        resultsQuantified: false,
        verdict: 'לא נמסרו מספיק תשובות לצורך ניתוח מתודולוגיית STAR מלאה.'
      },
      strongAnswers: [],
      weakAnswers: [],
      concreteTips: [
        'השלם סימולציית ראיון מלאה ומענה קולי על כל שאלות ה-STAR.',
        'הקפד על תשובה בת דקה וחצי לפחות לכל שאלה עם רקע, משימה, פעולה ותוצאה.'
      ],
      source: 'heuristic_engine'
    };
  }

  // Detect STAR elements
  const sitKeywords = ['קרה', 'חברה', 'פרויקט', 'עבדתי', 'בעיה', 'אתגר', 'סביבה', 'מצב', 'רקע', 'לקוח', 'צוות', 'מערכת'];
  const taskKeywords = ['מטרה', 'אחריות', 'יעד', 'תפקידי', 'נדרשתי', 'היה צריך', 'משימה', 'לוח זמנים', 'דדליין', 'אחראי'];
  const actKeywords = ['עשיתי', 'פיתחתי', 'יצרתי', 'הובלתי', 'פתרתי', 'בניתי', 'החלטתי', 'כתבתי', 'חקרתי', 'בדקתי', 'יזמתי', 'הצעתי', 'דיברתי'];
  const resKeywords = ['תוצאה', 'הצלחה', 'שיפור', 'למדתי', 'אחוזים', 'חסכנו', 'בסוף', 'הסתיים', 'העלה', 'מדד', 'השלמנו', 'אימפקט', 'עמדנו'];

  let sitCount = 0;
  let taskCount = 0;
  let actCount = 0;
  let resCount = 0;
  let totalWords = 0;

  const strongAnswers: Array<{ quote: string; analysis: string }> = [];
  const weakAnswers: Array<{ quote: string; critique: string }> = [];

  candidateTurns.forEach((turn) => {
    const text = turn.text;
    const lower = text.toLowerCase();
    const words = text.trim().split(/\s+/).length;
    totalWords += words;

    const hasSit = sitKeywords.some((k) => lower.includes(k));
    const hasTask = taskKeywords.some((k) => lower.includes(k));
    const hasAct = actKeywords.some((k) => lower.includes(k));
    const hasRes = resKeywords.some((k) => lower.includes(k));

    if (hasSit) sitCount++;
    if (hasTask) taskCount++;
    if (hasAct) actCount++;
    if (hasRes) resCount++;

    if ((words >= 15 || hasAct || hasRes) && strongAnswers.length < 2) {
      strongAnswers.push({
        quote: text.length > 110 ? text.slice(0, 105) + '...' : text,
        analysis: `התייחסות מעשית וממוקדת לדרישות תפקיד ה-${roleName}, תוך שילוב דוגמה מוחשית והצגת דרך חשיבה מקצועית.`
      });
    } else if (weakAnswers.length < 2) {
      weakAnswers.push({
        quote: text.length > 90 ? text.slice(0, 85) + '...' : text,
        critique: `תשובה זו לתפקיד ${roleName} יכולה להיות עמוקה יותר: מומלץ לפרט את הרקע (Situation), את חלקך האישי בפעולה (Action), ולסכם בתוצאה המדידה (Result).`
      });
    }
  });

  // If candidate answered but strongAnswers is empty, pick the longest response
  if (strongAnswers.length === 0 && candidateTurns.length > 0) {
    const best = [...candidateTurns].sort((a, b) => b.text.length - a.text.length)[0];
    strongAnswers.push({
      quote: best.text.length > 110 ? best.text.slice(0, 105) + '...' : best.text,
      analysis: `מענה כן וענייני המעיד על מוטיבציה ונכונות להתמודד עם אתגרי תפקיד ה-${roleName}.`
    });
  }

  const situationCovered = sitCount > 0;
  const taskDefined = taskCount > 0;
  const actionExplained = actCount > 0;
  const resultsQuantified = resCount > 0;

  const avgWords = Math.round(totalWords / count);
  const commScore = Math.min(95, Math.max(68, Math.round(65 + avgWords / 3)));
  const starScore = Math.min(96, Math.max(60, Math.round(55 + (sitCount + taskCount + actCount + resCount) * 7)));
  const probScore = Math.min(95, Math.max(70, Math.round(68 + actCount * 7)));
  const authScore = Math.min(96, Math.max(75, Math.round(74 + (avgWords > 20 ? 15 : 6))));

  const overallScore = Math.round(commScore * 0.25 + starScore * 0.35 + probScore * 0.25 + authScore * 0.15);

  let hiringVerdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire' = 'Hire';
  if (overallScore >= 88) hiringVerdict = 'Strong Hire';
  else if (overallScore >= 78) hiringVerdict = 'Hire';
  else if (overallScore >= 68) hiringVerdict = 'Lean Hire';
  else hiringVerdict = 'No Hire';

  let starVerdict = 'המועמד הציג היטב את תפקידו ואת הפעולות שנקט, אך נדרש חיזוק בהבאת נתונים כמותיים לתוצאה שהושגה (Result).';
  if (situationCovered && taskDefined && actionExplained && resultsQuantified) {
    starVerdict = 'מענה מלא ומצטיין לפי כל ארבעת שלבי מתודולוגיית STAR, כולל הצגת רקע, משימה, פעולות ותוצאות מדידות.';
  } else if (!resultsQuantified) {
    starVerdict = 'המועמד תיאר היטב את הסיטואציה והמשימה, אך לא כימת את התוצאות הסופיות (Results) באחוזים או מדדים עסקיים.';
  }

  const concreteTips = [
    `הקפד לסיים כל תשובה בראיון ל-${roleName} בתוצאה המדידה (Result): כמה זמן נחסך, בכמה אחוזים שופרו הביצועים, או מה היה המשוב הישיר.`,
    'הדגש את החלק האישי שלך ("אני עשיתי", "אני הובלתי") לצד שיתוף הפעולה עם חברי הצוות.',
    'שמור על חלוקת זמנים מאוזנת: 20% רקע, 60% פעולה ופתרון, ו-20% תוצאה ורפלקציה.'
  ];

  const firstCandidateAnswer = candidateTurns[0]?.text || '';
  const snippet = firstCandidateAnswer.length > 50 ? firstCandidateAnswer.slice(0, 48) + '...' : firstCandidateAnswer;

  return {
    overallScore,
    hiringVerdict,
    executiveSummary: `בסימולציית הראיון לתפקיד ${roleName}, המועמד הפגין נכונות ותקשורת חיובית (ציון משוקלל: ${overallScore}/100, החלטה: ${hiringVerdict}). בתשובות (כגון: "${snippet}") ניכר חיבור מקצועי לתחום. חידוד מתודולוגיית STAR והדגשת תוצאות כמותיות (Results) ישדרגו משמעותית את סיכויי הקבלה.`,
    criteriaScores: {
      communication: commScore,
      starMethodology: starScore,
      problemSolving: probScore,
      authenticity: authScore
    },
    starAnalysis: {
      situationCovered,
      taskDefined,
      actionExplained,
      resultsQuantified,
      verdict: starVerdict
    },
    strongAnswers,
    weakAnswers,
    concreteTips,
    source: 'heuristic_engine'
  };
}

/**
 * Sends the compiled interview transcript to Gemini for deep HR & Behavioral evaluation
 */
export async function evaluateInterviewWithGemini(
  turns: Turn[],
  customApiKey?: string,
  targetRole?: string
): Promise<GeminiCritiqueReport> {
  const apiKey = getGeminiApiKey(customApiKey);
  const roleName = targetRole?.trim() || 'מקצועי בהייטק';

  // If no API key is available, use heuristic critique
  if (!apiKey) {
    console.info('No Gemini API key supplied. Using heuristic evaluation engine.');
    return generateHeuristicCritique(turns, roleName);
  }

  const candidateTurns = turns.filter((t) => t.speaker === 'candidate');
  if (candidateTurns.length === 0) {
    return generateHeuristicCritique(turns, roleName);
  }

  // Format transcript cleanly
  const formattedTranscript = turns
    .map((t) => `[${t.speaker === 'candidate' ? 'המועמד/ת' : 'רותם (מראיינת HR)'}] (${t.timestamp}): ${t.text}`)
    .join('\n\n');

  const systemDirective = `You are an expert HR Director, VP of People, and Senior Tech Recruiter.
Analyze the candidate's actual spoken responses from the interview transcript with genuine depth, constructive critique, and actionable feedback.
Target Role: "${roleName}".

Your evaluation must be grounded 100% in what the candidate ACTUALLY said in their answers:
1. "overallScore": Realistic score (1-100) reflecting their real depth, clarity, relevance to "${roleName}", and communication.
2. "hiringVerdict": One of "Strong Hire" (88+), "Hire" (78-87), "Lean Hire" (65-77), "No Hire" (<65).
3. "executiveSummary": A detailed, insightful 2-4 sentence professional summary in fluent Hebrew analyzing the candidate's actual answers, communication style, technical confidence, and suitability for the "${roleName}" position.
4. "criteriaScores": { "communication": number, "starMethodology": number, "problemSolving": number, "authenticity": number }.
5. "starAnalysis": { "situationCovered": boolean, "taskDefined": boolean, "actionExplained": boolean, "resultsQuantified": boolean, "verdict": "Detailed Hebrew feedback on their STAR structure" }.
6. "strongAnswers": Array of objects: { "quote": "EXACT quote from the candidate's speech", "analysis": "Why this specific answer or point was effective in Hebrew" }. (Provide 1-3 based on what they said).
7. "weakAnswers": Array of objects: { "quote": "EXACT quote of a brief, vague, or improvable answer", "critique": "Constructive Hebrew explanation of what was missing and how to elevate it" }. (Provide 1-2 if applicable).
8. "concreteTips": Array of 3-4 highly specific, tailored actionable tips in Hebrew for the candidate to ace their next real interview as a "${roleName}".

Strict JSON Output Schema (respond ONLY with valid JSON):
{
  "overallScore": 82,
  "hiringVerdict": "Hire",
  "executiveSummary": "פסקת סיכום מקצועית ומנומקת בעברית על איכות התשובות, הביטחון וההתאמה לתפקיד ${roleName}...",
  "criteriaScores": {
    "communication": 85,
    "starMethodology": 75,
    "problemSolving": 80,
    "authenticity": 88
  },
  "starAnalysis": {
    "situationCovered": true,
    "taskDefined": true,
    "actionExplained": true,
    "resultsQuantified": false,
    "verdict": "המועמד הציג היטב את תפקידו אך התקשה בהבאת נתונים כמותיים לתוצאה שהושגה."
  },
  "strongAnswers": [
    { "quote": "ציטוט אמיתי מהראיון", "analysis": "הסבר מדוע התשובה הזו מעולה" }
  ],
  "weakAnswers": [
    { "quote": "ציטוט של תשובה עמומה או חלשה", "critique": "הסבר מה היה חסר ואיך לשפר" }
  ],
  "concreteTips": [
    "טיפ מעשי ראשון לראיון הבא",
    "טיפ מעשי שני"
  ]
}

Instructions:
1. hiringVerdict must be one of: "Strong Hire", "Hire", "Lean Hire", "No Hire".
2. Quotes in strongAnswers and weakAnswers MUST be exact excerpts from the candidate's actual answers in the transcript.
3. Write all text fields in fluent, professional, constructive Hebrew.`;

  const prompt = `${systemDirective}\n\nתמלול הראיון המלא לתפקיד ${roleName}:\n-------------------------------------\n${formattedTranscript}\n-------------------------------------`;

  const models = [
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
    'gemini-flash-latest'
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              response_mime_type: 'application/json'
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini evaluation error on ${model} (${response.status}):`, errText);
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(cleaned) as GeminiCritiqueReport;
      parsed.source = 'gemini';

      if (typeof parsed.overallScore === 'number' && parsed.criteriaScores && parsed.starAnalysis) {
        return parsed;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Evaluation attempt failed on ${model}:`, err);
    }
  }

  // Graceful fallback to heuristic critique
  console.info('Falling back to heuristic critique evaluation engine.');
  return generateHeuristicCritique(turns, roleName);
}
