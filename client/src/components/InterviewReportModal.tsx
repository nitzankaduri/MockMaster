import React, { useState } from 'react';
import {
  Award,
  RotateCcw,
  Printer,
  X,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Key,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
  Target,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import type { GeminiCritiqueReport, Turn } from '../services/geminiEvaluationService';
import { saveGeminiApiKey, getGeminiApiKey } from '../services/geminiVoiceService';

interface InterviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: GeminiCritiqueReport;
  turns: Turn[];
  onRestart: () => void;
  onReevaluate?: (customApiKey?: string) => Promise<void>;
  isReevaluating?: boolean;
  targetRole?: string;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  turns,
  onRestart,
  onReevaluate,
  isReevaluating = false,
  targetRole
}) => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  if (!isOpen || !report) return null;

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKeyInput);
    setShowApiKeyModal(false);
    if (onReevaluate) {
      onReevaluate(apiKeyInput);
    }
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'Strong Hire':
        return 'text-mint-300 bg-mint-950/80 border-mint-400/50 shadow-glow-mint';
      case 'Hire':
        return 'text-mint-300 bg-mint-950/60 border-mint-500/40 shadow-glow-mint';
      case 'Lean Hire':
        return 'text-amber-300 bg-amber-950/60 border-amber-500/40';
      default:
        return 'text-rose-300 bg-rose-950/60 border-rose-500/40';
    }
  };

  const getVerdictLabelHe = (verdict: string) => {
    switch (verdict) {
      case 'Strong Hire':
        return 'גיוס מומלץ מאוד (Strong Hire) — מועמד מוביל';
      case 'Hire':
        return 'מומלץ לגיוס (Hire) — התאמה טובה לתפקיד';
      case 'Lean Hire':
        return 'עובר עם הסתייגויות (Lean Hire) — נדרש חיזוק';
      default:
        return 'לא מומלץ לגיוס בשלב זה (No Hire)';
    }
  };

  const criteria = report.criteriaScores || {
    communication: 80,
    starMethodology: 75,
    problemSolving: 78,
    authenticity: 85
  };

  const star = report.starAnalysis || {
    situationCovered: true,
    taskDefined: true,
    actionExplained: true,
    resultsQuantified: false,
    verdict: 'ניתוח ראשוני של תשובות המועמד.'
  };

  const strongAnswers = report.strongAnswers || [];
  const weakAnswers = report.weakAnswers || [];
  const tips = report.concreteTips || [];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-[#0a0f14]/95 border border-mint-500/25 rounded-3xl shadow-glow-card-mint overflow-hidden text-slate-100 my-4 flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-white/5 bg-[#0d141b]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5 space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-mint-500/10 border border-mint-500/30 flex items-center justify-center shadow-glow-mint">
              <Award className="w-6 h-6 text-mint-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  דוח משוב מקיף – ראיון {targetRole ? `לתפקיד ${targetRole}` : 'HR & Behavioral'}
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    report.source === 'gemini'
                      ? 'bg-mint-950/80 text-mint-300 border-mint-500/40 shadow-glow-mint'
                      : 'bg-[#111822] text-slate-300 border-white/5'
                  }`}
                >
                  {report.source === 'gemini' ? 'Google Gemini AI Engine' : 'Heuristic Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                הערכת מנהל גיוס בכיר: מתודולוגיית STAR, שטף שפתי, אותנטיות ופתרון בעיות
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              title="הגדר מפתח Gemini API"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#111822] border border-white/5 text-slate-300 hover:text-white hover:border-mint-500/40 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-mint-400" />
              <span className="hidden sm:inline">הגדרות API</span>
            </button>

            <button
              onClick={() => window.print()}
              title="הדפס או שמור כ-PDF"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#111822] border border-white/5 text-slate-300 hover:text-white hover:border-mint-500/40 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">הדפס / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#111822] border border-white/5 text-slate-400 hover:text-white hover:border-mint-500/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Score & Verdict & Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Overall Score Circle */}
            <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                ציון התאמה סופי
              </span>
              <div className="relative my-2 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-mint-400/50 flex flex-col items-center justify-center shadow-glow-mint bg-[#090e13]">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-mint-200 to-emerald-400 font-mono tracking-tight">
                    {report.overallScore}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">מתוך 100</span>
                </div>
              </div>
              <div
                className={`px-4 py-1 rounded-full text-xs font-bold border mt-2 ${getVerdictStyles(
                  report.hiringVerdict
                )}`}
              >
                {getVerdictLabelHe(report.hiringVerdict)}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-mint-400" />
                    תקציר מנהלים מקצועי
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {report.source === 'gemini' ? 'Gemini 2.0 Flash Feedback' : 'Analytical Model'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0e161f] p-4 rounded-2xl border border-white/5 font-sans">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Quick STAR Status Strip */}
              <div className="p-3.5 rounded-2xl bg-[#0e161f] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">כיסוי שלבי STAR:</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'רקע (S)', active: star.situationCovered },
                    { label: 'משימה (T)', active: star.taskDefined },
                    { label: 'פעולה (A)', active: star.actionExplained },
                    { label: 'תוצאה (R)', active: star.resultsQuantified }
                  ].map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                        s.active
                          ? 'bg-mint-950/80 border-mint-500/40 text-mint-300 shadow-glow-mint'
                          : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {s.active ? '✓' : '✗'} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Criteria Scores Breakdown */}
          <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mint-400" />
              מדדי איכות והערכת כישורים (Criteria Scores)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'תקשורת, בהירות ושטף דיבור (Communication)',
                  score: criteria.communication,
                  color: 'from-mint-400 to-emerald-400'
                },
                {
                  label: 'מתודולוגיית מענה STAR (STAR Methodology)',
                  score: criteria.starMethodology,
                  color: 'from-teal-400 to-mint-400'
                },
                {
                  label: 'פתרון בעיות ומורכבות (Problem Solving)',
                  score: criteria.problemSolving,
                  color: 'from-emerald-400 to-cyan-400'
                },
                {
                  label: 'אותנטיות, ביטחון ויושרה מקצועית (Authenticity)',
                  score: criteria.authenticity,
                  color: 'from-mint-400 to-teal-300'
                }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5 bg-[#0e161f] p-3.5 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-mint-400 font-mono font-bold">{item.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#111822] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-glow-mint transition-all duration-1000`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: STAR Methodology Analysis Card */}
          <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-mint-400" />
                ניתוח מעמיק של מתודולוגיית STAR
              </h3>
              <span className="text-xs text-slate-400 font-mono">Situation • Task • Action • Result</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0e161f] p-4 rounded-2xl border border-white/5 font-sans">
              {star.verdict}
            </p>
          </div>

          {/* Section 4: Strong Answers & Weak Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strong Answers */}
            <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-mint-300 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-mint-400" />
                תשובות חזקות ונקודות לשימור (Strong Answers)
              </h3>
              {strongAnswers.length > 0 ? (
                <div className="space-y-3">
                  {strongAnswers.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#0e161f] border border-white/5 space-y-1.5"
                    >
                      <blockquote className="text-xs text-slate-200 italic border-r-2 border-mint-400 pr-3">
                        "{item.quote}"
                      </blockquote>
                      <p className="text-[11px] text-mint-300 leading-relaxed pt-1 font-sans">
                        <strong className="text-white ml-1">ניתוח המראיין:</strong>
                        {item.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">לא זוהו ציטוטים בולטים לשימור.</p>
              )}
            </div>

            {/* Weak Answers */}
            <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-amber-400" />
                תשובות שדורשות שיפור ודיוק (Areas to Strengthen)
              </h3>
              {weakAnswers.length > 0 ? (
                <div className="space-y-3">
                  {weakAnswers.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#0e161f] border border-white/5 space-y-1.5"
                    >
                      <blockquote className="text-xs text-slate-200 italic border-r-2 border-amber-500 pr-3">
                        "{item.quote}"
                      </blockquote>
                      <p className="text-[11px] text-amber-300 leading-relaxed pt-1 font-sans">
                        <strong className="text-white ml-1">משוב וביקורת:</strong>
                        {item.critique}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">לא נרשמו תשובות חלשות בראיון.</p>
              )}
            </div>
          </div>

          {/* Section 5: Concrete Actionable Tips */}
          {tips.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-mint-400" />
                טיפים מעשיים ומנצחים לראיון הבא (Concrete Tips)
              </h3>
              <ul className="space-y-2.5">
                {tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-200 flex items-start gap-3 leading-relaxed bg-[#0e161f] p-3.5 rounded-2xl border border-white/5 font-sans"
                  >
                    <span className="w-5 h-5 rounded-full bg-mint-950 border border-mint-500/40 text-mint-300 flex items-center justify-center font-mono text-[11px] shrink-0 mt-0.5 shadow-glow-mint">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 6: Full Dialogue Transcript Drawer */}
          <div className="p-6 rounded-3xl bg-[#0c1218]/90 border border-white/5 shadow-lg">
            <button
              onClick={() => setIsTranscriptExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-200 hover:text-mint-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-mint-400" />
                <span>תמלול מלא של מהלך הראיון ({turns.length} חילופי דברים)</span>
              </div>
              {isTranscriptExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isTranscriptExpanded && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                {turns.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                      turn.speaker === 'candidate'
                        ? 'bg-mint-950/40 border-mint-500/30 text-mint-100 mr-3'
                        : 'bg-[#0e161f] border-white/5 text-slate-200 ml-3'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-slate-400">
                      <span>{turn.speaker === 'candidate' ? 'המועמד/ת (את/ה)' : 'רותם – מראיינת HR'}</span>
                      <span className="font-mono text-[10px]">{turn.timestamp}</span>
                    </div>
                    <p>{turn.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#080d12] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#111822] hover:bg-[#16212e] border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>חזור לראיון</span>
          </button>

          <div className="flex items-center gap-2.5">
            {onReevaluate && (
              <button
                onClick={() => onReevaluate()}
                disabled={isReevaluating}
                className="px-4 py-2.5 rounded-full bg-[#111822] hover:bg-[#16212e] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-mint-400 ${isReevaluating ? 'animate-spin' : ''}`} />
                <span>{isReevaluating ? 'מעריך מחדש...' : 'הערך מחדש עם Gemini'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onRestart();
              }}
              className="btn-mint-hero px-6 py-2.5 rounded-full font-bold text-xs shadow-glow-mint flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>התחל ראיון חדש</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini API Key Configuration Submodal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0f14] border border-mint-500/30 rounded-3xl p-6 shadow-glow-card-mint space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-mint-400" />
                <h3 className="text-sm font-bold text-white">הגדרת מפתח Google Gemini API</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="w-7 h-7 rounded-full bg-[#111822] text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              הזן מפתח API של Google Gemini עבור הפקת קול טבעי (Gemini 2.0 Flash Audio) ודוח הערכה מעמיק. המפתח נשמר בדפדפן המקומי בלבד (localStorage).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Gemini API Key:</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-full bg-[#111822] border border-white/10 text-xs text-slate-100 outline-none focus:border-mint-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-mint-400 hover:underline flex items-center gap-1 font-sans"
              >
                <span>השג מפתח חינם ב-Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-full bg-[#111822] border border-white/10 text-xs text-slate-300 hover:bg-[#16212e]"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="btn-mint-hero px-5 py-2 rounded-full text-xs font-bold shadow-glow-mint"
                >
                  שמור והערך מחדש
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
