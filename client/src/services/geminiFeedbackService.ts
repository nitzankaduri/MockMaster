/**
 * Gemini AI Comprehensive Interview Evaluation Service
 * Evaluates candidate Hebrew HR & Behavioral interview transcripts using Gemini API
 * with complete STAR methodology breakdown, category scoring, candidate quote analysis,
 * and a robust analytical fallback engine if no API key is provided.
 */

export interface StarMetric {
  score: number; // 0-100
  assessment: string;
  strengths: string;
  recommendation: string;
}

export interface CandidateQuoteAnalysis {
  quote: string;
  analysis: string;
  category: 'STAR' | 'Communication' | 'Leadership' | 'Problem Solving';
}

export interface GeminiFeedbackReport {
  overallScore: number; // 0-100
  fitVerdict: string;
  verdictColor: 'emerald' | 'cyan' | 'amber' | 'rose';
  summary: string;
  starBreakdown: {
    situation: StarMetric;
    task: StarMetric;
    action: StarMetric;
    result: StarMetric;
  };
  categoryScores: {
    fluency: number;           // שטף ביטוי וביטחון
    starMethodology: number;   // מתודולוגיית STAR
    clarityAndFocus: number;   // בהירות ומיקוד
    interpersonal: number;     // יחסי אנוש ועבודת צוות
    problemSolving: number;    // פתרון בעיות ומורכבות
  };
  strengths: string[];
  areasForImprovement: string[];
  candidateQuotes: CandidateQuoteAnalysis[];
  interviewerAdvice: string;
  generatedBy: 'gemini' | 'heuristic_engine';
}

export interface SessionTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  stage?: string;
}

const LOCAL_STORAGE_KEY = 'mockmaster_gemini_key';

/**
 * Retrieves the currently configured Gemini API key (from parameter, localStorage, or env)
 */
export function getGeminiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim()) {
    return explicitKey.trim();
  }
  const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  if (stored && stored.trim()) {
    return stored.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

/**
 * Saves a custom Gemini API key to localStorage
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
}

/**
 * Robust heuristic evaluation engine used as fallback or when no API key is supplied
 */
export function generateHeuristicEvaluation(turns: SessionTurn[]): GeminiFeedbackReport {
  const candidateTurns = turns.filter((t) => t.role === 'candidate');
  const totalTurns = candidateTurns.length;

  if (totalTurns === 0) {
    return {
      overallScore: 65,
      fitVerdict: 'ראיון ראשוני קצר — נדרש המשך תרגול',
      verdictColor: 'amber',
      summary: 'הראיון הסתיים ללא תשובות מלאות מהמועמד. מומלץ לבצע סימולציה מלאה עם מענה לכל שאלות ה-STAR לקבלת משוב מהימן.',
      starBreakdown: {
        situation: {
          score: 60,
          assessment: 'לא סופק רקע מספק עבור שאלות הראיון.',
          strengths: 'נכונות להתנסות בסימולציה',
          recommendation: 'הצג תמיד את הרקע והחברה שבה התרחש המקרה'
        },
        task: {
          score: 60,
          assessment: 'חסרה הגדרת משימה או יעד ברור.',
          strengths: 'הבנת הקשר כללי',
          recommendation: 'הגדר במפורש מה הייתה האחריות האישית שלך'
        },
        action: {
          score: 65,
          assessment: 'לא פורטו הפעולות והצעדים שננקטו.',
          strengths: 'פתיחות לשאלות',
          recommendation: 'פרט לפחות 2-3 צעדים מעשיים שיזמת בעצמך'
        },
        result: {
          score: 60,
          assessment: 'לא הוצגו תוצאות מדידות.',
          strengths: 'פוטנציאל למידה',
          recommendation: 'סיים תמיד בהשפעה (Impact) והלקח המקצועי שהפקת'
        }
      },
      categoryScores: {
        fluency: 70,
        starMethodology: 60,
        clarityAndFocus: 65,
        interpersonal: 68,
        problemSolving: 62
      },
      strengths: ['נכונות להתנסות בסימולציית ראיון בעברית'],
      areasForImprovement: ['להשלים ראיון מלא כולל מענה קולי מפורט בכל שלב'],
      candidateQuotes: [],
      interviewerAdvice: 'קח נשימה עמוקה, דבר בקול ברור ותן לכל שאלה תשובה בת דקה וחצי לפחות במבנה STAR.',
      generatedBy: 'heuristic_engine'
    };
  }

  // Text analysis
  let totalLength = 0;
  let situationHits = 0;
  let taskHits = 0;
  let actionHits = 0;
  let resultHits = 0;

  const sitWords = ['קרה', 'חברה', 'פרויקט', 'עבדתי', 'בעיה', 'אתגר', 'סביבה', 'מצב', 'רקע', 'לקוח', 'צוות', 'מערכת'];
  const taskWords = ['מטרה', 'אחריות', 'יעד', 'תפקידי', 'נדרשתי', 'היה צריך', 'משימה', 'לוח זמנים', 'דדליין', 'אחראי'];
  const actWords = ['עשיתי', 'פיתחתי', 'יצרתי', 'הובלתי', 'פתרתי', 'בניתי', 'החלטתי', 'כתבתי', 'חקרתי', 'בדקתי', 'יזמתי', 'הצעתי', 'דיברתי'];
  const resWords = ['תוצאה', 'הצלחה', 'שיפור', 'למדתי', 'אחוזים', 'חסכנו', 'בסוף', 'הסתיים', 'העלה', 'מדד', 'השלמנו', 'אימפקט', 'עמדנו'];

  const quotes: CandidateQuoteAnalysis[] = [];

  candidateTurns.forEach((turn) => {
    const text = turn.text;
    totalLength += text.length;

    const lower = text.toLowerCase();
    if (sitWords.some((w) => lower.includes(w))) situationHits++;
    if (taskWords.some((w) => lower.includes(w))) taskHits++;
    if (actWords.some((w) => lower.includes(w))) actionHits++;
    if (resWords.some((w) => lower.includes(w))) resultHits++;

    // Extract quote if meaningful length
    if (text.length > 35 && quotes.length < 3) {
      quotes.push({
        quote: text.length > 120 ? text.slice(0, 115) + '...' : text,
        analysis: 'הדגמת חשיבה מעשית וחיבור לסיטואציה אמיתית מהניסיון המקצועי.',
        category: quotes.length === 0 ? 'STAR' : quotes.length === 1 ? 'Problem Solving' : 'Communication'
      });
    }
  });

  const avgLength = Math.round(totalLength / totalTurns);
  const sitScore = Math.min(95, Math.max(65, Math.round(60 + (situationHits / totalTurns) * 35)));
  const taskScore = Math.min(95, Math.max(65, Math.round(60 + (taskHits / totalTurns) * 35)));
  const actScore = Math.min(96, Math.max(70, Math.round(65 + (actionHits / totalTurns) * 30)));
  const resScore = Math.min(94, Math.max(60, Math.round(55 + (resultHits / totalTurns) * 40)));

  const starAvg = Math.round((sitScore + taskScore + actScore + resScore) / 4);
  const fluencyScore = Math.min(95, Math.max(68, Math.round(65 + avgLength / 14)));
  const clarityScore = Math.min(94, Math.max(70, Math.round(starAvg * 0.5 + 45)));
  const interpersonalScore = Math.min(95, Math.max(72, Math.round(70 + (actScore > 80 ? 15 : 8))));
  const problemSolvingScore = Math.min(96, Math.max(68, Math.round((taskScore + actScore) / 2)));

  const overallScore = Math.round(
    fluencyScore * 0.2 + starAvg * 0.35 + interpersonalScore * 0.2 + problemSolvingScore * 0.25
  );

  let fitVerdict = 'עובר עם נקודות לחיזוק – פוטנציאל גבוה';
  let verdictColor: 'emerald' | 'cyan' | 'amber' | 'rose' = 'cyan';

  if (overallScore >= 88) {
    fitVerdict = 'מועמד מוביל (Strong Hire) — מוכן/ה לראיון אמת';
    verdictColor = 'emerald';
  } else if (overallScore >= 78) {
    fitVerdict = 'התאמה טובה מאוד (Hire) — בסיס מקצועי יציב';
    verdictColor = 'cyan';
  } else if (overallScore >= 68) {
    fitVerdict = 'עובר עם נקודות לחיזוק (Lean Hire) — נדרש דיוק ב-STAR';
    verdictColor = 'amber';
  } else {
    fitVerdict = 'נדרש שיפור משמעותי לפני ראיון אמת';
    verdictColor = 'rose';
  }

  const strengths: string[] = [
    'שליטה טובה בחיבור לדוגמאות מעשיות מהניסיון האישי',
    'יכולת ביטוי ברורה ושפה מקצועית רהוטה בעברית',
    'הפגנת מוטיבציה גבוהה ונכונות להתמודד עם אתגרים צוותיים'
  ];

  if (actScore >= 80) {
    strengths.push('הדגשה נכונה של פעולות אישיות (I did) ולא רק עבודה קבוצתית פסיבית.');
  }

  const areasForImprovement: string[] = [
    'הקפדה על כימות תוצאות (Results) – הצג מדדים ברורים (חיסכון בזמן, אחוזי שיפור, שביעות רצון).',
    'מיקוד התשובה: הרקע צריך להיות תמציתי (עד 20% מהזמן), והפעולה והתוצאה עיקר התשובה.',
    'רפלקציה עצמית: הוסף תמיד תובנה או לקח אישי שהפקת מהסיטואציה.'
  ];

  return {
    overallScore,
    fitVerdict,
    verdictColor,
    summary: `המועמד הפגין רמת מוכנות טובה בראיון ההתנהגותי (ציון משוקלל: ${overallScore}/100). התשובות שיקפו יחסי אנוש חיוביים, חשיבה מסודרת ויכולת למידה עצמאית. חיזוק רכיב התוצאה הסופית (Result) והצגת מדדים מדידים יקפיצו את הציון לרמת מצוינות.`,
    starBreakdown: {
      situation: {
        score: sitScore,
        assessment: 'הצגת הרקע והקשר הסיטואציה בצורה טבעית וברורה.',
        strengths: 'הבנה טובה של האקלים הארגוני והפרויקט.',
        recommendation: 'שמור על תיאור תמציתי של הרקע כדי להשאיר זמן לפעולות עצמן.'
      },
      task: {
        score: taskScore,
        assessment: 'הגדרת היעד והאחריות האישית בתוך הפרויקט.',
        strengths: 'הגדרה ברורה של מה שנדרש היה לבצע.',
        recommendation: 'הדגש את מורכבות היעד ואת לוחות הזמנים שעמדו בפניך.'
      },
      action: {
        score: actScore,
        assessment: 'פירוט הצעדים וההחלטות שקיבלת כדי לפתור את הבעיה.',
        strengths: 'יוזמה אישית, חשיבה ביקורתית ותקשורת מול גורמים שונים.',
        recommendation: 'פרט יותר על דילמות מקצועיות שהתעוררו בדרך ואיך הכרעת בהן.'
      },
      result: {
        score: resScore,
        assessment: 'סיכום האימפקט וההשפעה הסופית של המהלך.',
        strengths: 'הצגת סיום חיובי למשימה או הפקת לקחים מכישלון.',
        recommendation: 'חזק תמיד עם מדדים כמותיים: חסכנו X שעות, העלינו זמינות, צמצמנו תקלות.'
      }
    },
    categoryScores: {
      fluency: fluencyScore,
      starMethodology: starAvg,
      clarityAndFocus: clarityScore,
      interpersonal: interpersonalScore,
      problemSolving: problemSolvingScore
    },
    strengths,
    areasForImprovement,
    candidateQuotes: quotes,
    interviewerAdvice: 'בראיון אמת, כששואלים אותך על קונפליקט או כישלון, המראיין מחפש בגרות ויושרה. המשך להשתמש ב-STAR והדגש תמיד מה הייתה תרומתך הייחודית להצלחה.',
    generatedBy: 'heuristic_engine'
  };
}

/**
 * Sends the full interview transcript to Google Gemini API for deep candidate evaluation
 */
export async function evaluateInterviewWithGemini(
  turns: SessionTurn[],
  customApiKey?: string
): Promise<GeminiFeedbackReport> {
  const apiKey = getGeminiApiKey(customApiKey);

  // If no API key configured, use the heuristic engine
  if (!apiKey) {
    console.info('No Gemini API key provided. Using heuristic evaluation engine.');
    return generateHeuristicEvaluation(turns);
  }

  const candidateTurns = turns.filter((t) => t.role === 'candidate');
  if (candidateTurns.length === 0) {
    return generateHeuristicEvaluation(turns);
  }

  // Format transcript cleanly for Gemini
  const formattedTranscript = turns
    .map(
      (t) =>
        `[${t.role === 'candidate' ? 'המועמד' : 'מראיינת HR (רותם)'}] (${t.timestamp}): ${t.text}`
    )
    .join('\n\n');

  const prompt = `אתה מומחה גיוס, מנהל משאבי אנוש בכיר ו-Bar Raiser בחברת הייטק מובילה.
תפקידך לנתח ביסודיות את תמלול ראיון העבודה ההתנהגותי (HR & Behavioral Interview) שנערך בעברית, ולהפיק דוח הערכה מקיף, מעמיק ובונה עבור המועמד.

להלן תמלול הראיון המלא:
---------------------------------------------
${formattedTranscript}
---------------------------------------------

הערך את תשובות המועמד בהתאם למתודולוגיית STAR:
- Situation (הגדרת הרקע וההקשר)
- Task (האתגר והיעד המוגדר)
- Action (הפעולות האישיות, מנהיגות ויוזמה)
- Result (התוצאות המדידות, האימפקט והפקת לקחים)

וכן לפי מדדי איכות:
- שטף ביטוי וביטחון עצמי
- מתודולוגיית STAR
- בהירות ומיקוד ללא סטיות
- יחסי אנוש, עבודת צוות והתמודדות עם קונפליקטים
- פתרון בעיות מורכבות וחשיבה ביקורתית

החזר אך ורק אובייקט JSON תקין ומלא (ללא שום טקסט נוסף לפני או אחרי, ללא מרקדאון של פתיחה וסיום) במבנה הבא בדיוק:
{
  "overallScore": 84,
  "fitVerdict": "מועמד מוביל (Strong Hire) — התאמה גבוהה מאוד לתפקיד",
  "verdictColor": "emerald",
  "summary": "סיכום מנהלים מקצועי בעברית על ביצועי המועמד (3-4 משפטים)",
  "starBreakdown": {
    "situation": {
      "score": 85,
      "assessment": "ניתוח הצגת הרקע והסיטואציה בעברית",
      "strengths": "חוזקה בולטת ברקע",
      "recommendation": "טיפ קונקרטי לשיפור"
    },
    "task": {
      "score": 80,
      "assessment": "ניתוח הצגת היעד והאחריות בעברית",
      "strengths": "חוזקה בולטת ביעד",
      "recommendation": "טיפ קונקרטי לשיפור"
    },
    "action": {
      "score": 90,
      "assessment": "ניתוח הפעולות האישיות שננקטו בעברית",
      "strengths": "חוזקה בולטת בפעולה",
      "recommendation": "טיפ קונקרטי לשיפור"
    },
    "result": {
      "score": 75,
      "assessment": "ניתוח התוצאות, האימפקט והלקחים בעברית",
      "strengths": "חוזקה בולטת בתוצאה",
      "recommendation": "טיפ קונקרטי לשיפור"
    }
  },
  "categoryScores": {
    "fluency": 88,
    "starMethodology": 82,
    "clarityAndFocus": 85,
    "interpersonal": 86,
    "problemSolving": 84
  },
  "strengths": [
    "חוזקה ראשונה עם התייחסות למה שאמר המועמד",
    "חוזקה שנייה ספציפית",
    "חוזקה שלישית ספציפית"
  ],
  "areasForImprovement": [
    "המלצה מעשית ראשונה לשיפור",
    "המלצה מעשית שנייה לשיפור",
    "המלצה מעשית שלישית לשיפור"
  ],
  "candidateQuotes": [
    {
      "quote": "ציטוט אמיתי מדויק מתוך דברי המועמד בתמלול",
      "analysis": "ניתוח מקצועי קצר מה הציטוט הזה מעיד על המועמד",
      "category": "STAR"
    },
    {
      "quote": "ציטוט נוסף מדברי המועמד",
      "analysis": "ניתוח מקצועי קצר",
      "category": "Leadership"
    }
  ],
  "interviewerAdvice": "עצה אסטרטגית ומעצימה של מנהל הגיוס לקראת ראיונות אמת עתידיים",
  "generatedBy": "gemini"
}

הערות חשובות:
1. ודא שהצבע verdictColor הוא אחד מ: "emerald" (לציון 85+), "cyan" (לציון 75-84), "amber" (לציון 65-74), או "rose" (לציון מתחת ל-65).
2. ודא שהציטוטים מתוך candidateQuotes לקוחים בפועל מתוך דברי המועמד בתמלול.
3. כתוב בעברית מקצועית, מכבדת ומעצימה.`;

  // Try gemini-1.5-flash then gemini-2.0-flash
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
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
              temperature: 0.3,
              response_mime_type: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`Gemini API error on model ${model} (${response.status}):`, errorBody);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.warn(`Gemini model ${model} returned empty response`);
        continue;
      }

      // Clean possible markdown code fences if model enclosed in ```json ... ```
      let cleanedJson = rawText.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(cleanedJson) as GeminiFeedbackReport;
      parsed.generatedBy = 'gemini';

      // Validate core required fields
      if (
        typeof parsed.overallScore === 'number' &&
        parsed.starBreakdown &&
        parsed.categoryScores
      ) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Failed to generate Gemini evaluation with model ${model}:`, err);
    }
  }

  // Graceful fallback to heuristic engine if Gemini call failed
  console.info('Falling back to heuristic evaluation engine after Gemini API failure.');
  return generateHeuristicEvaluation(turns);
}
