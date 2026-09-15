import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minus,
  RotateCcw,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  /** Answer options that came with this reply, from the protocol chunk itself. */
  options?: string[];
  /** True when no protocol matched closely enough and the reply is general guidance. */
  offProtocol?: boolean;
  /** Which protocol document the question came from, shown for transparency. */
  sourceLabel?: string;
}

interface IntakeStage {
  index: number;
  total: number;
  label: string;
}

/** The four stages a patient moves through. Mirrors deriveStage() on the server. */
const STAGE_LABELS = [
  'Symptom',
  'Duration & severity',
  'History',
  'Summary',
];

interface PopupChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  initialPrompt?: string;
}

const QUICK_SUGGESTIONS = [
  'My back wisdom tooth is swollen and hurting',
  'What should I do for a mild persistent headache?',
  'I feel tightness in my chest when walking fast',
  'How do I prepare for my clinic appointment?',
];

export function PopupChatbot({ isOpen, onToggle, initialPrompt }: PopupChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am Dr. Butterfly Clinic’s virtual assistant. How can I help you today? You can describe any symptoms you are experiencing or ask about clinical care.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<IntakeStage>({ index: 1, total: 4, label: 'Describe your symptom' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only the newest assistant message keeps its option cards active.
  const lastAssistantId = [...messages].reverse().find((m) => m.sender === 'assistant')?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const currentHistory = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: currentHistory,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      if (data.stage) setStage(data.stage);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.response || 'I have noted your message. Please consult a clinician for personalized advice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Only offer options on a real protocol match. Off-protocol replies get
        // a free-text box instead, because canned answers to a question the
        // corpus never covered would be misleading.
        options: data.offProtocol ? [] : (data.quickReplies ?? []),
        offProtocol: Boolean(data.offProtocol),
        sourceLabel: data.retrievedDocs?.[0]?.specialty,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to get response:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I am sorry, but I had trouble reaching our clinical intake service. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setStage({ index: 1, total: 4, label: 'Describe your symptom' });
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history reset. How can I assist you with your health concerns today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Pop-up Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4"
          >
            {/* Chatbot Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">Dr. Butterfly Assistant</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online • Clinical Intake</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                <button
                  onClick={handleClear}
                  title="Reset conversation"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggle}
                  title="Minimize chat"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggle}
                  title="Close chat"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Intake progress. Four named stages rather than a bare percentage:
                a patient mid-interview wants to know what is still being asked
                of them, not how far along a loading bar has crept. */}
            <div className="px-3.5 py-2.5 bg-white border-b border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-700">
                  Step {stage.index} of {stage.total}
                </span>
                <span className="text-[11px] text-slate-500">{stage.label}</span>
              </div>
              <div className="flex gap-1">
                {STAGE_LABELS.map((label, i) => {
                  const done = i + 1 < stage.index;
                  const current = i + 1 === stage.index;
                  return (
                    <div key={label} className="flex-1" title={label}>
                      <div
                        className={`h-1.5 rounded-full transition-colors duration-500 ${
                          done
                            ? 'bg-sky-600'
                            : current
                              ? 'bg-sky-400'
                              : 'bg-slate-200'
                        }`}
                      />
                      <div
                        className={`mt-1 text-[9px] leading-tight truncate ${
                          current ? 'text-sky-700 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-sm">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className="max-w-[80%] space-y-1">
                      <div
                        className={`p-3 rounded-2xl leading-relaxed text-sm shadow-2xs whitespace-pre-wrap ${
                          isUser
                            ? 'bg-sky-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {/* Provenance / grounding badge */}
                      {!isUser && (msg.sourceLabel || msg.offProtocol) && (
                        <div className="flex items-center gap-1 px-1">
                          {msg.offProtocol ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              General guidance — no clinical protocol matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              {msg.sourceLabel} protocol
                            </span>
                          )}
                        </div>
                      )}

                      {/* Answer option cards. Rendered only for the most recent
                          assistant turn: older option sets refer to questions
                          that have already been answered. */}
                      {!isUser &&
                        msg.options &&
                        msg.options.length > 0 &&
                        msg.id === lastAssistantId &&
                        !isLoading && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {msg.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleSend(opt)}
                                className="group text-left px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50 transition shadow-2xs cursor-pointer"
                              >
                                <span className="block text-[11px] leading-snug text-slate-700 group-hover:text-sky-800">
                                  {opt}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                      <div
                        className={`text-[10px] text-slate-400 px-1 ${
                          isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Waiting for LLM response */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Assistant is thinking...</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions if few messages */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/70 flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 border border-slate-200 text-[11px] text-slate-600 hover:text-sky-700 transition shrink-0 shadow-2xs"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a symptom or message..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition shadow-xs flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-start gap-1.5 justify-center mt-2 px-1">
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-px" />
                <p className="text-[10px] text-slate-500 text-center leading-snug">
                  AI can make mistakes. This assistant gathers information for your
                  clinician — it does not diagnose or prescribe. Not for emergencies:
                  call your local emergency number.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border border-white/20"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-sky-600" />
        </div>
        <span className="text-sm font-semibold tracking-wide">
          {isOpen ? 'Close Chat' : 'Chat with Assistant'}
        </span>
      </motion.button>
    </div>
  );
}
