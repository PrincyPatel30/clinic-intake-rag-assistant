import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Pill,
  HeartPulse,
  Activity,
  UserCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { IntakeSlot } from '../types';
import { ProvenanceDrawer } from './ProvenanceDrawer';

interface DoctorViewProps {
  slots: IntakeSlot[];
  activeSpecialty: string;
  sessionId: string;
  onSelectSlot: (slot: IntakeSlot) => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  slots,
  activeSpecialty,
  sessionId,
}) => {
  const [selectedSlotForProvenance, setSelectedSlotForProvenance] = useState<IntakeSlot | null>(null);
  const [copied, setCopied] = useState(false);

  // Group slots by clinical note section
  const ccSlots = slots.filter((s) => s.section === 'chief_complaint');
  const hpiSlots = slots.filter((s) => s.section === 'hpi');
  const medSlots = slots.filter((s) => s.section === 'medications');
  const allergySlots = slots.filter((s) => s.section === 'allergies');
  const pmhSlots = slots.filter((s) => s.section === 'past_history');
  const rosSlots = slots.filter((s) => s.section === 'review_of_systems');

  const filledCount = slots.filter((s) => s.state === 'filled').length;
  const unsureCount = slots.filter((s) => s.state === 'patient_unsure').length;
  const unaskedCount = slots.filter((s) => s.state === 'not_yet_asked').length;

  const handleCopyNote = () => {
    let noteText = `=== CLINICAL INTAKE NOTE (PRE-VISIT SUMMARY) ===\n`;
    noteText += `Specialty: ${activeSpecialty}\nSession ID: ${sessionId}\nGenerated: ${new Date().toLocaleString()}\n\n`;

    const sections = [
      { title: 'CHIEF COMPLAINT', items: ccSlots },
      { title: 'HISTORY OF PRESENT ILLNESS', items: hpiSlots },
      { title: 'MEDICATIONS', items: medSlots },
      { title: 'ALLERGIES', items: allergySlots },
      { title: 'PAST MEDICAL HISTORY', items: pmhSlots },
      { title: 'REVIEW OF SYSTEMS', items: rosSlots },
    ];

    sections.forEach((sec) => {
      noteText += `[${sec.title}]\n`;
      sec.items.forEach((item) => {
        const val = item.value || (item.state === 'patient_unsure' ? 'Patient unsure' : 'Not yet asked');
        noteText += `• ${item.label}: ${val}\n`;
      });
      noteText += `\n`;
    });

    navigator.clipboard.writeText(noteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSlotRow = (slot: IntakeSlot) => {
    const isFilled = slot.state === 'filled';
    const isUnsure = slot.state === 'patient_unsure';

    return (
      <div
        key={slot.id}
        onClick={() => setSelectedSlotForProvenance(slot)}
        className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-sm cursor-pointer transition flex items-start justify-between gap-4"
      >
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition">
              {slot.label}
            </span>
            {slot.provenance && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80">
                Source: {slot.provenance.sourceChunkId || 'Utterance'}
              </span>
            )}
          </div>

          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {isFilled && slot.value ? (
              <span>{slot.value}</span>
            ) : isUnsure ? (
              <span className="text-amber-600 dark:text-amber-400 italic">Patient stated: Not sure</span>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 italic">Not yet asked</span>
            )}
          </div>

          {slot.provenance?.sourceQuote && (
            <div className="text-xs text-slate-700 dark:text-slate-300 italic line-clamp-1 border-l-2 border-slate-300 dark:border-slate-700 pl-2 mt-1">
              "{slot.provenance.sourceQuote}"
            </div>
          )}
        </div>

        {/* Tri-state Badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          {isFilled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Filled
            </span>
          )}
          {isUnsure && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <HelpCircle className="w-3.5 h-3.5" /> Unsure
            </span>
          )}
          {!isFilled && !isUnsure && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
              Unasked
            </span>
          )}
          <span className="text-[10px] text-teal-600 dark:text-teal-400 group-hover:underline mt-1">
            View Provenance →
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header with Physician Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Physician Summary View
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300">Session ID: {sessionId.slice(0, 12)}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Pre-Appointment Clinical Intake Note
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Click on any field below to view its direct patient quote and protocol chunk citation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Note' : 'Copy Note'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Tri-state Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
              Verified & Filled
            </div>
            <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
              {filledCount} <span className="text-xs font-normal text-emerald-700">of {slots.length}</span>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-300">
              Patient Unsure
            </div>
            <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 mt-0.5">
              {unsureCount} <span className="text-xs font-normal text-amber-700">flagged for review</span>
            </div>
          </div>
          <HelpCircle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
              Unasked / Remaining
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {unaskedCount} <span className="text-xs font-normal text-slate-700 dark:text-slate-300">questions</span>
            </div>
          </div>
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {/* 1. Chief Complaint */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Chief Complaint & Primary Reason for Visit
            </h2>
          </div>
          <div className="space-y-2">{ccSlots.map(renderSlotRow)}</div>
        </div>

        {/* 2. History of Present Illness (HPI) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. History of Present Illness (HPI & Symptom Characterization)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{hpiSlots.map(renderSlotRow)}</div>
        </div>

        {/* 3. Medications & Allergies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Medications & Dosages
              </h2>
            </div>
            <div className="space-y-2">{medSlots.map(renderSlotRow)}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <AlertCircle className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                4. Allergies & Sensitivities
              </h2>
            </div>
            <div className="space-y-2">{allergySlots.map(renderSlotRow)}</div>
          </div>
        </div>

        {/* 4. Past Medical History & Review of Systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                5. Past Medical History
              </h2>
            </div>
            <div className="space-y-2">{pmhSlots.map(renderSlotRow)}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                6. Review of Systems (ROS)
              </h2>
            </div>
            <div className="space-y-2">{rosSlots.map(renderSlotRow)}</div>
          </div>
        </div>
      </div>

      {/* Provenance Slide-over Drawer */}
      <ProvenanceDrawer
        slot={selectedSlotForProvenance}
        onClose={() => setSelectedSlotForProvenance(null)}
      />
    </div>
  );
};
