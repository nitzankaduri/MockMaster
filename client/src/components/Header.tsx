import { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  Layers,
  Code2,
  Languages
} from 'lucide-react';
import type { CodingProblem } from '../types';
import { ProblemModal } from './ProblemModal';

export type AppMode = 'coding_sandbox' | 'hebrew_interview';

interface HeaderProps {
  currentProblem: CodingProblem;
  onSelectProblem: (problem: CodingProblem) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetSession: () => void;
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProblem,
  onSelectProblem,
  isListening,
  onToggleListening,
  isSpeaking,
  isMuted,
  onToggleMute,
  onResetSession,
  activeMode,
  onSelectMode
}) => {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff: CodingProblem['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
    }
  };

  return (
    <>
      <header className="h-14 border-b border-cyan-500/20 bg-[#0a0d14]/95 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-100 tracking-tight text-sm font-mono">
                  MockMaster
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Prominent Mode Switcher */}
          <div className="flex items-center bg-[#0d121f] p-1 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <button
              onClick={() => onSelectMode('coding_sandbox')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'coding_sandbox'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>LeetCode Sandbox</span>
            </button>

            <button
              onClick={() => onSelectMode('hebrew_interview')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'hebrew_interview'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] ring-1 ring-violet-400/50'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="font-bold">ראיון בעברית (HR / Tech)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                חדש
              </span>
            </button>
          </div>

          {/* Problem Selector Trigger (Only in Coding Mode) */}
          {activeMode === 'coding_sandbox' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-[#151c30] border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-medium text-slate-200 transition-all shadow-sm group"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="truncate max-w-[130px] font-medium text-slate-100">
                {currentProblem.title}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] border font-bold ${getDifficultyBadge(
                  currentProblem.difficulty
                )}`}
              >
                {currentProblem.difficulty}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </button>
          )}
        </div>

        {/* Center: Live Timer (Coding Mode) */}
        {activeMode === 'coding_sandbox' && (
          <div className="hidden md:flex items-center space-x-2 bg-[#0d121f] border border-cyan-500/20 px-3 py-1 rounded-full text-xs text-slate-300 font-mono shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-200 tracking-widest font-bold">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(prev => !prev)}
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
              className="hover:text-cyan-400 text-slate-400 ml-1 transition-colors"
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setTimerSeconds(0)}
              title="Reset Timer"
              className="hover:text-cyan-400 text-slate-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Right Controls: Audio & Actions (Coding Mode) */}
        {activeMode === 'coding_sandbox' && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Audio TTS Mute Toggle */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-[#0f1422] border-slate-800 text-slate-500 hover:text-slate-300'
                  : isSpeaking
                  ? 'bg-violet-950/60 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse'
                  : 'bg-[#0f1422] border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Voice Mic Toggle */}
            <button
              onClick={onToggleListening}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                isListening
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                  : 'bg-[#0f1422] border-slate-800 text-slate-300 hover:text-slate-100 hover:border-cyan-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-0.5" />
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Listening...</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Mic Off</span>
                </>
              )}
            </button>

            {/* Restart Session */}
            <button
              onClick={onResetSession}
              title="Reset Interview Session"
              className="p-2 rounded-xl bg-[#0f1422] border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Label (Hebrew Mode) */}
        {activeMode === 'hebrew_interview' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cyan-300 font-mono hidden sm:inline">
              Hebrew Mock Interviewer v1.0
            </span>
          </div>
        )}
      </header>

      {/* Problem Selection Modal */}
      <ProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProblemId={currentProblem.id}
        onSelectProblem={onSelectProblem}
      />
    </>
  );
};

