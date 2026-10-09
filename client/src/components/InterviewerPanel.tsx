import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Lightbulb,
  HelpCircle,
  Clock,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type {
  AvatarVisualState,
  CodingProblem,
  InterviewMood,
  InterviewState,
  Message,
  PersonaType
} from '../types';
import { InterviewerAvatar } from './InterviewerAvatar';

interface InterviewerPanelProps {
  problem: CodingProblem;
  interviewState: InterviewState;
  personaType: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  mood: InterviewMood;
  visualState: AvatarVisualState;
  currentCaption: string;
  messages: Message[];
  hintIndex: number;
  onSendMessage: (text: string) => void;
  onRequestHint: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  interimTranscript?: string;
  isAiThinking?: boolean;
}

export const InterviewerPanel: React.FC<InterviewerPanelProps> = ({
  problem,
  interviewState,
  personaType,
  onSelectPersona,
  mood,
  visualState,
  currentCaption,
  messages,
  hintIndex,
  onSendMessage,
  onRequestHint,
  isListening,
  onToggleListening,
  interimTranscript = '',
  isAiThinking = false
}) => {
  const [inputText, setInputText] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isAiThinking]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStageBadge = (state: InterviewState) => {
    switch (state) {
      case 'GREETING':
        return { label: 'Phase 1: Context & Strategy', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'PROBLEM_CLARIFICATION':
        return { label: 'Phase 2: Clarification', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'CODING':
        return { label: 'Phase 3: Coding Sandbox', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'REVIEW_AND_COMPLEXITY':
        return { label: 'Phase 4: Complexity Review', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' };
      case 'COMPLETED':
        return { label: 'Phase 5: Problem Completed', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    }
  };

  const stageBadge = getStageBadge(interviewState);

  return (
    <div className="h-full flex flex-col bg-[#070b14] border-r border-cyan-500/20 backdrop-blur-xl select-none overflow-hidden">
      {/* 1. VISUAL INTERVIEWER AVATAR & HUD (Dominant top section) */}
      <div className="shrink-0">
        <InterviewerAvatar
          visualState={visualState}
          personaType={personaType}
          onSelectPersona={onSelectPersona}
          mood={mood}
          currentCaption={currentCaption}
        />
      </div>

      {/* 2. Stage & Transcript Toolbar */}
      <div className="px-4 py-1.5 bg-[#090e1a] border-b border-cyan-500/15 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span className={`px-2 py-0.2 rounded-full border text-[10px] font-semibold ${stageBadge.color}`}>
            {stageBadge.label}
          </span>
        </div>

        <button
          onClick={() => setIsHistoryCollapsed(prev => !prev)}
          className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300 transition-colors text-[10px] font-mono"
        >
          <History className="w-3 h-3 text-cyan-400" />
          <span>{isHistoryCollapsed ? 'Show History' : 'Hide History'}</span>
          {isHistoryCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* 3. Collapsible Conversation History Log */}
      {!isHistoryCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text bg-[#070a12]/80">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-md ${
                  msg.sender === 'ai'
                    ? personaType === 'mentor'
                      ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 text-white shadow-cyan-500/20'
                      : 'bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-700 text-white shadow-violet-500/20'
                    : 'bg-[#1e2942] text-slate-200 border border-slate-700'
                }`}
              >
                {msg.sender === 'ai' ? <Sparkles className="w-3.5 h-3.5 text-cyan-200" /> : <User className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-[#0e1424] border border-cyan-500/20 text-slate-200 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                    : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_2px_12px_rgba(6,182,212,0.25)]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1 text-[9px] text-right font-mono ${
                    msg.sender === 'ai' ? 'text-slate-500' : 'text-cyan-200/70'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Live Interim Speech Bubble */}
          {interimTranscript && (
            <div className="flex items-start space-x-2.5 flex-row-reverse space-x-reverse">
              <div className="w-7 h-7 rounded-lg bg-rose-600/80 text-white flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed bg-rose-950/60 border border-rose-500/40 text-rose-200 italic rounded-tr-sm">
                <span>{interimTranscript} ...</span>
              </div>
            </div>
          )}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="flex items-start space-x-2.5 animate-in fade-in duration-200">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
              </div>
              <div className="rounded-2xl px-3.5 py-2.5 text-xs bg-[#0e1424] border border-cyan-500/30 text-cyan-200 flex items-center space-x-2 rounded-tl-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="italic">Thinking & analyzing problem...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* 4. Socratic Quick Action Chips */}
      <div className="px-3 py-2 border-t border-cyan-500/15 bg-[#080c16] flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0">
        <button
          onClick={onRequestHint}
          title="Get a progressive Socratic hint without spoiling the answer"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 shrink-0 transition-all font-medium shadow-sm"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Ask for Hint ({hintIndex + 1}/{problem.hints.length})</span>
        </button>

        <button
          onClick={() => onSendMessage("I'm thinking of using an optimal data structure to solve this.")}
          className="px-2.5 py-1 rounded-lg bg-[#111625] hover:bg-[#161d30] text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          Propose Approach
        </button>

        <button
          onClick={() => onSendMessage("Can you clarify the input constraints and edge cases?")}
          className="px-2.5 py-1 rounded-lg bg-[#111625] hover:bg-[#161d30] text-slate-300 border border-slate-800 shrink-0 transition-colors flex items-center space-x-1"
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Clarify Edge Cases</span>
        </button>

        <button
          onClick={() => onSendMessage(`The time complexity is ${problem.optimalTimeComplexity} and space complexity is ${problem.optimalSpaceComplexity}.`)}
          className="px-2.5 py-1 rounded-lg bg-[#111625] hover:bg-[#161d30] text-slate-300 border border-slate-800 shrink-0 transition-colors"
        >
          Explain Complexity
        </button>
      </div>

      {/* 5. Voice & Text Input Bar */}
      <div className="p-3 border-t border-cyan-500/20 bg-[#0a0f1c]/95 shrink-0">
        <div className="flex items-center space-x-2">
          {/* Mic Toggle with Barge-in indicator */}
          <button
            onClick={onToggleListening}
            title={isListening ? 'Stop listening' : 'Start speaking with interviewer'}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                : 'bg-[#111625] border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text Input Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Continuous voice active (barge-in ready)... or type here'
                  : 'Speak or type your solution strategy...'
              }
              className="w-full bg-[#080c16] border border-cyan-500/20 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-30 text-white transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
