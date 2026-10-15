/**
 * Gemini-Powered Intelligent LeetCode Coding Interviewer & Mentor Service (Hebrew Tech Edition)
 * Acts as an empathetic, Socratic, technical interview guide speaking exclusively in fluent Hebrew.
 *
 * It reads:
 * 1. The exact LeetCode problem (Title, Category, Constraints, Examples, Hints, Complexities in Hebrew)
 * 2. The candidate's live code in the Monaco Editor & selected language
 * 3. The full conversation history
 * 4. Runtime errors, test case results, and tracebacks
 */

import { getGeminiApiKey } from './geminiVoiceService';
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

export interface LeetCodeAgentOutput {
  text: string;
  caption: string;
  mood: InterviewMood;
  nextState?: InterviewState;
}

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

/**
 * Builds the system instructions for the AI Interviewer persona in Hebrew.
 */
function buildSystemInstruction(persona: PersonaType, problem: CodingProblem): string {
  const personaBio =
    persona === 'mentor'
      ? `את שרה חן (Sarah Chen), מהנדסת תוכנה בכירה (Staff Software Engineer) בצוות הליבה של MockMaster.
את מראיינת טכנית מנוסה ומנטורית ישראלית מובילה בהייטק. הסגנון שלך: חם, אמפתי, מעודד, סוקרטי ובגובה העיניים.
המטרה שלך היא להנחות את המועמד/ת, לפתח את האינטואיציה האלגוריתמית שלהם, להרגיע כשהם מרגישים שקשה, ולפרק את הבעיה צעד-אחר-צעד מבלי לפלוט את הפתרון המלא בבת אחת.`
      : `אתה מרקוס ואנס (Marcus Vance), ארכיטקט מערכות ראשי (Principal Systems Architect) ו-Bar Raiser בחברות Tier-1 / FAANG.
אתה חד, ישיר, פורמלי, אנליטי ודורש מצוינות ללא פשרות. מעניין אותך ניתוח מעמיק של מקרי קצה, הוכחות סיבוכיות זמן ומקום (Big-O), וכתיבת קוד יעיל ותקין תחת לחץ. אתה מדבר בעברית עניינית, חדה ומקצועית.`;

  return `${personaBio}

חוקי שפה מחייבים (CRITICAL LANGUAGE MANDATE):
1. עליך לתקשר **אך ורק בעברית שוטפת, טבעית ומקצועית של עולם ההייטק הישראלי**!
2. לעולם אל תענה באנגלית (למעט מונחי קוד טכניים באנגלית כגון שמות פונקציות, שמות משתנים, Big-O כמו O(N), Hash Map, Stack וכדומה).
3. כל ההסברים, הרמזים, השאלות וההערות חייבים להיכתב בעברית!

הקשר משימת הליטקוד הנוכחית:
- בעיה: "${problem.title}" (רמת קושי: ${problem.difficulty} - קטגוריה: ${problem.category})
- אחוז מעבר: ${problem.acceptanceRate}
- יעד סיבוכיות זמן: ${problem.optimalTimeComplexity}
- יעד סיבוכיות זיכרון: ${problem.optimalSpaceComplexity}
- תיאור הבעיה:
${problem.description}

- אילוצים ותנאי גבול:
${problem.constraints.map(c => `  * ${c}`).join('\n')}

- דוגמאות:
${problem.examples.map(ex => `  * קלט: ${ex.input} | פלט: ${ex.output}${ex.explanation ? ` (הסבר: ${ex.explanation})` : ''}`).join('\n')}

- רמזים סוקרטיים הדרגתיים:
${problem.hints.map((h, i) => `  ${i + 1}. ${h}`).join('\n')}

עקרונות ההנחיה והראיון (INTERVIEWING GUIDELINES):
1. הדרכה סוקרטית אמיתית:
   - כשמועמד שואל "איך לגשת לזה?" או "איך מתחילים?", הסבר את האינטואיציה, השווה בין כוח גס (Brute-force) לבין פתרון אופטימלי (למשל Hash Map או שני מצביעים), ושאל מה דעתו.
   - כשמועמד אומר "קשה לי", "נתקעתי" או "אני לא יודע", הפגן אמפתיה מלאה ופרק את הבעיה באמצעות דוגמה מספרית פשוטה של 2-3 איברים.
   - לעולם אל תזרוק קוד מלא מוכן! תן רמז לוגי, צעד מחשבתי או שאלת הכוונה שתאפשר לו לכתוב את הקוד בעצמו בעורך מימין.
2. תגובות ממוקדות ותמציתיות:
   - בין 2 ל-5 משפטים קריאים ומעוצבים יפה עם בולטים וקטעי קוד קצרים (\`code\`). הימנע ממגילות טקסט ארוכות ומעייפות.
3. מבנה סיום חובה:
   - בסוף כל תגובה שלך, בשורה חדשה, עליך להוסיף בלוק מטא-דאטה JSON בפורמט הבא בדיוק:
<<<METADATA>>>
{"caption":"תקציר משפט אחד בעברית שמתאים לכתוביות","mood":"Attentive|Evaluating Strategy|Probing Trade-offs|Analyzing Traceback|Complexity Review|Impressed","nextState":"GREETING|PROBLEM_CLARIFICATION|CODING|REVIEW_AND_COMPLEXITY|COMPLETED"}
<<<END_METADATA>>>`;
}

/**
 * Generates an intelligent, conversational response from Gemini for the LeetCode interview in Hebrew.
 */
export async function generateGeminiLeetCodeResponse({
  problem,
  persona,
  messages,
  userMessage,
  candidateCode,
  language,
  executionResult,
  testResults,
  isCodeRun = false,
  isSubmission = false
}: {
  problem: CodingProblem;
  persona: PersonaType;
  messages: Message[];
  userMessage?: string;
  candidateCode: string;
  language: SupportedLanguage;
  executionResult?: ExecutionResult | null;
  testResults?: TestCaseResult[] | null;
  isCodeRun?: boolean;
  isSubmission?: boolean;
}): Promise<LeetCodeAgentOutput> {
  const apiKey = getGeminiApiKey();

  // If no Gemini API key is configured, fallback to friendly offline Hebrew response
  if (!apiKey) {
    return {
      text: `ברוך הבא לאתגר **${problem.title}**! כדי להפעיל בינה מלאכותית מלאה ואינטראקטיבית עם הכוונה סוקרטית בעברית, אנא הגדר את מפתח ה-Gemini שלך. בינתיים, עיין במפרט הבעיה בלשונית משמאל והתחל לחשוב על האינטואיציה האלגוריתמית בעורך הקוד!`,
      caption: `ברוך הבא! בוא נבחן את הגישה שלך עבור ${problem.title}.`,
      mood: 'Attentive',
      nextState: 'CODING'
    };
  }

  const systemInstruction = buildSystemInstruction(persona, problem);

  // Build conversation history for Gemini
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Recent messages (last 10 turns to preserve context window and latency)
  const recentMessages = messages.slice(-10);
  for (const msg of recentMessages) {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'ai') {
      // Strip any previous metadata blocks from stored text
      const cleanText = msg.text.replace(/<<<METADATA>>>[\s\S]*?<<<END_METADATA>>>/g, '').trim();
      contents.push({ role: 'model', parts: [{ text: cleanText }] });
    }
  }

  // Construct current prompt context in Hebrew instructions
  let currentPromptText = '';

  if (isSubmission && testResults) {
    const failedCases = testResults.filter(tc => !tc.passed);
    const passedCount = testResults.length - failedCases.length;

    currentPromptText = `[המועמד הגיש פתרון (SUBMISSION)]
שפת פיתוח: ${language}
קוד נוכחי בעורך:
\`\`\`${language}
${candidateCode}
\`\`\`
תוצאות הטסטים: ${passedCount}/${testResults.length} בדיקות עברו בהצלחה.
${
  failedCases.length > 0
    ? `נכשל במקרה בדיקה: קלט: ${failedCases[0].input} | פלט צפוי: ${failedCases[0].expected} | פלט שהתקבל: ${failedCases[0].actual || 'שגיאה'}`
    : `כל ${testResults.length} הטסטים עברו בהצלחה!`
}

הערך את ההגשה הזו בעברית. אם הכל עבר, ברך אותם ובקש מהם לנתח את סיבוכיות הזמן והמקום (Big-O). אם נכשלו, כוון אותם סוקרטית לחשוב על מקרה הקצה שנכשל מבלי לגלות את הפתרון.`;
  } else if (isCodeRun && executionResult) {
    currentPromptText = `[המועמד הריץ קוד לבדיקה מדגמית (RUN CODE)]
שפת פיתוח: ${language}
קוד נוכחי בעורך:
\`\`\`${language}
${candidateCode}
\`\`\`
תוצאת הרצה:
- קוד יציאה: ${executionResult.code}
- פלט סטנדרטי (Stdout): ${executionResult.stdout || '(אין)'}
- שגיאת ריצה (Stderr): ${executionResult.stderr || '(אין)'}

תן משוב קצר, בהיר ומקצועי בעברית על מה שקרה וכיצד להתקדם.`;
  } else if (userMessage) {
    currentPromptText = `[הודעת מועמד]
המועמד אומר: "${userMessage}"

[מצב עורך הקוד הנוכחי]
שפת פיתוח: ${language}
קוד:
\`\`\`${language}
${candidateCode || '(עדיין לא נכתב קוד)'}
\`\`\`

ענה למועמד בעברית טבעית, מקצועית ומעודדת. אם הוא שאל על כיוון פתרון או ציין שקשה לו, הדרך אותו סוקרטית שלב אחר שלב!`;
  } else {
    // Initial greeting prompt
    currentPromptText = `אנא מסור ברכת פתיחה חמה, מקצועית וקצרה בעברית. הצג את עצמך ואת הבעיה "${problem.title}" (רמה: ${problem.difficulty}). הזמן את המועמד לשתף ברעיונות הראשוניים שלו ובכיוון הפתרון לפני כתיבת שורת קוד אחת.`;
  }

  contents.push({ role: 'user', parts: [{ text: currentPromptText }] });

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL, 'gemini-1.5-pro', 'gemini-pro'];

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 600
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini LeetCode error on ${modelName} (${response.status}):`, errText);
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Extract metadata block
      let cleanText = rawText;
      let caption = '';
      let mood: InterviewMood = 'Evaluating Strategy';
      let nextState: InterviewState | undefined = undefined;

      const metaMatch = rawText.match(/<<<METADATA>>>([\s\S]*?)<<<END_METADATA>>>/);
      if (metaMatch && metaMatch[1]) {
        try {
          const metaJson = JSON.parse(metaMatch[1].trim());
          if (metaJson.caption) caption = metaJson.caption;
          if (metaJson.mood) mood = metaJson.mood;
          if (metaJson.nextState) nextState = metaJson.nextState;
        } catch {
          // Ignored metadata parse error
        }
        cleanText = rawText.replace(/<<<METADATA>>>[\s\S]*?<<<END_METADATA>>>/g, '').trim();
      }

      if (!caption) {
        // Derive clean caption from first sentence
        caption = cleanText.split('\n')[0].slice(0, 120);
      }

      return {
        text: cleanText,
        caption,
        mood,
        nextState
      };
    } catch (err) {
      console.warn(`Failed to call ${modelName}:`, err);
    }
  }

  // Graceful fallback if Gemini calls fail
  return {
    text: `אני מנתח/ת את הכיוון שלך עבור **${problem.title}**. חשוב כיצד היית פותר את הבעיה באופן ידני באמצעות דף ועיפרון. מהו פתרון הכוח הגס (Brute-force), ואיזה מבנה נתונים יוכל לעזור לייעל את החיפוש?`,
    caption: `בוא ננתח יחד את הגישה האופטימלית ל-${problem.title}.`,
    mood: 'Attentive',
    nextState: 'CODING'
  };
}
