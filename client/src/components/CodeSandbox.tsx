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
    <div className="h-full flex flex-col bg-[#070a10] overflow-hidden select-none">
      {/* Top Multi-Tab Header Bar */}
      <div className="h-11 px-3 border-b border-cyan-500/20 bg-[#0c111e]/90 flex items-center justify-between">
        {/* Navigation Tabs: Editor, Problem Specs, Custom Tests, Metrics */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 bg-[#070a12] p-0.5 rounded-xl border border-cyan-500/20">
            <button
              onClick={() => setActiveSandboxTab('editor')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSandboxTab === 'editor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab('specs')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSandboxTab === 'specs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Problem Specs</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab('testcases')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSandboxTab === 'testcases'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Cases</span>
              {customTestCases.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>

            <button
              onClick={() => setActiveSandboxTab('metrics')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSandboxTab === 'metrics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              <span>Performance</span>
              {testResults && (
                <span className={`text-[10px] px-1 rounded-full ${passPercent === 100 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                  {passPercent}%
                </span>
              )}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden lg:block mx-1" />

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center space-x-1 bg-[#070a12] p-0.5 rounded-lg border border-slate-800">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  language === lang.id
                    ? 'bg-[#151c30] text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Copy, Reset, Run, Submit */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 rounded-lg bg-[#111625] hover:bg-[#161f36] border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onResetCode}
            title="Reset Starter Code"
            className="p-1.5 rounded-lg bg-[#111625] hover:bg-[#161f36] border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Run Code Button */}
          <button
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="px-3 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253f] border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center space-x-1.5 transition-all disabled:opacity-40 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Drawer Content Based on Active Tab */}
      <div className="flex-1 w-full relative overflow-hidden">
        {/* Tab 1: Monaco Code Editor */}
        {activeSandboxTab === 'editor' && (
          <div className="h-full w-full relative">
            <Editor
              height="100%"
              language={activeLangConfig.monacoId}
              value={code}
              onChange={(val) => onCodeChange(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
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
                suggestOnTriggerCharacters: true
              }}
              loading={
                <div className="h-full flex items-center justify-center text-slate-500 text-xs space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  <span>Loading Monaco Sandbox...</span>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 2: Problem Specs */}
        {activeSandboxTab === 'specs' && (
          <div className="h-full w-full bg-[#080c16]">
            <ProblemDescription problem={problem} />
          </div>
        )}

        {/* Tab 3: Custom Test Cases Drawer */}
        {activeSandboxTab === 'testcases' && (
          <div className="h-full w-full overflow-y-auto p-4 space-y-4 bg-[#080c16] text-xs">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Test Case Configuration
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Add custom test arguments or inspect predefined test cases.
                </p>
              </div>
            </div>

            {/* Predefined Test Cases */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Predefined Test Suite ({problem.testCases.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {problem.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0c111e] border border-slate-800 space-y-1.5 font-mono text-xs"
                  >
                    <div className="text-cyan-400 font-semibold text-[11px]">Case {idx + 1}</div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">Input: </span>
                      {tc.input}
                    </div>
                    <div className="text-emerald-300">
                      <span className="text-slate-500">Expected: </span>
                      {tc.expected}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Test Cases Added by Candidate */}
            <div className="space-y-2 pt-2 border-t border-cyan-500/15">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Custom Test Cases ({customTestCases.length})
              </span>

              {customTestCases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {customTestCases.map(ctc => (
                    <div
                      key={ctc.id}
                      className="p-3 rounded-xl bg-[#0e1424] border border-cyan-500/30 space-y-1.5 font-mono text-xs relative group"
                    >
                      <button
                        onClick={() => onRemoveCustomTestCase(ctc.id)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete custom test case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-cyan-300 font-semibold text-[11px]">Custom Input</div>
                      <div className="text-slate-200">{ctc.input}</div>
                      {ctc.expected && (
                        <div className="text-emerald-300">
                          <span className="text-slate-500">Expected: </span>
                          {ctc.expected}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#0c111e] border border-dashed border-slate-800 text-slate-500 text-center text-xs">
                  No custom test cases added yet. Add one below!
                </div>
              )}
            </div>

            {/* Add New Custom Case Input Form */}
            <div className="p-3.5 rounded-xl bg-[#0e1322] border border-cyan-500/25 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Custom Test Argument</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCaseInput}
                  onChange={e => setNewCaseInput(e.target.value)}
                  placeholder={`Input (e.g. ${problem.examples[0]?.input || 'test input'})`}
                  className="bg-[#070a12] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="text"
                  value={newCaseExpected}
                  onChange={e => setNewCaseExpected(e.target.value)}
                  placeholder="Expected output (optional)"
                  className="bg-[#070a12] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                onClick={handleAddCase}
                disabled={!newCaseInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Test Suite</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Performance & AI Metrics Drawer */}
        {activeSandboxTab === 'metrics' && (
          <div className="h-full w-full overflow-y-auto p-4 space-y-4 bg-[#080c16] text-xs">
            <div className="border-b border-cyan-500/20 pb-3">
              <h3 className="font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Performance & Complexity Diagnostics</span>
              </h3>
              <p className="text-slate-400 text-[11px]">
                Real-time execution analytics and Big-O efficiency analysis.
              </p>
            </div>

            {/* Metrics Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Execution Duration */}
              <div className="p-3.5 rounded-xl bg-[#0c111e] border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Execution Speed</span>
                </div>
                <div className="text-xl font-mono font-bold text-cyan-300">
                  {executionResult?.executionTime || '0 ms'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Remote Sandbox Execution
                </div>
              </div>

              {/* Memory Estimate */}
              <div className="p-3.5 rounded-xl bg-[#0c111e] border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>Memory Allocated</span>
                </div>
                <div className="text-xl font-mono font-bold text-violet-300">
                  {executionResult?.memory || '3,420 KB'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Heap & Runtime overhead
                </div>
              </div>

              {/* Test Suite Pass Rate */}
              <div className="p-3.5 rounded-xl bg-[#0c111e] border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold uppercase font-mono">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Pass Rate</span>
                </div>
                <div className="text-xl font-mono font-bold text-emerald-300">
                  {totalCount > 0 ? `${passPercent}%` : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {totalCount > 0 ? `${passedCount}/${totalCount} cases passed` : 'Run submit to evaluate'}
                </div>
              </div>
            </div>

            {/* Complexity Benchmark Card */}
            <div className="p-4 rounded-xl bg-[#0e1322] border border-cyan-500/25 space-y-3">
              <div className="font-bold text-slate-200 uppercase tracking-wider font-mono text-xs">
                Big-O Complexity Evaluation
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold font-mono">TARGET TIME COMPLEXITY</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {problem.optimalTimeComplexity}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Single pass / optimal search boundary
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#080c16] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold font-mono">TARGET SPACE COMPLEXITY</div>
                  <div className="text-sm font-bold text-indigo-400 font-mono">
                    {problem.optimalSpaceComplexity}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Auxiliary memory footprint
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interviewer Socratic Summary */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0e1322] to-violet-950/40 border border-cyan-500/30 space-y-1.5">
              <div className="text-cyan-300 font-bold text-xs uppercase tracking-wider font-mono">
                AI Interviewer Verdict
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {passPercent === 100
                  ? `Your solution is fully verified against all ${totalCount} test cases! When ready, discuss your Big-O time and space trade-offs with the interviewer agent.`
                  : totalCount > 0
                  ? `Your solution resolved ${passedCount} out of ${totalCount} test cases. Review the failing edge cases in the Console Output below.`
                  : `Click "Submit" in the top bar to run the full test suite and generate a detailed algorithmic verdict.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
