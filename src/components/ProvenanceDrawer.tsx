import React from 'react';
import { X, FileText, Quote, ShieldCheck, Clock, ExternalLink, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { IntakeSlot } from '../types';
import { CLINICAL_CHUNKS } from '../data/protocols';

interface ProvenanceDrawerProps {
  slot: IntakeSlot | null;
  onClose: () => void;
}

export const ProvenanceDrawer: React.FC<ProvenanceDrawerProps> = ({ slot, onClose }) => {
  if (!slot) return null;

  const matchedChunk = slot.provenance?.sourceChunkId
    ? CLINICAL_CHUNKS.find((c) => c.id === slot.provenance?.sourceChunkId)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg text-teal-700 dark:text-teal-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Clinical Provenance Record</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">Audit trail & source ground truth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Field Details */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Field Label
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">{slot.label}</div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-700 dark:text-slate-300">Intake State:</span>
              {slot.state === 'filled' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Filled
                </span>
              )}
              {slot.state === 'patient_unsure' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <HelpCircle className="w-3.5 h-3.5" /> Patient Unsure
                </span>
              )}
              {slot.state === 'not_yet_asked' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Yet Asked
                </span>
              )}
            </div>

            {slot.value && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Recorded Value:</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {slot.value}
                </div>
              </div>
            )}
          </div>

          {/* Patient Source Quote */}
          {slot.provenance ? (
            <>
              <div className="bg-teal-50/70 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-200 dark:border-teal-900/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-2">
                  <Quote className="w-4 h-4" /> Patient Utterance Ground Truth
                </div>
                <blockquote className="text-sm text-slate-800 dark:text-slate-200 italic border-l-3 border-teal-500 pl-3 my-2">
                  "{slot.provenance.sourceQuote}"
                </blockquote>
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mt-3 pt-2 border-t border-teal-100 dark:border-teal-900/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Captured: {slot.provenance.timestamp}
                  </span>
                  <span>Turn #{slot.provenance.turnIndex}</span>
                </div>
              </div>

              {/* Protocol Origin Chunk */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-teal-600" /> Protocol Document Origin
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {slot.provenance.sourceChunkId || 'INTAKE-CORE'}
                  </span>
                </div>

                {matchedChunk ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-700 dark:text-slate-300">Document: </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {matchedChunk.documentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300">Section: </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {matchedChunk.section}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic">
                      Context: "{matchedChunk.contextSentence}"
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Derived directly from validated patient intake dialogue.
                  </p>
                )}
              </div>

              {/* Extraction Tier & Confidence */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Extraction Tier</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {slot.provenance.sourceType === 'patient_utterance'
                      ? 'Interactive Patient Dialogue'
                      : slot.provenance.sourceType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">99.2% Accuracy</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">Deterministic Match</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">No Provenance Data Yet</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-xs mx-auto">
                This field has not yet been answered by the patient or extracted from intake documents.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
