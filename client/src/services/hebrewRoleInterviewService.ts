/**
 * Dynamic Role-Based Hebrew Interview Service
 * Generates tailored questions, conversational turns, and STAR inquiries specifically
 * aligned with any tech job title (e.g. Full Stack, DevOps, Frontend, Product Manager, Cyber, or any custom role typed by candidate).
 */

import { getGeminiApiKey } from './geminiVoiceService';
import type { Turn } from './geminiEvaluationService';

export type SessionStage = 'intro' | 'behavioral' | 'challenge' | 'wrapup' | 'completed';

/**
 * Returns a warm, professional Hebrew opening greeting tailored to the candidate's chosen role.
 */
export function getRoleIntroPrompt(targetRole: string): string {
  const role = targetRole.trim() || 'Software Engineer';
  return `שלום וברוך הבא לראיון העבודה לתפקיד ${role} במוק מאסטר! שמי רותם, מנהלת גיוס והשמה טכנולוגית. המטרה שלנו היום היא להכיר את הרקע המקצועי שלך, את סגנון החשיבה ואת דרך ההתמודדות שלך עם אתגרים. לפני שנצלול לתרחישים מעשיים, אשמח שתספר לי קצת על עצמך, על הניסיון שלך כ-${role}, ומה מביא אותך להתעניין בתפקיד הזה אצלנו?`;
}

/**
 * Role-aware fallback prompts ensuring instant, high-quality responses even if offline or network delays occur.
 */
export function getRoleFallbackPrompt(targetRole: string, stage: SessionStage): string {
  const r = (targetRole || '').toLowerCase();

  // 1. DevOps / SRE / Cloud
  if (r.includes('devops') || r.includes('sre') || r.includes('cloud') || r.includes('ענן') || r.includes('תשתיות')) {
    switch (stage) {
      case 'behavioral':
        return `תודה על השיתוף המעניין! בוא נעבור להתמודדות מעשית בתשתיות ועבודת צוות: תאר לי מקרה שבו התרחשה תקלת פרודקשן קריטית או השבתה של ה-CI/CD, תחת לחץ זמנים כבד מצוותי הפיתוח וההנהלה. מה בדיוק היה המצב, אילו צעדים נקטת לייצוב התשתית, וכיצד ניהלת את התקשורת?`;
      case 'challenge':
        return `עכשיו אשמח לשמוע על התמודדות עם כישלון או מורכבות תשתיתית: ספר על מיגרציה לענן, שדרוג קוברנטיס או תהליך אוטומציה שלא התפתח כמתוכנן או יצר נזק. מה היה החלק האישי שלך בלקיחת האחריות, ומה שיניתם בתהליכי הבקרה בעקבות כך?`;
      case 'wrapup':
        return `תודה רבה על התובנות המקצועיות! הגענו לשלב השאלות שלך: האם יש לך שאלות אליי בנוגע לתשתיות הענן, סביבות העבודה, או התרבות ההנדסית בצוות ה-DevOps אצלנו?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מעמיק ומקצועי לתפקיד ${targetRole}! נהניתי מאוד להכיר אותך. נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב של Gemini AI.`;
    }
  }

  // 2. Frontend / UI / React / Web
  if (r.includes('front') || r.includes('react') || r.includes('vue') || r.includes('web') || r.includes('ui') || r.includes('פרונט')) {
    switch (stage) {
      case 'behavioral':
        return `תודה על השיתוף! בוא נעבור לעבודת ממשק וצוות: ספר לי על סיטואציה שבה היה חוסר הסכמה או מתח מקצועי מול צוות ה-Product או ה-Design בנוגע לביצועי המערכת (Performance) אל מול דרישות ויזואליות עשירות. איך הצגת את הטיעונים הטכניים שלך, איזה פתרון מצאתם, ומה הייתה התוצאה?`;
      case 'challenge':
        return `עכשיו נדבר על מורכבות ואי-ודאות בצד הלקוח: ספר על באג חמקמק או משבר ביצועים (כגון זליגת זיכרון, רנדורים מיותרים או בעיית תאימות) שהשפיע ישירות על משתמשים. מה הוביל לכך, איך איתרת את שורש התקלה, ומה למדת מזה?`;
      case 'wrapup':
        return `תודה רבה על התשובה המפורטת! הגענו לחלק שלך: אילו שאלות תרצה לשאול אותי לגבי ארכיטקטורת ה-Frontend, ה-Design System, או תהליכי הפיתוח אצלנו?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מצוין ומעשיר לתפקיד ${targetRole}! נהניתי מאוד להכיר אותך. נעבור כעת לדוח המשוב המפורט של Gemini AI.`;
    }
  }

  // 3. Backend / Server / Databases / Distributed
  if (r.includes('back') || r.includes('server') || r.includes('שרת') || r.includes('בסיסי נתונים') || r.includes('microservice')) {
    switch (stage) {
      case 'behavioral':
        return `תודה על הרקע המפורט! בוא נעבור לתרחיש התנהגותי מעולם ה-Backend: תאר מקרה שבו נתקלת בצוואר בקבוק חמור בביצועים, בעיה ב-Concurrency או בקריסת בסיס נתונים. מה בדיוק קרה, כיצד אבחנת את שורש הבעיה, ואיך שיתפת פעולה עם עמיתים כדי להגיע לפתרון יציב?`;
      case 'challenge':
        return `אשמח לשמוע על אתגר מורכב או החלטה ארכיטקטונית שהתבררה כבעייתית: ספר על משימה שבה תכנון שרת או מודל נתונים שיצרת יצר חוב טכנולוגי (Tech Debt) או לא עמד בעומסים. איך התמודדת עם המשבר ומה היה הלקח העיקרי?`;
      case 'wrapup':
        return `תודה על הדוגמאות המקצועיות! הגענו לשלב השאלות שלך: האם יש לך שאלות אליי לגבי ארכיטקטורת ה-Backend, מערכות הנתונים, ה-Scale או האתגרים הטכנולוגיים של החברה?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מעמיק לתפקיד ${targetRole}! נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב המקיף של Gemini AI.`;
    }
  }

  // 4. Product Manager / PM / מוצר
  if (r.includes('product') || r.includes('מוצר') || r.includes('pm')) {
    switch (stage) {
      case 'behavioral':
        return `תודה רבה! בוא נעבור לעבודת צוות וניהול ממשקים: ספר על סיטואציה שבה נאלצת להחליט על ביטול או דחייה של פיצ'ר שבעלי עניין מרכזיים או לקוח גדול מאוד רצו, עקב מגבלות פיתוח או יעדי מוצר אסטרטגיים. איך ניהלת את הקונפליקט ורתמת את כולם להחלטה?`;
      case 'challenge':
        return `עכשיו אשמח לשמוע על התמודדות עם כישלון במוצר: ספר על פיצ'ר או מוצר שהובלת והשקת, אך הוא לא השיג את ה-KPIs או את אימוץ המשתמשים שציפיתם לו. מה היה הניתוח שלך לאחר ההשקה, וכיצד התאוששת מזה?`;
      case 'wrapup':
        return `תודה על הכנות והתובנות החשובות! כעת הבמה שלך: אילו שאלות יש לך אליי לגבי חזון המוצר, מפת הדרכים (Roadmap) או התרבות הארגונית?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מרתק ומקצועי לתפקיד ${targetRole}! נעבור כעת לדוח המשוב המפורט של Gemini AI.`;
    }
  }

  // 5. QA / Automation / בדיקות
  if (r.includes('qa') || r.includes('test') || r.includes('automation') || r.includes('בדיקות') || r.includes('אוטומציה')) {
    switch (stage) {
      case 'behavioral':
        return `תודה על השיתוף! בוא נעבור לתרחיש בקרת איכות ועבודת צוות: ספר על מקרה שבו זיהית באג קריטי רגע לפני שחרור גרסה ל-Production, והיה לחץ כבד מצוותי הפיתוח וההנהלה לשחרר בכל זאת. איך פעלת, כיצד נימקת את עמדתך, ומה הייתה התוצאה?`;
      case 'challenge':
        return `ספר על מקרה שבו בדיקה אוטומטית או תהליך QA פספס תקלה חמורה שהגיעה ישירות למשתמשי הקצה. מה קרה שם, מה היה החלק שלך בתחקיר (Post-Mortem), ואיזה שינוי הובלת בתשתיות הבדיקה כדי שזה לא יחזור?`;
      case 'wrapup':
        return `תודה על התשובות המפורטות! הגענו לשלב השאלות שלך: האם יש לך שאלות אליי לגבי תהליכי האיכות, כלי האוטומציה או שילוב ה-QA בצוותי הפיתוח?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מעמיק לתפקיד ${targetRole}! נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב של Gemini AI.`;
    }
  }

  // 6. Data / AI / Data Science / Machine Learning
  if (r.includes('data') || r.includes('ai') || r.includes('נתונים') || r.includes('ml') || r.includes('machine learning')) {
    switch (stage) {
      case 'behavioral':
        return `תודה רבה! בוא נעבור לעבודת צוות והובלת מחקר: תאר סיטואציה שבה נדרשת לגשר על פער בין תוצאות מחקריות או מודל שפיתחת לבין היכולת של צוותי ההנדסה להטמיע אותו ב-Production. כיצד התמודדת עם הפער המקצועי ואיך הגעתם להסכמה?`;
      case 'challenge':
        return `ספר על פרויקט שבו איכות הנתונים (Data Quality) או ביצועי המודל התבררו כבעייתיים מאוד בעולם האמיתי (Data Drift / Model Hallucination). מה היה הצעד שלך לאבחון הבעיה ומה למדת מזה לפרויקטים הבאים?`;
      case 'wrapup':
        return `תודה רבה על התובנות המדעיות והפרקטיות! כעת הבמה שלך: אילו שאלות יש לך אליי לגבי תשתיות ה-Data, כלי המחקר או האתגרים העסקיים אצלנו?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון עשיר ומעמיק לתפקיד ${targetRole}! נעבור כעת לסיכום ולדוח המשוב של Gemini AI.`;
    }
  }

  // 7. Cyber Security / אבטחת מידע
  if (r.includes('cyber') || r.includes('security') || r.includes('סייבר') || r.includes('אבטחה')) {
    switch (stage) {
      case 'behavioral':
        return `תודה על השיתוף! בוא נעבור להתמודדות באבטחת מידע מול ממשקים בארגון: ספר על מקרה שבו נאלצת לעצור שחרור פיצ'ר או לחייב שינוי ארכיטקטוני רחב עקב חולשת אבטחה, ופגשת התנגדות מצוותי הפיתוח שרצו לעמוד בלוחות זמנים. איך ניהלת את המשבר ואיך שכנעת אותם?`;
      case 'challenge':
        return `ספר על אירוע אבטחה מורכב (Security Incident) או תקיפה שחקרת תחת אי-ודאות ולחץ כבד. מה היו הפעולות המיידיות שנקטת להכלת האירוע, ומה למדת על תוכנית התגובה הארגונית?`;
      case 'wrapup':
        return `תודה על הניתוח המקצועי! הגענו לשאלות שלך: האם יש לך שאלות אליי לגבי ארכיטקטורת האבטחה, מתודולוגיות העבודה או צוות ה-Security אצלנו?`;
      case 'completed':
      default:
        return `תודה רבה על ראיון מקצועי ומרתק לתפקיד ${targetRole}! נעבור כעת לדוח המשוב המפורט של Gemini AI.`;
    }
  }

  // 8. General / Full Stack / Default Tech Role
  const roleName = targetRole.trim() || 'Software Engineer';
  switch (stage) {
    case 'behavioral':
      return `תודה על השיתוף! בוא נעבור להתמודדות בתוך צוות בתפקיד ${roleName}: תאר לי סיטואציה שבה היית בחוסר הסכמה מקצועי או טכנולוגי עם חבר צוות או מנהל ישיר. מה היה שורש המחלוקת, איך ניגשת לפתור את זה לפי שלבי ה-STAR, ומה הייתה התוצאה הסופית?`;
    case 'challenge':
      return `עכשיו אשמח לשמוע על התמודדות עם מורכבות, לחץ ואי-ודאות כ-${roleName}: ספר על פרויקט או משימה שלא התפתחו כמתוכנן, או אפילו נכשלו. מה קרה, מה היה החלק האישי שלך בלקיחת האחריות, ומה למדת מזה להמשך דרכך?`;
    case 'wrapup':
      return `תודה רבה על השיתוף המעמיק! הגענו לשלב השאלות שלך: האם יש לך שאלות אליי לגבי תפקיד ה-${roleName}, הצוות, הטכנולוגיות או החברה?`;
    case 'completed':
    default:
      return `תודה רבה על ראיון מעשיר, מעמיק ופתוח לתפקיד ${roleName}! נהניתי מאוד להכיר אותך. נסכם כעת את תוצאות המפגש ונעבור לדוח המשוב המפורט של Gemini AI.`;
  }
}

interface GenerateRoleTurnParams {
  targetRole: string;
  nextStage: SessionStage;
  candidateAnswer: string;
  history?: Turn[];
  customApiKey?: string;
}

/**
 * Dynamically generates a role-tailored Hebrew interview turn using Gemini API.
 * Takes the candidate's last answer into account, acknowledges it naturally,
 * and asks the next stage question tailored to the exact role.
 */
export async function generateDynamicRoleTurnWithGemini({
  targetRole,
  nextStage,
  candidateAnswer,
  history = [],
  customApiKey
}: GenerateRoleTurnParams): Promise<string> {
  const fallback = getRoleFallbackPrompt(targetRole, nextStage);
  const apiKey = getGeminiApiKey(customApiKey);

  if (!apiKey || !candidateAnswer.trim()) {
    return fallback;
  }

  if (nextStage === 'completed') {
    return fallback;
  }

  // Construct context prompt for Gemini
  const role = targetRole.trim() || 'Software Engineer';
  const recentHistory = history
    .slice(-4)
    .map((t) => `${t.speaker === 'candidate' ? 'המועמד' : 'רותם (HR)'}: ${t.text}`)
    .join('\n');

  const stageDescriptions: Record<SessionStage, string> = {
    intro: 'שלב היכרות ראשוני',
    behavioral:
      'שלב ראיון התנהגותי (STAR: Situation, Task, Action, Result) בנושא עבודת צוות, קונפליקט מקצועי או פתרון מחלוקת הנדסית',
    challenge:
      'שלב התמודדות עם כישלון, מורכבות טכנולוגית גבוהה, לחץ זמנים כבד או משבר מקצועי',
    wrapup: 'שלב שאלות המועמד למראיינת וסיכום הראיון',
    completed: 'סיום הראיון'
  };

  const systemInstruction = `את רותם, מנהלת גיוס והשמה טכנולוגית בכירה ב-MockMaster.
את מראיינת מועמד בעברית לתפקיד: "${role}".
עליך לנהל את הראיון בקול נעים, מקצועי, חד ואמפתי.

השלב הנוכחי בראיון: ${stageDescriptions[nextStage] || nextStage}.

הנחיות קריטיות:
1. התייחסי בתמצות ובטבעיות לתשובה האחרונה שהמועמד מסר (משפט אחד המראה הקשבה אמיתית).
2. שאלי שאלה אחת ממוקדת ומעמיקה לשלב זה, המותאמת ספציפית לתפקיד "${role}" ולתרחישים מהעולם האמיתי (מתודולוגיית STAR).
3. הקפידי על שפה עברית טבעית, שוטפת ומדוברת המתאימה לפלט קולי (טקסט-לדיבור), ללא קיצורים מוזרים.
4. אורך התגובה כולה: 2 עד 4 משפטים בלבד! אין להוסיף כותרות, כוכביות Markdown, או טקסטים מקדימים.`;

  const userPrompt = `הקשר השיחה האחרון:
${recentHistory}

תשובת המועמד האחרונה:
"${candidateAnswer}"

נסחי כעת את התגובה והשאלה הבאה של רותם לשלב: ${nextStage}. החזירי אך ורק את המשפטים שרותם אומרת.`;

  // Candidate models that return 200 reliably
  const models = [
    'gemini-flash-latest',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-lite-latest'
  ];

  // 4 second timeout for quick voice dialogue turnaround
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 4200);

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 250
            }
          }),
          signal: abortController.signal
        }
      );

      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText && rawText.trim().length > 20) {
        clearTimeout(timeoutId);
        // Clean markdown bolding/italics for TTS
        const clean = rawText
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/^[-\s]+/, '')
          .trim();
        return clean;
      }
    } catch {
      // Continue to next model or fallback
    }
  }

  clearTimeout(timeoutId);
  return fallback;
}
