import type { CodingProblem } from '../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum (סכום שני מספרים)',
    difficulty: 'Easy',
    category: 'מערכים וטבלאות גיבוב',
    tags: ['מערך', 'טבלת גיבוב'],
    acceptanceRate: '52.4%',
    description: `נתון מערך של מספרים שלמים \`nums\` ומספר שלם \`target\`. עליך להחזיר את האינדקסים של שני המספרים שסכומם שווה ל-\`target\`.

ניתן להניח שלכל קלט קיים **פתרון יחיד בדיוק**, ואין להשתמש באותו איבר (באותו אינדקס) פעמיים.

ניתן להחזיר את התשובה בכל סדר אינדקסים שתבחר.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'קיים פתרון תקף אחד ויחיד.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'מכיוון ש-nums[0] + nums[1] == 9, אנו מחזירים [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'מכיוון ש-nums[1] + nums[2] == 6, אנו מחזירים [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'האיברים באינדקסים 0 ו-1 מסתכמים ל-6.'
      }
    ],
    starterCode: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function twoSum(nums, target) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // כתוב את הפתרון שלך כאן
        return {};
    }
};
`
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
      { input: 'nums = [3,3], target = 6', expected: '[0,1]' },
      { input: 'nums = [1,5,8,3], target = 11', expected: '[2,3]' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N)',
    hints: [
      'רמה 1: סריקה כפולה נאיבית (לולאות מקוננות) תיקח סיבוכיות זמן של O(N^2). האם ניתן לאתר את הזוג במעבר בודד בלבד?',
      'רמה 2: חשוב איזה מידע נדרש לך בכל שלב: בהינתן איבר x, איזה מספר y דרוש כדי לקיים x + y = target?',
      'רמה 3: שמור כל מספר שביקרת בו יחד עם האינדקס שלו בטבלת גיבוב (Hash Map / dict) כדי שחיפוש המשלים יתבצע ב-O(1).',
      'רמה 4: מקרה קצה: שים לב שלא להשתמש באותו איבר עצמו פעמיים (המשלים חייב להיות באינדקס שונה).'
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses (סוגריים תקינים)',
    difficulty: 'Easy',
    category: 'מחסנית',
    tags: ['מחרוזת', 'מחסנית'],
    acceptanceRate: '41.2%',
    description: `נתונה מחרוזת \`s\` המכילה רק את התווים \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` ו-\`']'\`. עליך לקבוע האם מחרוזת הקלט תקינה ומאוזנת.

מחרוזת קלט מוגדרת כתקינה אם:
1. כל סוגר פותח נסגר על ידי סוגר מאותו סוג בדיוק.
2. סוגריים פותחים נסגרים בסדר הנכון (LIFO - נכנס אחרון יוצא ראשון).
3. לכל סוגר סוגר יש סוגר פותח תואם מאותו סוג.`,
    constraints: [
      '1 <= s.length <= 10^4',
      'המחרוזת s מורכבת מסוגריים בלבד: ()[]{}'
    ],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'זוג סוגריים עגולים פותח וסוגר כהלכה.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'שלושה זוגות סוגריים תקינים ברצף.' },
      { input: 's = "(]"', output: 'false', explanation: 'סוגר פותח עגול נסגר על ידי סוגר מרובע לא תואם.' },
      { input: 's = "([)]"', output: 'false', explanation: 'סדר הסגירה שגוי (הסוגר הפנימי נסגר אחרי החיצוני).' }
    ],
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function isValid(s) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // כתוב את הפתרון שלך כאן
        return false;
    }
};
`
    },
    testCases: [
      { input: 's = "()"', expected: 'true' },
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
      { input: 's = "([)]"', expected: 'false' },
      { input: 's = "{[]}"', expected: 'true' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N)',
    hints: [
      'רמה 1: שים לב שהסוגר האחרון שנפתח הוא הראשון שחייב להיסגר. זהו דפוס מובהק של LIFO (Last-In First-Out).',
      'רמה 2: השתמש במבנה נתונים מסוג מחסנית (Stack). דחוף (Push) כל סוגר פותח: `(`, `{`, `[`.',
      'רמה 3: בעת מפגש עם סוגר סוגר, שלוף (Pop) את ראש המחסנית ובדוק האם הם תואמים.',
      'רמה 4: מקרי קצה: מה קורה אם המחרוזת מתחילה בסוגר סוגר, או שבסיום הסריקה נותרו עדיין סוגריים פותחים במחסנית?'
    ]
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock (הזמן הטוב ביותר לקנייה ומכירת מניה)',
    difficulty: 'Easy',
    category: 'חלון מחליק ומערכים',
    tags: ['מערך', 'תכנות דינמי', 'חלון מחליק'],
    acceptanceRate: '54.1%',
    description: `נתון מערך של מחירים \`prices\`, כאשר \`prices[i]\` מייצג את מחיר המניה ביום ה-\`i\`.

ברצונך למקסם את הרווח שלך על ידי בחירת **יום בודד** לקניית מניה אחת, ובחירת **יום עתידי נפרד** למכירת אותה מניה.

החזר את ה*רווח המקסימלי* שתוכל להשיג מעסקה זו. אם אינך יכול להשיג רווח כלל, החזר \`0\`.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'קנייה ביום 2 (מחיר = 1) ומכירה ביום 5 (מחיר = 6) מניבה רווח מקסימלי: 6 - 1 = 5.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'המחירים יורדים באופן קבוע, אין שום עסקה רווחית ולכן הרווח המקסימלי הוא 0.'
      }
    ],
    starterCode: {
      python: `def max_profit(prices: list[int]) -> int:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function maxProfit(prices) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // כתוב את הפתרון שלך כאן
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expected: '5' },
      { input: 'prices = [7,6,4,3,1]', expected: '0' },
      { input: 'prices = [2,4,1]', expected: '2' },
      { input: 'prices = [3,2,6,5,0,3]', expected: '4' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1)',
    hints: [
      'רמה 1: האם ניתן לפתור זאת במעבר ליניארי בודד מבלי לבדוק כל זוג אפשרי של קנייה ומכירה?',
      'רמה 2: בכל יום `i`, מהו המחיר המינימלי שבו יכולת לקנות מניה בכל הימים שקדמו לו?',
      'רמה 3: שמור שני משתנים: `min_price` (מחיר קנייה מינימלי עד כה) ו-`max_profit` (רווח מירבי שנצפה). עדכן בהתאם בכל איבר.',
      'רמה 4: מקרה קצה: אם המחירים יורדים בקביעות, ודא שהרווח נשאר 0 ולא הופך לשלילי.'
    ]
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists (מיזוג שתי רשימות ממוינות)',
    difficulty: 'Easy',
    category: 'רשימה מקושרת',
    tags: ['רשימה מקושרת', 'רקורסיה', 'שני מצביעים'],
    acceptanceRate: '63.8%',
    description: `נתונים ראשי שתי רשימות מקושרות ממוינות \`list1\` ו-\`list2\`.

מזג את שתי הרשימות לרשימה ממוינת **אחת**. הרשימה החדשה צריכה להיווצר על ידי שזירת הצמתים של שתי הרשימות המקוריות.

החזר את ראש הרשימה המקושרת הממוזגת.`,
    constraints: [
      'מספר הצמתים בכל רשימה הוא בטווח [0, 50].',
      '-100 <= Node.val <= 100',
      'שתי הרשימות list1 ו-list2 ממוינות בסדר עולה לא-יורד.'
    ],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'שילוב כל האיברים בסדר ממוין עולה.' },
      { input: 'list1 = [], list2 = []', output: '[]', explanation: 'שתי הרשימות ריקות, התוצאה היא רשימה ריקה.' },
      { input: 'list1 = [], list2 = [0]', output: '[0]', explanation: 'רשימה אחת ריקה, מחזירים את הרשימה השנייה.' }
    ],
    starterCode: {
      python: `def merge_two_lists(list1: list[int], list2: list[int]) -> list[int]:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function mergeTwoLists(list1, list2) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {
        // כתוב את הפתרון שלך כאן
        return {};
    }
};
`
    },
    testCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expected: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', expected: '[]' },
      { input: 'list1 = [], list2 = [0]', expected: '[0]' },
      { input: 'list1 = [5,10], list2 = [2,3,8,12]', expected: '[2,3,5,8,10,12]' }
    ],
    optimalTimeComplexity: 'O(N + M)',
    optimalSpaceComplexity: 'O(1) מצביעים במקום / O(N + M)',
    hints: [
      'רמה 1: היות ושתי הרשימות כבר ממוינות, איזה איבר חייב להיות הקטן ביותר בתוצאה הממוזגת בכל רגע נתון?',
      'רמה 2: השווה את הצמתים הראשונים של שתי הרשימות. בחר את הקטן מביניהם וקדם את המצביע שלו.',
      'רמה 3: צומת דמה (Dummy Head) מפשט מאוד את מקרי הקצה של רשימות ריקות והקצאת ראש הרשימה.',
      'רמה 4: ברגע שרשימה אחת מסתיימת, חבר ישירות את שאר האיברים של הרשימה השנייה שנותרה.'
    ]
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (תת-מערך בעל סכום מקסימלי - אלגוריתם קדאן)',
    difficulty: 'Medium',
    category: 'תכנות דינמי ומערכים',
    tags: ['מערך', 'הפרד ומשול', 'תכנות דינמי'],
    acceptanceRate: '50.7%',
    description: `נתון מערך של מספרים שלמים \`nums\`. עליך למצוא את תת-המערך הרציף בעל הסכום הגדול ביותר, ולהחזיר את *סכומו*.

**תת-מערך** הוא מקטע רציף ולא-ריק של איברים מתוך המערך.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'תת-המערך הרציף [4,-1,2,1] מניב את הסכום הגדול ביותר 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'מערך עם איבר יחיד, הסכום המקסימלי הוא 1.'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'כל המערך חיובי ברובו, תת-המערך הוא המערך כולו בסכום 23.'
      }
    ],
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function maxSubArray(nums) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // כתוב את הפתרון שלך כאן
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: 'nums = [1]', expected: '1' },
      { input: 'nums = [5,4,-1,7,8]', expected: '23' },
      { input: 'nums = [-1]', expected: '-1' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1)',
    hints: [
      'רמה 1: אם סכום הקידומת (Prefix Sum) צונח מתחת ל-0, האם הוא יוכל אי פעם לתרום תרומה חיובית לתת-מערך עתידי?',
      'רמה 2: ברגע שהסכום המצטבר הופך לשלילי, כדאי לאפס אותו ולהתחיל תת-מערך חדש מהאיבר הנוכחי.',
      'רמה 3: טכניקה זו נקראת אלגוריתם קדאן (Kadane\'s Algorithm): `cur_sum = max(num, cur_sum + num)`.',
      'רמה 4: מקרה קצה: מערך שכולו מספרים שליליים (למשל [-3, -1, -5]). הסכום המקסימלי חייב להיות -1 ולא 0.'
    ]
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters (תת-מחרוזת ארוכה ללא תווים חוזרים)',
    difficulty: 'Medium',
    category: 'חלון מחליק',
    tags: ['טבלת גיבוב', 'מחרוזת', 'חלון מחליק'],
    acceptanceRate: '34.9%',
    description: `נתונה מחרוזת \`s\`. מצא את אורכה של **תת-המחרוזת הארוכה ביותר** שאינה מכילה תווים כפולים (חוזרים).`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      'המחרוזת s מורכבת מאותיות אנגליות, ספרות, סמלים ורווחים.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'התשובה היא "abc", באורך 3 תווים.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'התשובה היא "b", באורך תו בודד 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'התשובה היא "wke", באורך 3 (שים לב שהתשובה חייבת להיות תת-מחרוזת רציפה).'
      }
    ],
    starterCode: {
      python: `def length_of_longest_substring(s: str) -> int:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function lengthOfLongestSubstring(s) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // כתוב את הפתרון שלך כאן
        return 0;
    }
};
`
    },
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' },
      { input: 's = "bbbbb"', expected: '1' },
      { input: 's = "pwwkew"', expected: '3' },
      { input: 's = ""', expected: '0' },
      { input: 's = "dvdf"', expected: '3' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(min(N, M)) כאשר M הוא גודל האלפבית',
    hints: [
      'רמה 1: האם ניתן להחזיק חלון מחליק דינמי [left, right] של תווים ייחודיים בלבד?',
      'רמה 2: השתמש בטבלת גיבוב (Hash Map) כדי לשמור את האינדקס האחרון שבו נצפה כל תו.',
      'רמה 3: כאשר מזהים תו כפול באינדקס `right`, קדם את המצביע `left` ל-`last_index + 1` (ודא שאינך מזיז את left אחורה).',
      'רמה 4: מקרה קצה: מחרוזת ריקה `s = ""` צריכה להחזיר 0.'
    ]
  },
  {
    id: 'three-sum',
    title: '3Sum (שלשת מספרים בסכום אפס)',
    difficulty: 'Medium',
    category: 'שני מצביעים ומערכים',
    tags: ['מערך', 'שני מצביעים', 'מיון'],
    acceptanceRate: '34.1%',
    description: `נתון מערך של מספרים שלמים \`nums\`. החזר את כל השלשות הייחודיות \`[nums[i], nums[j], nums[k]]\` כך ש-\`i != j\`, \`i != k\`, ו-\`j != k\`, ומתקיים \`nums[i] + nums[j] + nums[k] == 0\`.

שים לב: אסור שקבוצת הפתרונות תכיל שלשות כפולות זהות.`,
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'השלשות [-1,-1,2] ו-[-1,0,1] מסתכמות ל-0 בדיוק.'
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]',
        explanation: 'אין אף שלשה שמסתכמת ל-0.'
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]',
        explanation: 'השלשה היחידה היא [0,0,0].'
      }
    ],
    starterCode: {
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function threeSum(nums) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // כתוב את הפתרון שלך כאן
        return {};
    }
};
`
    },
    testCases: [
      { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', expected: '[]' },
      { input: 'nums = [0,0,0]', expected: '[[0,0,0]]' }
    ],
    optimalTimeComplexity: 'O(N^2)',
    optimalSpaceComplexity: 'O(1) זיכרון עזר (ללא הפלט)',
    hints: [
      'רמה 1: מיון המערך תחילה דורש O(N log N), אך מאפשר שימוש אלגנטי בשני מצביעים המתקרבים זה לזה.',
      'רמה 2: קבע איבר ראשון `nums[i]`, ולאחר מכן הפעל שני מצביעים `left` ו-`right` על שאר המערך.',
      'רמה 3: אם הסכום קטן מ-0, קדם את `left`. אם הסכום גדול מ-0, הקטן את `right`.',
      'רמה 4: קריטי: דלג על איברים כפולים זהים עבור `i`, `left` ו-`right` כדי למנוע שלשות כפולות בתוצאה.'
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change (עודף מטבעות מינימלי)',
    difficulty: 'Medium',
    category: 'תכנות דינמי',
    tags: ['מערך', 'תכנות דינמי', 'חיפוש לרוחב BFS'],
    acceptanceRate: '43.2%',
    description: `נתון מערך מספרים שלמים \`coins\` המייצג מטבעות בערכים שונים, ומספר שלם \`amount\` המייצג סכום כסף כולל.

החזר את *מספר המטבעות המינימלי* שדרוש כדי להרכיב את הסכום המבוקש. אם לא ניתן להרכיב סכום זה על ידי שום צירוף של המטבעות, החזר \`-1\`.

ניתן להניח שיש ברשותך כמות אינסופית מכל סוג מטבע.`,
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    examples: [
      {
        input: 'coins = [1,2,5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (סך הכל 3 מטבעות).'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
        explanation: 'לא ניתן להרכיב 3 באמצעות מטבעות של 2 בלבד.'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0',
        explanation: 'סכום 0 דורש 0 מטבעות.'
      }
    ],
    starterCode: {
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function coinChange(coins, amount) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // כתוב את הפתרון שלך כאן
        return -1;
    }
};
`
    },
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expected: '3' },
      { input: 'coins = [2], amount = 3', expected: '-1' },
      { input: 'coins = [1], amount = 0', expected: '0' },
      { input: 'coins = [2,5,10,1], amount = 27', expected: '4' }
    ],
    optimalTimeComplexity: 'O(amount * len(coins))',
    optimalSpaceComplexity: 'O(amount)',
    hints: [
      'רמה 1: גישה חמדנית (בחירת המטבע הגדול ביותר בכל פעם) אינה עובדת תמיד למערכי מטבעות שרירותיים. חשוב על תכנות דינמי (DP).',
      'רמה 2: הגדר `dp[i]` כמספר המטבעות המינימלי להרכבת סכום `i`. תנאי בסיס: `dp[0] = 0`.',
      'רמה 3: מעבר: לכל מטבע `c`, מתקיים `dp[i] = min(dp[i], dp[i - c] + 1)`.',
      'רמה 4: מקרה קצה: אם `dp[amount]` נשאר אינסוף (בלתי מושג), החזר -1.'
    ]
  },
  {
    id: 'binary-tree-level-order-traversal',
    title: 'Binary Tree Level Order Traversal (סריקת עץ בינארי לפי רמות - BFS)',
    difficulty: 'Medium',
    category: 'עצים בינאריים',
    tags: ['עץ', 'חיפוש לרוחב BFS', 'עץ בינארי'],
    acceptanceRate: '67.0%',
    description: `בהינתן צומת השורש (\`root\`) של עץ בינארי, החזר את *סריקת הרמות של ערכי הצמתים שלו* (משמאל לימין, רמה אחר רמה).`,
    constraints: [
      'מספר הצמתים בעץ הוא בטווח [0, 2000].',
      '-1000 <= Node.val <= 1000'
    ],
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
        explanation: 'רמה 1: [3], רמה 2: [9,20], רמה 3: [15,7].'
      },
      {
        input: 'root = [1]',
        output: '[[1]]',
        explanation: 'עץ בעל שורש בלבד.'
      },
      {
        input: 'root = []',
        output: '[]',
        explanation: 'עץ ריק, מוחזר מערך ריק.'
      }
    ],
    starterCode: {
      python: `def level_order(nodes: list) -> list[list[int]]:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function levelOrder(nodes) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> levelOrder(vector<int>& nodes) {
        // כתוב את הפתרון שלך כאן
        return {};
    }
};
`
    },
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', expected: '[[1]]' },
      { input: 'root = []', expected: '[]' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(N) (תור שומר את רוחב הרמה המקסימלי)',
    hints: [
      'רמה 1: סריקת עץ לפי רמות תואמת במדויק אלגוריתם חיפוש לרוחב (Breadth-First Search - BFS).',
      'רמה 2: השתמש במבנה נתונים מסוג תור (Queue - FIFO). הכנס את צומת השורש.',
      'רמה 3: בכל רמה, תעד את אורך התור הנוכחי (`queue.length`) כדי לעבד בדיוק רמה אחת בכל איטרציה.',
      'רמה 4: מקרה קצה: שורש ריק `root = []` צריך להחזיר מערך ריק `[]`.'
    ]
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water (לכידת מי גשמים)',
    difficulty: 'Hard',
    category: 'שני מצביעים ומערכים',
    tags: ['מערך', 'שני מצביעים', 'תכנות דינמי', 'מחסנית מונוטונית'],
    acceptanceRate: '61.4%',
    description: `נתונים \`n\` מספרים שלמים אי-שליליים המייצגים מפת גבהים שבה רוחב כל עמודה הוא \`1\`. חשב כמה מי גשמים העמודות מסוגלות ללכוד לאחר ירידת גשם.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'מפת הגבהים לוכדת 6 יחידות מים בסך הכל.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: 'הפרשי הגבהים מאפשרים לכידה של 9 יחידות מים.'
      }
    ],
    starterCode: {
      python: `def trap(height: list[int]) -> int:
    # כתוב את הפתרון שלך כאן
    pass
`,
      javascript: `function trap(height) {
    // כתוב את הפתרון שלך כאן
    
}
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        // כתוב את הפתרון שלך כאן
        return 0;
    }
};
`
    },
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
      { input: 'height = [4,2,0,3,2,5]', expected: '9' },
      { input: 'height = [1,2,3]', expected: '0' },
      { input: 'height = [5,0,5]', expected: '5' }
    ],
    optimalTimeComplexity: 'O(N)',
    optimalSpaceComplexity: 'O(1) עם שני מצביעים / O(N) עם מערכי קידומות',
    hints: [
      'רמה 1: כמה מים ניתן לאגור מעל עמודה באינדקס `i`? כמות המים מוגבלת על ידי `min(max_left, max_right) - height[i]`.',
      'רמה 2: ניתן לחשב מראש מקסימום משמאל ומקסימום מימין בסיבוכיות זיכרון O(N), או לייעל ל-O(1) באמצעות שני מצביעים.',
      'רמה 3: עם שני מצביעים `left` ו-`right`, קדם תמיד את הצד עם החומה המקסימלית הנמוכה יותר, כיוון שצד זה מהווה את צוואר הבקבוק.',
      'רמה 4: מקרי קצה: גבהים עולים או יורדים באופן מונוטוני אינם לוכדים מים כלל (0 מים).'
    ]
  }
];
