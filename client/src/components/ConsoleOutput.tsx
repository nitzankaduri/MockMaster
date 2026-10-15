import { useState, useEffect } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Code,
  Maximize2,
  Minimize2,
  Cpu
} from 'lucide-react';
import type { ExecutionResult, TestCaseResult } from '../types';

interface ConsoleOutputProps {
  executionResult: ExecutionResult | null;
  testResults: TestCaseResult[] | null;
  isRunning: boolean;
  isSubmitting: boolean;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  executionResult,
  testResults,
  isRunning,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'raw'>('tests');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (testResults && testResults.length > 0) {
        setActiveTab('tests');
        const firstFailIdx = testResults.findIndex(t => !t.passed);
        if (firstFailIdx !== -1) {
          setSelectedCaseIndex(firstFailIdx);
        } else {
          setSelectedCaseIndex(0);
        }
      } else if (executionResult) {
        setActiveTab('raw');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [testResults, executionResult]);

  const passedCount = testResults ? testResults.filter(t => t.passed).length : 0;
  const totalCount = testResults ? testResults.length : 0;
  const allPassed = testResults && testResults.length > 0 && passedCount === totalCount;
  const hasError = executionResult && (executionResult.code !== 0 || Boolean(executionResult.stderr));

  return (
    <div
      className={`border-t border-[#141e22] bg-[#060809] flex flex-col transition-all duration-200 shadow-[0_-6px_25px_rgba(0,0,0,0.6)] ${
        isExpanded ? 'h-80' : 'h-48'
      }`}
    >
      {/* Console Top Header & Tabs */}
      <div className="h-10 px-4 border-b border-[#141e22] bg-[#080c0e]/95 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 text-xs text-[#2dd4bf] font-mono font-bold mr-2">
            <Terminal className="w-3.5 h-3.5 text-[#2dd4bf] animate-pulse" />
            <span>מסוף</span>
          </div>

          {/* Tab Switchers (ZeBeyond pills) */}
          <div className="flex items-center space-x-1 bg-[#0a0f12] p-0.5 rounded-full border border-[#162227]">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'tests'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>חבילת בדיקות</span>
              {testResults && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    allPassed
                      ? 'bg-[#022019] text-mint-300'
                      : 'bg-rose-950 text-rose-300'
                  }`}
                  dir="ltr"
                >
                  {passedCount}/{totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'raw'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>פלט סטנדרטי (Stdout / Stderr)</span>
              {hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
            </button>
          </div>
        </div>

        {/* Execution Metrics & Expand Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          {executionResult?.executionTime && (
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]" dir="ltr">
              <Clock className="w-3 h-3 text-[#2dd4bf]" />
              <span className="text-slate-300">{executionResult.executionTime}</span>
            </div>
          )}

          {executionResult?.memory && (
            <div className="hidden sm:flex items-center space-x-1 text-slate-400 font-mono text-[11px]" dir="ltr">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300">{executionResult.memory}</span>
            </div>
          )}

          {executionResult && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                executionResult.code === 0 && !executionResult.stderr
                  ? 'bg-[#06241a] border-[#134433] text-mint-300'
                  : 'bg-[#240b10] border-[#471922] text-rose-300'
              }`}
            >
              {executionResult.code === 0 && !executionResult.stderr ? 'EXIT 0' : 'EXIT 1 (שגיאה)'}
            </span>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'כווץ מסוף' : 'הרחב מסוף'}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-[#121c20] transition-colors flex items-center justify-center"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="flex-1 overflow-hidden p-3.5 font-mono text-xs select-text bg-[#060809]">
        {isRunning || isSubmitting ? (
          <div className="h-full flex items-center justify-center space-x-2.5 text-[#2dd4bf] font-sans">
            <div className="w-4 h-4 border-2 border-[#2dd4bf] border-t-transparent rounded-full animate-spin" />
            <span className="animate-pulse">מריץ קוד בסביבת ארגז חול מבודדת...</span>
          </div>
        ) : activeTab === 'tests' ? (
          /* Test Suite View */
          testResults && testResults.length > 0 ? (
            <div className="h-full flex flex-col space-y-2.5">
              {/* Test Case Selectors */}
              <div className="flex items-center space-x-1.5 border-b border-[#141e22] pb-2 overflow-x-auto">
                {testResults.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIndex(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all ${
                      selectedCaseIndex === idx
                        ? 'bg-[#0f1b1e] text-[#2dd4bf] border border-[#2dd4bf]/40 shadow-sm'
                        : 'bg-[#0a0f11] text-slate-400 hover:text-white border border-[#162328]'
                    }`}
                  >
                    {tc.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>מקרה {idx + 1}</span>
                  </button>
                ))}
              </div>

              {/* Selected Test Case Detail Cards */}
              {testResults[selectedCaseIndex] && (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                      מקרה בדיקה #{selectedCaseIndex + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        testResults[selectedCaseIndex].passed
                          ? 'bg-[#06241a] text-mint-300 border-[#134433]'
                          : 'bg-[#240b10] text-rose-300 border-[#471922]'
                      }`}
                    >
                      {testResults[selectedCaseIndex].passed ? 'עבר בהצלחה' : 'נכשל'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className="bg-[#090e11] p-3 rounded-2xl border border-[#162328]">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">קלט (INPUT)</div>
                      <div className="text-slate-200 break-all">{testResults[selectedCaseIndex].input}</div>
                    </div>

                    <div className="bg-[#090e11] p-3 rounded-2xl border border-[#162328]">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">פלט צפוי (EXPECTED)</div>
                      <div className="text-mint-400 break-all">{testResults[selectedCaseIndex].expected}</div>
                    </div>

                    <div className="bg-[#090e11] p-3 rounded-2xl border border-[#162328]">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">פלט שהתקבל (ACTUAL)</div>
                      <div
                        className={`break-all ${
                          testResults[selectedCaseIndex].passed ? 'text-mint-400' : 'text-rose-400 font-bold'
                        }`}
                      >
                        {testResults[selectedCaseIndex].actual || 'אין פלט'}
                      </div>
                    </div>
                  </div>

                  {testResults[selectedCaseIndex].error && (
                    <div className="bg-[#1c0c10] border border-[#3d1820] p-3 rounded-2xl text-rose-300 text-xs">
                      <div className="font-semibold text-rose-400 mb-0.5">שגיאת ריצה (Traceback):</div>
                      <div>{testResults[selectedCaseIndex].error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1 font-sans">
              <Code className="w-5 h-5 text-slate-600" />
              <p>טרם נרשמה הרצה של חבילת הבדיקות. לחץ על "הגש פתרון" כדי להריץ את כל הבדיקות.</p>
            </div>
          )
        ) : (
          /* Raw Standard Output / Traceback View */
          <div className="h-full overflow-y-auto space-y-2.5 pr-2">
            {executionResult ? (
              <>
                {executionResult.stderr && (
                  <div className="p-3 rounded-2xl bg-[#1c0c10] border border-[#3d1820] text-rose-300 space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-400 font-semibold text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>שגיאת ריצה (Runtime Error):</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-rose-200/90 font-mono">
                      {executionResult.stderr}
                    </pre>
                  </div>
                )}

                {executionResult.stdout ? (
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">פלט סטנדרטי (STDOUT):</div>
                    <pre className="whitespace-pre-wrap text-slate-200 bg-[#090e11] p-3 rounded-2xl border border-[#162328] font-mono">
                      {executionResult.stdout}
                    </pre>
                  </div>
                ) : (
                  !executionResult.stderr && (
                    <div className="text-slate-500 italic">הקוד רץ בהצלחה עם exit code 0 (לא הודפס פלט).</div>
                  )
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1 font-sans">
                <Terminal className="w-5 h-5 text-slate-600" />
                <p>לחץ על "הרץ קוד" כדי לבדוק קלט לדוגמה ולצפות בפלט.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
