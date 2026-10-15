# 🎯 MockMaster — AI-Powered Tech Interview Platform

> **מאמנת הראיונות האישית שלך להייטק — סימולציות קוליות בעברית והדרכה סוקרטית לאלגוריתמיקה וקוד.**

[![GitHub stars](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

---

## 🌟 מה זה MockMaster?

**MockMaster** היא פלטפורמת הדמיית ראיונות עבודה מתקדמת המיועדת להכשיר מועמדים לתעשיית ההייטק. הפלטפורמה מכסה את שני צידי המטבע של תהליך הגיוס:
1. **הצד ההתנהגותי והאישיותי (HR & Culture Fit):** ראיון קולי חי ואינטראקטיבי בעברית טבעית עם המראיינת רותם, הכולל התאמה לכל תפקיד ודוח אנליטי מבוסס מתודולוגיית STAR.
2. **הצד הטכנולוגי והאלגוריתמי (LeetCode Coding Sandbox):** סביבת פיתוח מלאה בדפדפן (Monaco Editor) בליווי מנטורית AI סוקרטית (שרה חן) שלא פולטת קוד מוכן אלא מנחה צעד-אחר-צעד, לצד דמות בר-רייזר (מרקוס ואנס) לבדיקת מקרי קצה וסיבוכיות Big-O.

---

## 🚀 שני עמודי התווך של הפלטפורמה

### 1. חדר ראיון קולי בעברית (HR & Behavioral Stage)
- 🎙️ **דיבור קולי רציף בזמן אמת:** המועמד מדבר ישירות למיקרופון, ורותם מקשיבה, מעבדת ומגיבה בדיבור קולי טבעי בעברית (ללא צורך בהקלדה).
- 🎯 **התאמה אישית לכל תפקיד:** המועמד יכול להזין כל משרה (Full Stack, Cyber, DevOps, QA, Data Scientist, Product), והשאלות והדילמות יותאמו במדויק לדרישות התפקיד.
- ⭐ **מתודולוגיית STAR מובנית:** ניתוח לפי שלבי הרקע (Situation), המשימה (Task), הפעולה האישית (Action) והתוצאה המדידה (Result).
- 📊 **דוח משוב אנליטי מבוסס ראיות:**
  - ציון התאמה משוקלל (1-100).
  - המלצת גיוס רשמית (*Strong Hire, Hire, Lean Hire, No Hire*).
  - ציטוטים מדויקים מילה-במילה מתוך תשובות המועמד עם ניתוח חוזקות וטעויות.
  - טיפים מותאמים אישית לראיון הבא.

### 2. ארגז החול לראיונות קוד (LeetCode Sandbox & Socratic Mentorship)
- 💻 **עורך קוד Monaco מתקדם:** תמיכה בשפות מובילות (Python, JavaScript, TypeScript, Java, C++, Go, Rust, C#).
- 🧪 **הרצת טסטים מדגמיים והגשה מלאה:** סימולציית בקרת איכות בזמן אמת.
- 👩‍💻 **המנטורית שרה חן (Staff Software Engineer):**
  - תקשורת בצ'אט טקסט בלבד (סביבת עבודה שקטה וממוקדת).
  - פדגוגיה סוקרטית ב-4 רמות הכוונה: אינטואיציה $\leftarrow$ כוח גס $\leftarrow$ מבנה נתונים מתאים $\leftarrow$ מקרי קצה.
- 👨‍💼 **מרקוס ואנס (Bar Raiser):** ראיון קפדני למתקדמים עם דרישה להוכחות מתמטיות של סיבוכיות זמן וזיכרון (Big-O).

---

## 📚 מדריכים ומצגות
- 🎤 **[מערך מצגת 10 דקות להצגה בכיתה / פיץ'](docs/PRESENTATION.md):** פירוק מלא של הפסיכולוגיה של ראיונות, פדגוגיית הפיגומים (Scaffolding), ניתוח STAR וחלוקת זמנים מדויקת.

---

## 🛠️ התקנה והרצה מקומית

```bash
# 1. שיבוט המאגר
git clone https://github.com/nitzankaduri/MockMaster.git
cd MockMaster

# 2. התקנת תלויות צד לקוח
npm install --prefix client

# 3. הגדרת מפתח Google Gemini API
# העתק את קובץ הדוגמה והגדר את המפתח שלך:
cp client/.env.example client/.env
# ערוך את client/.env:
# VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 4. הרצת שרת הפיתוח
npm run dev --prefix client
```

האפליקציה תיפתח בכתובת: `http://localhost:5173/`

---

## 🏗️ ארכיטקטורת הטכנולוגיות

- **Frontend:** React 18, TypeScript, TailwindCSS, Lucide Icons
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Speech Recognition:** Web Speech API (`webkitSpeechRecognition` עם תמיכה בעברית `he-IL` ואיחוד שוטף של תמלול ביניים וסופי)
- **Speech Synthesis:** Google Gemini Multimodal Audio (Aoede voice) עם Fallback מובנה ל-SpeechSynthesis של הדפדפן
- **AI Intelligence:** Google Gemini Models (`gemini-3.1-flash-lite-preview`, `gemini-flash-lite-latest`, `gemini-3.5-flash`)

