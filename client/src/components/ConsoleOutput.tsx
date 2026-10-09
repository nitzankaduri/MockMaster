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
      className={`border-t border-cyan-500/20 bg-[#070a10] flex flex-col transition-all duration-200 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)] ${
        isExpanded ? 'h-80' : 'h-48'
      }`}
    >
      {/* Console Top Header & Tabs */}
      <div className="h-9 px-3 border-b border-cyan-500/20 bg-[#0c111e]/90 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-mono font-bold mr-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TERMINAL</span>
          </div>

          {/* Tab Switchers */}
          <div className="flex items-center space-x-1 bg-[#070a12] p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'tests'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Test Suite</span>
              {testResults && (
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    allPassed
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {passedCount}/{totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'raw'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Stdout / Stderr</span>
              {hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
            </button>
          </div>
        </div>

        {/* Execution Metrics & Expand Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          {executionResult?.executionTime && (
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-300">{executionResult.executionTime}</span>
            </div>
          )}

          {executionResult?.memory && (
            <div className="hidden sm:flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
              <Cpu className="w-3 h-3 text-violet-400" />
              <span className="text-slate-300">{executionResult.memory}</span>
            </div>
          )}

          {executionResult && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                executionResult.code === 0 && !executionResult.stderr
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-950/70 border-rose-700 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
              }`}
            >
              {executionResult.code === 0 && !executionResult.stderr ? 'EXIT 0' : 'EXIT 1 (ERROR)'}
            </span>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Collapse Terminal' : 'Expand Terminal'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="flex-1 overflow-hidden p-3 font-mono text-xs select-text">
        {isRunning || isSubmitting ? (
          <div className="h-full flex items-center justify-center space-x-2.5 text-cyan-400 font-mono">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="animate-pulse">Executing code in remote sandbox...</span>
          </div>
        ) : activeTab === 'tests' ? (
          /* Test Suite View */
          testResults && testResults.length > 0 ? (
            <div className="h-full flex flex-col space-y-2">
              {/* Test Case Selectors */}
              <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
                {testResults.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all ${
                      selectedCaseIndex === idx
                        ? 'bg-[#151d33] text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-[#0c111e] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tc.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>Case {idx + 1}</span>
                  </button>
                ))}
              </div>

              {/* Selected Test Case Detail */}
              {testResults[selectedCaseIndex] && (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                      Test Case #{selectedCaseIndex + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        testResults[selectedCaseIndex].passed
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-rose-950 text-rose-300 border-rose-700 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      {testResults[selectedCaseIndex].passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">INPUT</div>
                      <div className="text-slate-200 break-all">{testResults[selectedCaseIndex].input}</div>
                    </div>

                    <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">EXPECTED OUTPUT</div>
                      <div className="text-emerald-400 break-all">{testResults[selectedCaseIndex].expected}</div>
                    </div>

                    <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-semibold mb-1">ACTUAL OUTPUT</div>
                      <div
                        className={`break-all ${
                          testResults[selectedCaseIndex].passed ? 'text-emerald-400' : 'text-rose-400 font-bold'
                        }`}
                      >
                        {testResults[selectedCaseIndex].actual || 'No output'}
                      </div>
                    </div>
                  </div>

                  {testResults[selectedCaseIndex].error && (
                    <div className="bg-rose-950/40 border border-rose-800/80 p-2.5 rounded-lg text-rose-300 text-xs">
                      <div className="font-semibold text-rose-400 mb-0.5">Traceback:</div>
                      <div>{testResults[selectedCaseIndex].error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
              <Code className="w-5 h-5 text-slate-600" />
              <p>No test suite execution recorded yet. Click "Submit" to run the full test suite.</p>
            </div>
          )
        ) : (
          /* Raw Standard Output / Traceback View */
          <div className="h-full overflow-y-auto space-y-2 pr-2">
            {executionResult ? (
              <>
                {executionResult.stderr && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-400 font-semibold text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Runtime Error Traceback:</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-rose-200/90 font-mono">
                      {executionResult.stderr}
                    </pre>
                  </div>
                )}

                {executionResult.stdout ? (
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">STANDARD OUTPUT (STDOUT):</div>
                    <pre className="whitespace-pre-wrap text-slate-200 bg-[#0b101c] p-2.5 rounded-lg border border-slate-800/80 font-mono">
                      {executionResult.stdout}
                    </pre>
                  </div>
                ) : (
                  !executionResult.stderr && (
                    <div className="text-slate-500 italic">Code executed with exit code 0 (no output printed).</div>
                  )
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
                <Terminal className="w-5 h-5 text-slate-600" />
                <p>Click "Run Code" to execute sample input and inspect stdout.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
