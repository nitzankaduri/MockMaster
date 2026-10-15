import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Check,
  RotateCcw,
  Copy,
  CheckCheck,
  Loader2,
  Code,
  FileText,
  Sliders,
  BarChart3,
  Plus,
  Trash2,
  Cpu,
  Zap,
  Gauge
} from 'lucide-react';
import type { CodingProblem, CustomTestCase, ExecutionResult, SupportedLanguage, TestCaseResult } from '../types';
import { ProblemDescription } from './ProblemDescription';

interface CodeSandboxProps {
  problem: CodingProblem;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  code: string;
  onCodeChange: (value: string) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  customTestCases: CustomTestCase[];
  onAddCustomTestCase: (input: string, expected?: string) => void;
  onRemoveCustomTestCase: (id: string) => void;
  executionResult: ExecutionResult | null;
  testResults: TestCaseResult[] | null;
}

const LANGUAGES: { id: SupportedLanguage; label: string; monacoId: string }[] = [
  { id: 'python', label: 'Python 3', monacoId: 'python' },
  { id: 'javascript', label: 'JavaScript (Node.js)', monacoId: 'javascript' },
  { id: 'cpp', label: 'C++ (GCC 17)', monacoId: 'cpp' }
];

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  problem,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onResetCode,
  onRunCode,
  onSubmitCode,
  isRunning,
  isSubmitting,
  customTestCases,
  onAddCustomTestCase,
  onRemoveCustomTestCase,
  executionResult,
  testResults
}) => {
  const [activeSandboxTab, setActiveSandboxTab] = useState<'editor' | 'specs' | 'testcases' | 'metrics'>('editor');
  const [copied, setCopied] = useState(false);
  const [newCaseInput, setNewCaseInput] = useState('');
  const [newCaseExpected, setNewCaseExpected] = useState('');

  const activeLangConfig = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCase = () => {
    if (!newCaseInput.trim()) return;
    onAddCustomTestCase(newCaseInput.trim(), newCaseExpected.trim());
    setNewCaseInput('');
    setNewCaseExpected('');
  };

  const passedCount = testResults ? testResults.filter(t => t.passed).length : 0;
  const totalCount = testResults ? testResults.length : 0;
  const passPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#060809] overflow-hidden">
      {/* Top Multi-Tab Header Bar (ZeBeyond sleek pill navbar) */}
      <div className="h-12 px-4 border-b border-[#141e22] bg-[#070b0d]/90 backdrop-blur-xl flex items-center justify-between select-none" dir="rtl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0a0f12] p-1 rounded-full border border-[#162227] shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setActiveSandboxTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeSandboxTab === 'editor'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_15px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>עורך קוד</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab('specs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeSandboxTab === 'specs'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_15px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>מפרט הבעיה</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab('testcases')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeSandboxTab === 'testcases'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_15px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>מקרי בדיקה</span>
              {customTestCases.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#022019]" />
              )}
            </button>

            <button
              onClick={() => setActiveSandboxTab('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeSandboxTab === 'metrics'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_15px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>ביצועים וסיבוכיות</span>
              {testResults && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${passPercent === 100 ? 'bg-[#064e3b] text-mint-300' : 'bg-rose-950 text-rose-300'}`}>
                  {passPercent}%
                </span>
              )}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#1a2529] hidden lg:block mx-0.5" />

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-[#0a0f12] p-0.5 rounded-full border border-[#162227]" dir="ltr">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  language === lang.id
                    ? 'bg-[#121c20] text-[#2dd4bf] border border-[#1d2d33]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Copy, Reset, Run, Submit */}
        <div className="flex items-center gap-2" dir="ltr">
          {/* Submit Button (ZeBeyond vibrant primary hero pill) */}
          <button
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#10b981] hover:from-[#5eead4] hover:to-[#2ee59d] text-[#022019] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#022019]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#022019]" />
            )}
            <span>{isSubmitting ? 'מעריך...' : 'הגש פתרון'}</span>
          </button>

          {/* Run Code Button (ZeBeyond sleek secondary pill) */}
          <button
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1.5 rounded-full bg-[#0c1214] hover:bg-[#131d21] border border-[#1a2529] hover:border-[#2dd4bf]/40 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-sm"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2dd4bf]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#2dd4bf] fill-[#2dd4bf]" />
            )}
            <span>{isRunning ? 'מריץ קוד...' : 'הרץ קוד'}</span>
          </button>

          <div className="h-4 w-[1px] bg-[#1a2529]" />

          <button
            onClick={onResetCode}
            title="אפס קוד התחלתי לתבנית המקורית"
            className="w-8 h-8 rounded-full bg-[#0c1214] hover:bg-[#121b1f] border border-[#1a2529] text-slate-400 hover:text-white transition-colors flex items-center justify-center text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            title="העתק קוד ללוח"
            className="w-8 h-8 rounded-full bg-[#0c1214] hover:bg-[#121b1f] border border-[#1a2529] text-slate-400 hover:text-white transition-colors flex items-center justify-center text-xs"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Drawer Content Based on Active Tab */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#060809]">
        {/* Tab 1: Monaco Code Editor */}
        {activeSandboxTab === 'editor' && (
          <div
            className="h-full w-full relative select-text"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' }}
          >
            <Editor
              height="100%"
              language={activeLangConfig.monacoId}
              value={code}
              onChange={(val) => onCodeChange(val || '')}
              theme="vs-dark"
              onMount={(editor) => {
                editor.layout();
              }}
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                tabSize: 4,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 14, bottom: 14 },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                suggestOnTriggerCharacters: true,
                readOnly: false,
                domReadOnly: false
              }}
              loading={
                <div className="h-full flex items-center justify-center text-slate-500 text-xs space-x-2" dir="rtl">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2dd4bf]" />
                  <span>טוען את סביבת מונקו...</span>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 2: Problem Specs */}
        {activeSandboxTab === 'specs' && (
          <div className="h-full w-full bg-[#060809]">
            <ProblemDescription key={problem.id} problem={problem} />
          </div>
        )}

        {/* Tab 3: Custom Test Cases Drawer (ZeBeyond modular card aesthetic) */}
        {activeSandboxTab === 'testcases' && (
          <div className="h-full w-full overflow-y-auto p-5 space-y-4 bg-[#060809] text-xs" dir="rtl">
            <div className="flex items-center justify-between border-b border-[#141e22] pb-3">
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider font-sans text-sm">
                  הגדרת מקרי בדיקה (Test Cases)
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  הוסף ארגומנטים מותאמים אישית או בחן מקרי בדיקה מוגדרים מראש.
                </p>
              </div>
            </div>

            {/* Predefined Test Cases Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                חבילת בדיקות מוגדרת מראש ({problem.testCases.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {problem.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/30 transition-all space-y-1.5 font-mono text-xs text-left"
                    dir="ltr"
                  >
                    <div className="text-[#2dd4bf] font-semibold text-[11px]">מקרה {idx + 1}</div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">קלט: </span>
                      {tc.input}
                    </div>
                    <div className="text-mint-400">
                      <span className="text-slate-500">פלט צפוי: </span>
                      {tc.expected}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Test Cases Added by Candidate */}
            <div className="space-y-2 pt-2 border-t border-[#141e22]">
              <span className="text-[11px] font-bold text-[#2dd4bf] uppercase tracking-wider">
                מקרי בדיקה מותאמים אישית ({customTestCases.length})
              </span>

              {customTestCases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customTestCases.map(ctc => (
                    <div
                      key={ctc.id}
                      className="p-3.5 rounded-2xl bg-[#0a1013] border border-[#1c2c31] space-y-1.5 font-mono text-xs relative group text-left"
                      dir="ltr"
                    >
                      <button
                        onClick={() => onRemoveCustomTestCase(ctc.id)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-rose-400 transition-colors"
                        title="מחק מקרה בדיקה מותאם אישית"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[#2dd4bf] font-semibold text-[11px]">קלט מותאם אישית</div>
                      <div className="text-slate-200">{ctc.input}</div>
                      {ctc.expected && (
                        <div className="text-mint-400">
                          <span className="text-slate-500">פלט צפוי: </span>
                          {ctc.expected}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#090e11] border border-dashed border-[#162328] text-slate-500 text-center text-xs">
                  טרם נוספו מקרי בדיקה מותאמים אישית. הוסף מקרה חדש למטה!
                </div>
              )}
            </div>

            {/* Add New Custom Case Input Form */}
            <div className="p-4 rounded-2xl bg-[#090e11] border border-[#162328] space-y-3">
              <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5 space-x-reverse">
                <Plus className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>הוסף ארגומנט בדיקה מותאם אישית</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="ltr">
                <input
                  type="text"
                  value={newCaseInput}
                  onChange={e => setNewCaseInput(e.target.value)}
                  placeholder={`קלט (לדוגמה: ${problem.examples[0]?.input || 'test input'})`}
                  className="bg-[#06090a] border border-[#1a2529] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#2dd4bf] font-mono"
                />
                <input
                  type="text"
                  value={newCaseExpected}
                  onChange={e => setNewCaseExpected(e.target.value)}
                  placeholder="פלט צפוי (אופציונלי)"
                  className="bg-[#06090a] border border-[#1a2529] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#2dd4bf] font-mono"
                />
              </div>

              <button
                onClick={handleAddCase}
                disabled={!newCaseInput.trim()}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#10b981] hover:from-[#5eead4] hover:to-[#2ee59d] disabled:opacity-30 text-[#022019] font-bold text-xs flex items-center space-x-1.5 space-x-reverse transition-all shadow-[0_0_15px_rgba(45,212,191,0.25)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף למערך הבדיקות</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Performance & AI Metrics Drawer (ZeBeyond high-tech diagnostics) */}
        {activeSandboxTab === 'metrics' && (
          <div className="h-full w-full overflow-y-auto p-5 space-y-4 bg-[#060809] text-xs" dir="rtl">
            <div className="border-b border-[#141e22] pb-3">
              <h3 className="font-bold text-white uppercase tracking-wider font-sans text-sm flex items-center space-x-2 space-x-reverse">
                <Gauge className="w-4 h-4 text-[#2dd4bf]" />
                <span>אבחון ביצועים וסיבוכיות (Big-O)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                ניתוח בזמן אמת של מהירות ריצה, צריכת זיכרון ויעילות אלגוריתמית.
              </p>
            </div>

            {/* Metrics Dashboard 3 Cards (matching ZeBeyond bottom card series) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Execution Duration */}
              <div className="p-4 rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/40 transition-all space-y-2">
                <div className="flex items-center space-x-1.5 space-x-reverse text-slate-400 text-[11px] font-semibold uppercase font-sans">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>מהירות ריצה</span>
                </div>
                <div className="text-2xl font-mono font-bold text-[#2dd4bf]" dir="ltr">
                  {executionResult?.executionTime || '0 ms'}
                </div>
                <div className="text-[10px] text-slate-500">
                  הרצה בסביבת ארגז חול מבודדת
                </div>
              </div>

              {/* Memory Estimate */}
              <div className="p-4 rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/40 transition-all space-y-2">
                <div className="flex items-center space-x-1.5 space-x-reverse text-slate-400 text-[11px] font-semibold uppercase font-sans">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>זיכרון מוקצה</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-200" dir="ltr">
                  {executionResult?.memory || '3,420 KB'}
                </div>
                <div className="text-[10px] text-slate-500">
                  תקורת זיכרון Heap וזמן ריצה
                </div>
              </div>

              {/* Test Suite Pass Rate */}
              <div className="p-4 rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/40 transition-all space-y-2">
                <div className="flex items-center space-x-1.5 space-x-reverse text-slate-400 text-[11px] font-semibold uppercase font-sans">
                  <BarChart3 className="w-3.5 h-3.5 text-mint-400" />
                  <span>אחוז מעבר בדיקות</span>
                </div>
                <div className="text-2xl font-mono font-bold text-mint-400" dir="ltr">
                  {totalCount > 0 ? `${passPercent}%` : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {totalCount > 0 ? `${passedCount}/${totalCount} בדיקות עברו בהצלחה` : 'הגש פתרון לקבלת הערכה'}
                </div>
              </div>
            </div>

            {/* Complexity Benchmark Card */}
            <div className="p-4.5 rounded-2xl bg-[#090e11] border border-[#162328] space-y-3">
              <div className="font-bold text-white uppercase tracking-wider font-sans text-xs">
                הערכת סיבוכיות Big-O
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#06090a] border border-[#162227] space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold font-mono">יעד סיבוכיות זמן</div>
                  <div className="text-base font-bold text-[#2dd4bf] font-mono" dir="ltr">
                    {problem.optimalTimeComplexity}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    מעבר יחיד / גבול חיפוש אופטימלי
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06090a] border border-[#162227] space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold font-mono">יעד סיבוכיות זיכרון</div>
                  <div className="text-base font-bold text-emerald-400 font-mono" dir="ltr">
                    {problem.optimalSpaceComplexity}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    טביעת רגל של זיכרון עזר מוקצה
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interviewer Socratic Summary (with subtle emerald gradient glow) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#064e3b]/30 via-[#091518] to-[#06241b]/20 border border-[#133d32] space-y-1.5 shadow-[0_4px_25px_rgba(6,78,59,0.15)]">
              <div className="text-[#2dd4bf] font-bold text-xs uppercase tracking-wider font-mono">
                הערכת ה-AI המראיין / AI Interviewer Verdict
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {passPercent === 100
                  ? `הפתרון שלך אומת בהצלחה כנגד כל ${totalCount} מקרי הבדיקה! כעת, שוחח עם המראיין בצ'אט ונתח את ה-Trade-offs של סיבוכיות הזמן והמקום.`
                  : totalCount > 0
                  ? `הפתרון עבר ${passedCount} מתוך ${totalCount} מקרי בדיקה. בחן את מקרה הקצה שנכשל בלשונית המסוף למטה.`
                  : `לחץ על "הגש פתרון" בסרגל העליון כדי להריץ את חבילת הבדיקות המלאה ולקבל הערכה מפורטת.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
