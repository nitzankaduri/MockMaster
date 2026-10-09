import { useState } from 'react';
import {
  Radio,
  Sparkles,
  ChevronDown,
  Quote,
  ShieldAlert,
  HeartHandshake
} from 'lucide-react';
import type {
  AvatarVisualState,
  InterviewMood,
  PersonaType
} from '../types';
import { PERSONAS } from '../services/interviewerPersona';

interface InterviewerAvatarProps {
  visualState: AvatarVisualState;
  personaType: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  mood: InterviewMood;
  currentCaption: string;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  visualState,
  personaType,
  onSelectPersona,
  mood,
  currentCaption
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activePersona = PERSONAS[personaType];

  const getMoodBadge = (m: InterviewMood) => {
    switch (m) {
      case 'Attentive':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
      case 'Evaluating Strategy':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'Probing Trade-offs':
        return 'bg-violet-950/70 text-violet-300 border-violet-500/40';
      case 'Analyzing Traceback':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 'Complexity Review':
        return 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40';
      case 'Impressed':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusLabel = () => {
    switch (visualState) {
      case 'SPEAKING':
        return { label: 'Speaking', color: 'text-cyan-400 bg-cyan-950 border-cyan-500/50' };
      case 'LISTENING':
        return { label: 'Listening...', color: 'text-rose-400 bg-rose-950 border-rose-500/50' };
      case 'THINKING':
        return { label: 'Evaluating...', color: 'text-violet-400 bg-violet-950 border-violet-500/50' };
      case 'IDLE':
      default:
        return { label: 'Active', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  const statusLabel = getStatusLabel();

  return (
    <div className="flex flex-col bg-gradient-to-b from-[#0c111e] via-[#090d18] to-[#080c16] border-b border-cyan-500/20 p-4 relative select-none">
      {/* Top HUD: Seniority & Persona Switcher */}
      <div className="flex items-center justify-between mb-3 z-20">
        {/* Persona Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#111728] hover:bg-[#161f36] border border-cyan-500/30 text-xs text-slate-200 transition-all shadow-sm"
          >
            {personaType === 'mentor' ? (
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
            )}
            <span className="font-bold tracking-wide font-mono text-[11px] text-slate-100">
              {activePersona.name}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              ({personaType === 'mentor' ? 'Mentor' : 'Bar Raiser'})
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-[#0e1424] border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Select Interviewer Persona
              </div>

              {(Object.keys(PERSONAS) as PersonaType[]).map(key => {
                const p = PERSONAS[key];
                const isSelected = p.id === personaType;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start space-x-2.5 transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/15 border-l-2 border-cyan-400 text-slate-100'
                        : 'hover:bg-[#151c30] text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {p.id === 'mentor' ? (
                        <HeartHandshake className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs">{p.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {p.seniority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {p.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood Indicator Badge */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono border ${getMoodBadge(
              mood
            )}`}
          >
            {mood}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center space-x-1 ${statusLabel.color}`}
          >
            {visualState === 'SPEAKING' && <Radio className="w-2.5 h-2.5 animate-spin" />}
            {visualState === 'LISTENING' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5" />
            )}
            <span>{statusLabel.label}</span>
          </span>
        </div>
      </div>

      {/* Stylized High-Tech Visual Hologram Avatar */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Animated Ambient Holographic Rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 120">
            {/* Outer dotted orbital ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                visualState === 'SPEAKING'
                  ? 'rgba(6, 182, 212, 0.6)'
                  : visualState === 'LISTENING'
                  ? 'rgba(244, 63, 94, 0.6)'
                  : visualState === 'THINKING'
                  ? 'rgba(139, 92, 246, 0.8)'
                  : 'rgba(51, 65, 85, 0.4)'
              }
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className={
                visualState === 'THINKING'
                  ? 'animate-spin-slow'
                  : visualState === 'SPEAKING'
                  ? 'animate-spin-slow'
                  : ''
              }
            />

            {/* Middle Rotating Radar Arcs */}
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke={
                visualState === 'SPEAKING'
                  ? 'rgba(6, 182, 212, 0.8)'
                  : visualState === 'LISTENING'
                  ? 'rgba(244, 63, 94, 0.7)'
                  : visualState === 'THINKING'
                  ? 'rgba(168, 85, 247, 0.9)'
                  : 'rgba(71, 85, 105, 0.3)'
              }
              strokeWidth="2"
              strokeDasharray={
                visualState === 'THINKING'
                  ? '20 30 10 30'
                  : visualState === 'SPEAKING'
                  ? '30 20 40 20'
                  : '15 45'
              }
              className={
                visualState === 'THINKING'
                  ? 'animate-spin-reverse-slow'
                  : visualState === 'LISTENING'
                  ? 'animate-pulse'
                  : ''
              }
            />
          </svg>

          {/* Hologram Core Glow */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              visualState === 'SPEAKING'
                ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 shadow-[0_0_35px_rgba(6,182,212,0.6)] scale-105 ring-2 ring-cyan-400'
                : visualState === 'LISTENING'
                ? 'bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 shadow-[0_0_35px_rgba(244,63,94,0.6)] ring-2 ring-rose-400'
                : visualState === 'THINKING'
                ? 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-600 shadow-[0_0_30px_rgba(139,92,246,0.6)] ring-2 ring-violet-400 animate-pulse'
                : 'bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 shadow-md'
            }`}
          >
            {/* Visualizer Wave Inside Core */}
            <div className="flex items-center space-x-1">
              {[0.1, 0.4, 0.7, 0.2, 0.6].map((delay, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    visualState === 'SPEAKING'
                      ? 'bg-white animate-sound-wave'
                      : visualState === 'LISTENING'
                      ? 'bg-rose-200 animate-pulse'
                      : visualState === 'THINKING'
                      ? 'bg-violet-200 animate-ping'
                      : 'bg-slate-500 h-2'
                  }`}
                  style={{
                    animationDelay: `${delay}s`,
                    height: visualState === 'SPEAKING' ? undefined : visualState === 'LISTENING' ? '12px' : '4px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Persona Identity Plate */}
        <div className="text-center mt-2 space-y-0.5">
          <div className="flex items-center justify-center space-x-1.5">
            <h2 className="text-xs font-bold text-slate-100 font-mono tracking-wider">
              {activePersona.name}
            </h2>
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </div>
          <p className="text-[11px] text-slate-400">
            {activePersona.title} • <span className="text-slate-500">{activePersona.company}</span>
          </p>
        </div>
      </div>

      {/* Live Subtitles HUD Banner */}
      <div className="mt-2 min-h-[52px] rounded-xl bg-[#060913]/90 border border-cyan-500/25 p-2.5 flex items-start space-x-2 shadow-[inset_0_1px_6px_rgba(0,0,0,0.6)]">
        <Quote className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 opacity-80" />
        <div className="flex-1 text-[11px] leading-relaxed select-text font-sans">
          {currentCaption ? (
            <p className="text-cyan-200 animate-in fade-in duration-150">
              {currentCaption}
            </p>
          ) : visualState === 'LISTENING' ? (
            <p className="text-rose-300 italic font-mono text-[10px]">
              Listening to candidate voice input... (Barge-in active)
            </p>
          ) : visualState === 'THINKING' ? (
            <p className="text-violet-300 italic font-mono text-[10px]">
              Analyzing algorithm and testing execution traces...
            </p>
          ) : (
            <p className="text-slate-500 italic text-[11px]">
              {activePersona.styleDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
