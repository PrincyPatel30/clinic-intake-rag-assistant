/**
 * The guided intake conversation.
 *
 * The control the patient answers with changes per question, because "when did
 * it start?" and "rate it 1-10" and "describe it in your own words" are three
 * different jobs and a single text box does all three badly. Which control
 * appears is decided by the protocol chunk itself (`inputWidget`), so the corpus
 * drives the interface -- adding a protocol document adds new question types
 * with no change here.
 *
 * Only the current question's control is interactive. Once answered, a turn
 * collapses to a plain transcript line, which is what makes this read as a
 * conversation rather than a stack of live form controls.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Wind,
  Thermometer,
  Droplet,
  ScanLine,
  Send,
  Check,
  AlertTriangle,
  RotateCcw,
  Stethoscope,
  Pencil,
} from 'lucide-react';

type WidgetKind =
  | 'symptom_picker'
  | 'single_choice'
  | 'severity'
  | 'yes_no'
  | 'text'
  | 'summary';

interface SummaryChip {
  slot: string;
  label: string;
  value: string;
}

interface TurnResponse {
  acknowledgement: string;
  question: string;
  widget: WidgetKind;
  options: string[];
  targetSlot?: string;
  summary: SummaryChip[];
  stage: { index: number; total: number; label: string };
  chunkId: string | null;
  specialty: string | null;
  offProtocol: boolean;
  done: boolean;
  redFlag?: { text: string; phrase: string };
}

/** A completed exchange, kept only for display. */
interface TranscriptLine {
  id: string;
  ack?: string;
  question: string;
  answer: string;
}

const SYMPTOM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Chest discomfort': Heart,
  'Breathing trouble': Wind,
  'Tooth or jaw pain': Stethoscope,
  'Skin or a mole': ScanLine,
  'Feeling unwell': Thermometer,
  Swelling: Droplet,
};

export function IntakeConversation({ onExit }: { onExit?: () => void }) {
  const [turn, setTurn] = useState<TurnResponse | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [askedChunkIds, setAskedChunkIds] = useState<string[]>([]);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void send('', {}, [], null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [transcript.length, turn, isLoading]);

  async function send(
    answer: string,
    nextSlots: Record<string, string>,
    nextAsked: string[],
    nextSpecialty: string | null
  ) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/intake/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer,
          slots: nextSlots,
          askedChunkIds: nextAsked,
          specialty: nextSpecialty,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TurnResponse = await res.json();
      setTurn(data);
      if (data.specialty) setSpecialty(data.specialty);
      if (data.chunkId) setAskedChunkIds((prev) => [...new Set([...prev, data.chunkId!])]);
    } catch (err) {
      console.error(err);
      // Never surface a status code or a stack trace. The conversation state is
      // untouched, so retrying continues exactly where it stopped.
      setError('Something interrupted the conversation.');
    } finally {
      setIsLoading(false);
    }
  }

  /** Record the answer, move the finished turn into the transcript, ask again. */
  function answerWith(value: string) {
    if (!turn || isLoading) return;

    const slot = turn.targetSlot ?? (turn.widget === 'symptom_picker' ? 'reason_for_visit' : undefined);
    const nextSlots = slot ? { ...slots, [slot]: value } : slots;
    const nextAsked = turn.chunkId ? [...new Set([...askedChunkIds, turn.chunkId])] : askedChunkIds;

    setTranscript((prev) => [
      ...prev,
      { id: `${turn.chunkId ?? 'open'}-${prev.length}`, ack: turn.acknowledgement, question: turn.question, answer: value },
    ]);
    setSlots(nextSlots);
    setAskedChunkIds(nextAsked);
    setDraft('');
    void send(value, nextSlots, nextAsked, specialty);
  }

  function restart() {
    setTranscript([]);
    setSlots({});
    setAskedChunkIds([]);
    setSpecialty(null);
    setDraft('');
    setTurn(null);
    void send('', {}, [], null);
  }

  const summary = turn?.summary ?? [];
  const stage = turn?.stage ?? { index: 1, total: 4, label: '' };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header: identity, and how far along the patient is */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Clinic Assistant</div>
              <div className="text-[11px] text-slate-500">Pre-visit intake</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">{stage.label}</span>
            <button
              onClick={restart}
              title="Start over"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Deliberately no "question 3 of 25" -- a count makes it feel like a form. */}
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-600 rounded-full"
            initial={false}
            animate={{ width: `${(stage.index / stage.total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Running summary of what has been captured */}
      <AnimatePresence>
        {summary.length > 0 && !turn?.done && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 sm:px-5 py-2 bg-slate-50 border-b border-slate-200 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {summary.map((chip) => (
                <span
                  key={chip.slot}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600"
                >
                  <span className="text-slate-400">{chip.label}:</span>
                  <span className="font-medium text-slate-800">{chip.value}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {transcript.map((line) => (
          <div key={line.id} className="space-y-1.5">
            <p className="text-sm text-slate-700 leading-relaxed">
              {line.ack && <span className="text-slate-500">{line.ack} </span>}
              {line.question}
            </p>
            <div className="flex justify-end">
              <span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm bg-sky-600 text-white text-sm max-w-[85%]">
                {line.answer}
              </span>
            </div>
          </div>
        ))}

        {turn && !isLoading && (
          <motion.div
            key={turn.question}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {turn.redFlag ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2 text-red-800 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Please seek care now
                </div>
                <p className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap">
                  {turn.question}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-800 leading-relaxed">
                {turn.acknowledgement && (
                  <span className="text-slate-500">{turn.acknowledgement} </span>
                )}
                <span className="font-medium">{turn.question}</span>
              </p>
            )}

            {turn.offProtocol && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="w-3 h-3" />
                Outside our intake protocols
              </span>
            )}

            <Controls
              turn={turn}
              draft={draft}
              setDraft={setDraft}
              onAnswer={answerWith}
              onExit={onExit}
              onRestart={restart}
            />
          </motion.div>
        )}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-slate-400">
            {[0, 0.15, 0.3].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-sm text-slate-700">{error}</p>
            <button
              onClick={() => void send('', slots, askedChunkIds, specialty)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
            >
              Try again
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <p className="px-4 sm:px-5 py-2.5 text-[11px] text-slate-400 leading-snug border-t border-slate-100 text-center">
        AI can make mistakes. This collects information for your care team — it does not
        diagnose or prescribe. For emergencies, call your local emergency number.
      </p>
    </div>
  );
}

/** The per-question control. Only one is ever live at a time. */
function Controls({
  turn,
  draft,
  setDraft,
  onAnswer,
  onExit,
  onRestart,
}: {
  turn: TurnResponse;
  draft: string;
  setDraft: (v: string) => void;
  onAnswer: (v: string) => void;
  onExit?: () => void;
  onRestart: () => void;
}) {
  if (turn.redFlag) {
    return (
      <button
        onClick={onRestart}
        className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
      >
        Start over
      </button>
    );
  }

  switch (turn.widget) {
    case 'symptom_picker':
      return (
        <div className="grid grid-cols-2 gap-2">
          {turn.options.map((opt) => {
            const Icon = SYMPTOM_ICONS[opt] ?? Stethoscope;
            return (
              <button
                key={opt}
                onClick={() => onAnswer(opt)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/60 text-left transition group"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 transition">
                  <Icon className="w-4 h-4 text-sky-600" />
                </span>
                <span className="text-[13px] font-medium text-slate-700 leading-tight">{opt}</span>
              </button>
            );
          })}
        </div>
      );

    case 'severity':
      return (
        <div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => onAnswer(`${n} out of 10`)}
                className={`py-2 rounded-lg text-xs font-semibold border transition ${
                  n <= 3
                    ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : n <= 6
                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      : 'border-red-200 text-red-700 hover:bg-red-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>Barely noticeable</span>
            <span>Worst imaginable</span>
          </div>
        </div>
      );

    case 'yes_no':
      return (
        <div className="grid grid-cols-2 gap-2">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              className="py-3 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/60 text-sm font-medium text-slate-700 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      );

    case 'summary':
      return (
        <div className="space-y-3">
          {turn.summary.length > 0 && (
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
              {turn.summary.map((chip) => (
                <div key={chip.slot} className="flex justify-between gap-3 px-3 py-2">
                  <span className="text-[11px] text-slate-500">{chip.label}</span>
                  <span className="text-[12px] font-medium text-slate-800 text-right">
                    {chip.value}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your answers will be available to the care team before your appointment.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onExit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
        </div>
      );

    case 'single_choice':
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {turn.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onAnswer(opt)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/60 text-left text-[13px] text-slate-700 leading-snug transition"
              >
                {opt}
              </button>
            ))}
          </div>
          {/* Options should be the easy path, never the only path. */}
          <FreeText draft={draft} setDraft={setDraft} onAnswer={onAnswer} compact />
        </div>
      );

    case 'text':
    default:
      return <FreeText draft={draft} setDraft={setDraft} onAnswer={onAnswer} />;
  }
}

function FreeText({
  draft,
  setDraft,
  onAnswer,
  compact = false,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onAnswer: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.trim()) onAnswer(draft.trim());
      }}
      className="flex items-center gap-2"
    >
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={compact ? 'Or type your own answer…' : 'Describe what’s bothering you…'}
        className="flex-1 px-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
      />
      <button
        type="submit"
        disabled={!draft.trim()}
        aria-label="Send answer"
        className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
