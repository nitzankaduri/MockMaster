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
        return { label: 'שלב 1: הקשר ואסטרטגיה', color: 'bg-[#0b1614] text-[#2dd4bf] border-[#133d34]' };
      case 'PROBLEM_CLARIFICATION':
        return { label: 'שלב 2: הבהרת הבעיה', color: 'bg-[#091518] text-teal-300 border-[#14373e]' };
      case 'CODING':
        return { label: 'שלב 3: כתיבת קוד בארגז חול', color: 'bg-[#18150c] text-amber-300 border-[#3d3215]' };
      case 'REVIEW_AND_COMPLEXITY':
        return { label: 'שלב 4: סקירת סיבוכיות Big-O', color: 'bg-[#121820] text-sky-300 border-[#1f2d3d]' };
      case 'COMPLETED':
        return { label: 'שלב 5: הושלם בהצלחה', color: 'bg-[#0a1811] text-emerald-300 border-[#13442a]' };
    }
  };

  const stageBadge = getStageBadge(interviewState);

  return (
    <div className="h-full flex flex-col bg-[#060809] border-r border-[#141e22] select-none overflow-hidden">
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
      <div className="px-4 py-2 bg-[#080c0e] border-b border-[#141e22] flex items-center justify-between text-[11px] shrink-0" dir="rtl">
        <div className="flex items-center space-x-2 space-x-reverse text-slate-400">
          <Clock className="w-3 h-3 text-[#2dd4bf]" />
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${stageBadge.color}`}>
            {stageBadge.label}
          </span>
        </div>

        <button
          onClick={() => setIsHistoryCollapsed(prev => !prev)}
          className="flex items-center space-x-1 space-x-reverse text-slate-400 hover:text-[#2dd4bf] transition-colors text-[10px]"
        >
          <History className="w-3 h-3 text-[#2dd4bf]" />
          <span>{isHistoryCollapsed ? 'הצג היסטוריית שיחה' : 'הסתר היסטוריה'}</span>
          {isHistoryCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* 3. Collapsible Conversation History Log */}
      {!isHistoryCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text bg-[#060809]/90">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                  msg.sender === 'ai'
                    ? personaType === 'mentor'
                      ? 'bg-gradient-to-tr from-[#064e3b] via-[#059669] to-[#2dd4bf] text-white shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                      : 'bg-gradient-to-tr from-[#065f46] via-[#047857] to-[#10b981] text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#121c20] text-slate-200 border border-[#1b2b31]'
                }`}
              >
                {msg.sender === 'ai' ? <Sparkles className="w-3.5 h-3.5 text-mint-200" /> : <User className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-[#0a0f12] border border-[#162328] text-slate-200 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.3)] text-right'
                    : 'bg-gradient-to-r from-[#10b981] to-[#0d9488] text-white rounded-tr-sm shadow-[0_2px_15px_rgba(16,185,129,0.25)] text-right font-medium'
                }`}
                dir="rtl"
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div
                  className={`mt-1 text-[9px] text-left font-mono ${
                    msg.sender === 'ai' ? 'text-slate-500' : 'text-emerald-100/70'
                  }`}
                  dir="ltr"
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Live Interim Speech Bubble */}
          {interimTranscript && (
            <div className="flex items-start space-x-2.5 flex-row-reverse space-x-reverse">
              <div className="w-7 h-7 rounded-full bg-rose-600/80 text-white flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed bg-[#1a0c0e] border border-rose-500/40 text-rose-200 italic rounded-tr-sm text-right" dir="rtl">
                <span>{interimTranscript} ...</span>
              </div>
            </div>
          )}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="flex items-start space-x-2.5 animate-in fade-in duration-200">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#064e3b] to-[#2dd4bf] text-[#022019] flex items-center justify-center shrink-0 shadow-md shadow-mint-500/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#022019]" />
              </div>
              <div className="rounded-2xl px-3.5 py-2.5 text-xs bg-[#090e11] border border-[#1b2b31] text-mint-300 flex items-center space-x-2 space-x-reverse rounded-tl-sm shadow-md" dir="rtl">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping shrink-0" />
                <span className="italic">חושב/ת ומנתח/ת את הבעיה...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* 4. Socratic Quick Action Chips (ZeBeyond rounded pills) */}
      <div className="px-3.5 py-2.5 border-t border-[#141e22] bg-[#070b0d] flex items-center space-x-2 space-x-reverse overflow-x-auto text-[11px] shrink-0" dir="rtl">
        <button
          onClick={onRequestHint}
          title="קבל רמז סוקרטי הדרגתי מבלי לקלקל את התשובה המלאה"
          className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-full bg-[#18150c] hover:bg-[#241f12] text-amber-300 border border-[#3d3215] shrink-0 transition-all font-medium shadow-sm"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>בקש רמז ({hintIndex + 1}/{problem.hints.length})</span>
        </button>

        <button
          onClick={() => onSendMessage("אני שוקל להשתמש במבנה נתונים אופטימלי כדי לפתור את הבעיה.")}
          className="px-3 py-1.5 rounded-full bg-[#0c1214] hover:bg-[#121c20] text-slate-300 hover:text-white border border-[#1b282d] hover:border-[#2dd4bf]/40 shrink-0 transition-all"
        >
          הצע כיוון לפתרון
        </button>

        <button
          onClick={() => onSendMessage("תוכל לחדד לי את אילוצי הקלט ומקרי הקצה שיש לשים אליהם לב?")}
          className="px-3 py-1.5 rounded-full bg-[#0c1214] hover:bg-[#121c20] text-slate-300 hover:text-white border border-[#1b282d] hover:border-[#2dd4bf]/40 shrink-0 transition-all flex items-center space-x-1 space-x-reverse"
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>הבהר מקרי קצה</span>
        </button>

        <button
          onClick={() => onSendMessage(`סיבוכיות הזמן היא ${problem.optimalTimeComplexity} וסיבוכיות המקום היא ${problem.optimalSpaceComplexity}.`)}
          className="px-3 py-1.5 rounded-full bg-[#0c1214] hover:bg-[#121c20] text-slate-300 hover:text-white border border-[#1b282d] hover:border-[#2dd4bf]/40 shrink-0 transition-all"
        >
          הסבר סיבוכיות Big-O
        </button>
      </div>

      {/* 5. Voice & Text Input Bar */}
      <div className="p-3 border-t border-[#141e22] bg-[#080c0e]/95 shrink-0">
        <div className="flex items-center space-x-2">
          {/* Mic Toggle with Barge-in indicator */}
          <button
            onClick={onToggleListening}
            title={isListening ? 'עצור האזנה קולית' : 'התחל שיחה קולית עם המראיין'}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                : 'bg-[#0b1012] border-[#1b282d] text-slate-300 hover:text-white hover:border-[#2dd4bf]/40'
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
              dir="rtl"
              placeholder={
                isListening
                  ? 'האזנה רציפה פעילה... דבר או הקלד כאן'
                  : 'דבר או הקלד את אסטרטגיית הפתרון שלך בעברית...'
              }
              className="w-full bg-[#080d0f] border border-[#1b282d] rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf]/60 focus:ring-1 focus:ring-[#2dd4bf]/40 text-right transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            title="שלח הודעה"
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#10b981] hover:from-[#5eead4] hover:to-[#2ee59d] disabled:opacity-30 text-[#022019] font-bold transition-all shadow-[0_0_15px_rgba(45,212,191,0.35)] flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
