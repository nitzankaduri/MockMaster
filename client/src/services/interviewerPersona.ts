import type { CodingProblem, InterviewMood, InterviewState, InterviewerPersona, PersonaType, TestCaseResult } from '../types';

export const PERSONAS: Record<PersonaType, InterviewerPersona> = {
  mentor: {
    id: 'mentor',
    name: 'שרה חן (Sarah Chen)',
    title: 'Staff Software Engineer / מהנדסת תוכנה בכירה',
    company: 'MockMaster Core Platform',
    seniority: 'STAFF L6',
    avatarSeed: 'sarah',
    accentColor: 'cyan',
    tagline: 'מנטורית תומכת ומנחה לשיתוף פעולה',
    styleDescription:
      'חמה, מעודדת ומדריכה. מתמקדת בבניית אינטואיציה אלגוריתמית, פירוק לוגי של שלבים ודיאלוג הנדסי משותף בגובה העיניים.'
  },
  bar_raiser: {
    id: 'bar_raiser',
    name: 'מרקוס ואנס (Marcus Vance)',
    title: 'Principal Systems Architect / ארכיטקט מערכות ראשי',
    company: 'FAANG Infrastructure',
    seniority: 'PRINCIPAL L7',
    avatarSeed: 'marcus',
    accentColor: 'violet',
    tagline: 'בר-רייזר קפדני וחסר פשרות',
    styleDescription:
      'ישיר, דורש מצוינות וקפדן. מצפה להוכחות יעילות Big-O מתמטיות, בדיקת מקרי קצה קיצוניים ובהירות ארכיטקטונית תחת לחץ.'
  }
};

const MENTOR_ACKNOWLEDGMENTS = [
  'הבנתי אותך, זה נשמע כיוון הגיוני ומעניין.',
  'זווית מחשבה טובה מאוד – בוא נפתח את זה.',
  'אינטואיציה מצוינת עד כה.',
  'נקודה הוגנת לחלוטין, תרגיש חופשי להתקדם עם הרעיון הזה.',
  'אני בהחלט רואה לאן אתה חותר, המשך כך.'
];

const BAR_RAISER_ACKNOWLEDGMENTS = [
  'הבנתי. בוא נוודא ונוכיח את ההנחה הזו.',
  'נרשם. מהם ה-Trade-offs המשניים של הגישה?',
  'מקובל עלי עקרונית, אך כיצד תטפל בתנאי הגבול ומקרי הקצה?',
  'אוקיי. כיצד הפתרון הזה יחזיק מעמד תחת עומס קלט כבד?',
  'התקדם, אך היה מוכן לנמק את טביעת הרגל של הזיכרון.'
];

export function getRandomAcknowledgment(persona: PersonaType): string {
  const list = persona === 'mentor' ? MENTOR_ACKNOWLEDGMENTS : BAR_RAISER_ACKNOWLEDGMENTS;
  return list[Math.floor(Math.random() * list.length)];
}

export function generateGreeting(persona: PersonaType, problem: CodingProblem): string {
  if (persona === 'mentor') {
    return `שלום! אני שרה חן, מהנדסת תוכנה בכירה בצוות הליבה של MockMaster. נעים מאוד להכיר! היום נעבוד יחד על **${problem.title}** (רמת קושי: ${problem.difficulty} — ${problem.category}).\n\nקח דקה או שתיים לקרוא את מפרט הבעיה והדוגמאות בלשונית משמאל. לפני שאתה קופץ לכתיבת קוד בעורך, אשמח מאוד לשמוע איך אתה חושב לגשת לבעיה ומה האינטואיציה הראשונית שלך!`;
  }
  return `שלום לך. שמי מרקוס ואנס, ארכיטקט מערכות ראשי. היום אנו מעריכים משמעת אלגוריתמית וקפדנות הנדסית באתגר **${problem.title}** (רמה: ${problem.difficulty}).\n\nעבור בעיון רב על האילוצים. אני מצפה לפתרון אופטימלי התואם את יעד היעילות הנדרש (${problem.optimalTimeComplexity} זמן, ${problem.optimalSpaceComplexity} זיכרון). תאר בפניי את הגישה שלך והוכח את נכונותה לפני כתיבת שורת קוד בודדת.`;
}

export function generateStrategyFeedback(
  persona: PersonaType,
  text: string,
  problem: CodingProblem
): { text: string; mood: InterviewMood; nextState: InterviewState } {
  const lower = text.toLowerCase();
  const ack = getRandomAcknowledgment(persona);

  // Check for brute force
  if (
    lower.includes('brute force') ||
    lower.includes('nested loop') ||
    lower.includes('o(n^2)') ||
    lower.includes('o(n2)') ||
    lower.includes('o(2^n)') ||
    lower.includes('כוח גס') ||
    lower.includes('לולאות מקוננות') ||
    lower.includes('לולאה בתוך לולאה')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} סריקת כוח גס (Brute-force) עם לולאות מקוננות היא תמיד נקודת פתיחה טובה כדי להבין את מכניקת הבעיה! עם זאת, עבור קלטים גדולים הסיבוכיות הריבועית תהיה איטית מדי. האם תוכל לחשוב על מבנה נתונים כמו טבלת גיבוב (Hash Map) או שני מצביעים שיאפשר להוריד את זמן הריצה קרוב יותר ליעד ${problem.optimalTimeComplexity}?`,
        mood: 'Evaluating Strategy',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    } else {
      return {
        text: `${ack} פתרון כוח גס בריבועי O(N²) אינו קביל בהתחשב באילוצים שהוגדרו (${problem.constraints[0] || 'N גדול'}). איזה מבנה נתונים או אינווריאנט יאפשר מענה לשאילתות בזמן משוקלל של O(1) או O(log N)? אני דורש אסטרטגיה אופטימלית של ${problem.optimalTimeComplexity}.`,
        mood: 'Probing Trade-offs',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    }
  }

  // Check for optimal keywords
  if (
    lower.includes('hash') ||
    lower.includes('map') ||
    lower.includes('stack') ||
    lower.includes('two pointer') ||
    lower.includes('sliding window') ||
    lower.includes('dynamic programming') ||
    lower.includes('dp') ||
    lower.includes('bfs') ||
    lower.includes('queue') ||
    lower.includes('sort') ||
    lower.includes('single pass') ||
    lower.includes('kadane') ||
    lower.includes('גיבוב') ||
    lower.includes('מחסנית') ||
    lower.includes('שני מצביעים') ||
    lower.includes('חלון מחליק') ||
    lower.includes('תכנות דינמי') ||
    lower.includes('תור') ||
    lower.includes('מיון')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} אינטואיציה מדויקת לחלוטין! שימוש בגישה הזו מוביל אותנו ישירות לזמן הריצה המבוקש של ${problem.optimalTimeComplexity}. תרגיש חופשי לגשת לעורך הקוד בעורך מימין ולהתחיל לממש את הפתרון!`,
        mood: 'Evaluating Strategy',
        nextState: 'CODING'
      };
    } else {
      return {
        text: `${ack} הגישה תואמת את הדפוס האלגוריתמי המצופה. יחד עם זאת, ודא שהאינווריאנט שלך מגן מפני מקרי קצה כגון אוספים ריקים או מפתחות כפולים. עבור למימוש בעורך הקוד.`,
        mood: 'Evaluating Strategy',
        nextState: 'CODING'
      };
    }
  }

  // Clarifications
  if (
    lower.includes('constraint') ||
    lower.includes('negative') ||
    lower.includes('empty') ||
    lower.includes('null') ||
    lower.includes('duplicate') ||
    lower.includes('אילוץ') ||
    lower.includes('שלילי') ||
    lower.includes('ריק') ||
    lower.includes('כפיל') ||
    lower.includes('מקרה קצה')
  ) {
    if (persona === 'mentor') {
      return {
        text: `${ack} שאלת הבהרה מעולה שכדאי לברר מראש! האילוצים מגדירים: ${problem.constraints.slice(0, 2).join('; ')}. שמירה על תנאי הגבול הללו בראש בזמן הקידוד תבטיח שהפתרון שלך יהיה יציב ועמיד.`,
        mood: 'Attentive',
        nextState: 'PROBLEM_CLARIFICATION'
      };
    } else {
      return {
        text: `${ack} מהנדס מקצועי מוודא מפרטים לפני הקידוד. אילוצים: ${problem.constraints.slice(0, 2).join('; ')}. אם המימוש שלך יקצה זיכרון מיותר או ייכשל על ערכי קצה, הוא לא יעבור. התחל בקידוד.`,
        mood: 'Probing Trade-offs',
        nextState: 'CODING'
      };
    }
  }

  // Default response
  if (persona === 'mentor') {
    return {
      text: `${ack} נשמע כיוון מעשי לחלוטין. אתה מוזמן להתחיל במימוש הפתרון שלך בעורך הקוד של מונקו, ואני כאן אם תיתקל במכשול כלשהו בדרך!`,
      mood: 'Evaluating Strategy',
      nextState: 'CODING'
    };
  } else {
    return {
      text: `${ack} התקדם במימוש, אך בחן ובדוק את תנאי הקצה שלך ללא הרף. אתה רשאי להריץ את הקוד בארגז החול.`,
      mood: 'Evaluating Strategy',
      nextState: 'CODING'
    };
  }
}

export function generateTracebackFeedback(
  persona: PersonaType,
  errorText: string
): { text: string; mood: InterviewMood } {
  const shortError = errorText.split('\n')[0];

  if (persona === 'mentor') {
    let guidance = `אל דאגה, שגיאות ריצה הן חלק טבעי לחלוטין מתהליך הקידוד בזמן אמת! כשמסתכלים על השגיאה: "${shortError}". `;
    if (errorText.includes('SyntaxError') || errorText.includes('expected')) {
      guidance += `נראה שמדובר בסוגיית תחביר או הזחה (Indentation) סביב השורה המצוינת. בדוק נקודתיים, סוגריים ורווחים.`;
    } else if (errorText.includes('IndexError') || errorText.includes('out of range')) {
      guidance += `אינדקס חורג מגבולות המערך. מה קורה כאשר הקלט ריק או כאשר הלולאה מגיעה לאיבר האחרון?`;
    } else if (errorText.includes('KeyError') || errorText.includes('undefined')) {
      guidance += `בוצעה גישה למפתח שעדיין לא קיים במפה או במילון. כיצד נוכל לבדוק את קיומו מראש?`;
    } else {
      guidance += `בוא נבחן את מחסנית הקריאות יחד – אילו משתנים עשויים להיות במצב בלתי צפוי בנקודה זו?`;
    }
    return { text: guidance, mood: 'Analyzing Traceback' };
  } else {
    let critique = `זוהה כשל בזמן ריצה: "${shortError}". `;
    if (errorText.includes('SyntaxError') || errorText.includes('expected')) {
      critique += `שגיאות תחביר ופרסור משקפות חוסר שליטה בשפת הפיתוח. תקן את שגיאת התחביר באופן מיידי.`;
    } else if (errorText.includes('IndexError') || errorText.includes('out of range')) {
      critique += `שגיאת Off-by-one או חריגה מגבולות המערך. בסביבת ייצור (Production) זה גורם לקריסה מלאה. עקוב אחר הלולאה שלך.`;
    } else if (errorText.includes('KeyError') || errorText.includes('undefined')) {
      critique += `שליפה לא בטוחה ממפה ללא בדיקת קיום מוקדמת. עליך להתגונן מפני מפתחות חסרים.`;
    } else {
      critique += `הקוד קרס בהרצה בסיסית. נתח את ה-Traceback ותקן את הלוגיקה.`;
    }
    return { text: critique, mood: 'Analyzing Traceback' };
  }
}

export function generateSubmissionFeedback(
  persona: PersonaType,
  passedCount: number,
  totalCount: number,
  failedCase: TestCaseResult | undefined,
  problem: CodingProblem
): { text: string; mood: InterviewMood; nextState?: InterviewState } {
  if (passedCount === totalCount && totalCount > 0) {
    if (persona === 'mentor') {
      return {
        text: `עבודה נפלאה! כל ${totalCount} מקרי הבדיקה עברו בהצלחה מלאה! הלוגיקה שלך עובדת בדיוק כמצופה. כעת לחלק המעניין: תוכל להסביר לי את סיבוכיות הזמן והמקום (Big-O Time & Space) של המימוש שכתבת?`,
        mood: 'Complexity Review',
        nextState: 'REVIEW_AND_COMPLEXITY'
      };
    } else {
      return {
        text: `כל ${totalCount} בדיקות היחידה עברו. נכונות היא דרישת סף בסיסית בלבד. כעת הוכח את הגבולות התיאורטיים: ציין במדויק את סיבוכיות הזמן וסיבוכיות זיכרון העזר, והסבר מדוע הפתרון עומד ביעד ${problem.optimalTimeComplexity}.`,
        mood: 'Complexity Review',
        nextState: 'REVIEW_AND_COMPLEXITY'
      };
    }
  }

  if (failedCase) {
    if (persona === 'mentor') {
      return {
        text: `התקדמות טובה! עברת ${passedCount} מתוך ${totalCount} מקרי בדיקה. במקרה מס' #${failedCase.index} עם קלט: \`${failedCase.input}\`, הפתרון שלך החזיר \`${failedCase.actual || 'תוצאה שגויה'}\` במקום \`${failedCase.expected}\`. איזה תנאי מיוחד או מקרה קצה הקלט הזה בודק לדעתך?`,
        mood: 'Evaluating Strategy'
      };
    } else {
      return {
        text: `חבילת הבדיקות נדחתה: ${totalCount - passedCount} בדיקות נכשלו. מקרה מס' #${failedCase.index} נכשל על קלט \`${failedCase.input}\` (פלט שלך: \`${failedCase.actual}\`, פלט צפוי: \`${failedCase.expected}\`). המימוש אינו מקיים את הדרישות. תקן זאת.`,
        mood: 'Probing Trade-offs'
      };
    }
  }

  return {
    text: `הקוד הורץ. סקור את התוצאות במסוף הבדיקות למטה.`,
    mood: 'Attentive'
  };
}

export function generateComplexityFeedback(
  persona: PersonaType,
  text: string,
  problem: CodingProblem
): { text: string; mood: InterviewMood; completed: boolean } {
  const lower = text.toLowerCase();

  const mentionsOptimalTime =
    (problem.optimalTimeComplexity.includes('O(N)') &&
      (lower.includes('o(n)') || lower.includes('linear') || lower.includes('ליניארי') || lower.includes('o of n'))) ||
    (problem.optimalTimeComplexity.includes('O(N^2)') &&
      (lower.includes('o(n^2)') || lower.includes('quadratic') || lower.includes('ריבועי') || lower.includes('n בריבוע'))) ||
    (problem.optimalTimeComplexity.includes('O(N + M)') &&
      (lower.includes('o(n + m)') || lower.includes('o(n+m)') || lower.includes('linear') || lower.includes('ליניארי')));

  const mentionsOptimalSpace =
    (problem.optimalSpaceComplexity.includes('O(1)') &&
      (lower.includes('o(1)') || lower.includes('constant') || lower.includes('קבוע') || lower.includes('o of 1'))) ||
    (problem.optimalSpaceComplexity.includes('O(N)') &&
      (lower.includes('o(n)') || lower.includes('linear') || lower.includes('ליניארי') || lower.includes('auxiliary space')));

  if (mentionsOptimalTime && mentionsOptimalSpace) {
    if (persona === 'mentor') {
      return {
        text: `מדויק לחלוטין! פגעת בול גם בסיבוכיות הזמן (${problem.optimalTimeComplexity}) וגם בסיבוכיות המקום (${problem.optimalSpaceComplexity}). הקוד שלך נקי, יעיל, והתקשורת שלך לאורך כל הראיון הייתה נהדרת. מבחינתי עברת את הראיון בהצלחה רבה!`,
        mood: 'Impressed',
        completed: true
      };
    } else {
      return {
        text: `נכון. סיבוכיות זמן: ${problem.optimalTimeComplexity}. זיכרון עזר: ${problem.optimalSpaceComplexity}. הפגנת משמעת אלגוריתמית קפדנית תחת בחינה מדוקדקת. האתגר הזה הושלם ואושר רשמית.`,
        mood: 'Impressed',
        completed: true
      };
    }
  }

  if (mentionsOptimalTime) {
    if (persona === 'mentor') {
      return {
        text: `כן, מדויק לגבי סיבוכיות הזמן (${problem.optimalTimeComplexity})! כעת, מה לגבי זיכרון העזר שצורכים המשתנים ומבני הנתונים שהגדרת? מהי סיבוכיות המקום (Space Complexity)?`,
        mood: 'Complexity Review',
        completed: false
      };
    } else {
      return {
        text: `סיבוכיות הזמן אומתה כ-${problem.optimalTimeComplexity}. מה לגבי זיכרון עזר (Heap allocation)? אל תתעלם מהקצאות זיכרון. מהי סיבוכיות המקום?`,
        mood: 'Complexity Review',
        completed: false
      };
    }
  }

  if (persona === 'mentor') {
    return {
      text: `בוא נעקוב אחר הפעולות: ביחס לגודל הקלט N, כמה פעמים הלולאה או הרקורסיה רצות? האם זה ליניארי, לוגריתמי או ריבועי?`,
      mood: 'Complexity Review',
      completed: false
    };
  } else {
    return {
      text: `הניתוח אינו מדויק דיו. זהה את הפעולה הדומיננטית: כיצד היא מתנהגת ככל ש-N גדל ל-10^5? ציין פורמלית את סיבוכיות ה-Big-O של הזמן.`,
      mood: 'Complexity Review',
      completed: false
    };
  }
}

export function generateIdleNudge(
  persona: PersonaType,
  currentHint: string,
  hintLevel: number,
  totalHints: number
): string {
  if (persona === 'mentor') {
    return `היי! שמתי לב שעצרת לחשוב על הלוגיקה לדקה או שתיים – אין שום לחץ, זה נורמלי לחלוטין בבעיה הזו. הנה רמז הדרגתי (רמז ${hintLevel}/${totalHints}) שיכול לפתוח לך את המחשבה:\n\n💡 *${currentHint}*\n\nקח את הזמן, וספר לי איך אתה רוצה ליישם את זה!`;
  }
  return `מועמד/ת, חלפו למעלה מ-90 שניות ללא התקדמות בקוד. בראיון טכני אמיתי, שתיקה ממושכת שורפת זמן יקר. שקול את הרמז המבני הבא (${hintLevel}/${totalHints}):\n\n⚠️ *${currentHint}*\n\nגבש את המימוש שלך בעורך באופן מיידי.`;
}
