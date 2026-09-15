import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Upload,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  FileText,
  Paperclip,
  Activity,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ChatMessage, IntakeSlot, DocumentUploadRecord } from '../types';
import { BodyMap } from './BodyMap';

interface PatientViewProps {
  messages: ChatMessage[];
  slots: IntakeSlot[];
  onSendMessage: (text: string) => Promise<void>;
  onSelectQuickReply: (text: string) => Promise<void>;
  isLoading: boolean;
  redFlagAlert: boolean;
  onResetSession: () => void;
  activeSpecialty: string;
}

export const PatientView: React.FC<PatientViewProps> = ({
  messages,
  slots,
  onSendMessage,
  onSelectQuickReply,
  isLoading,
  redFlagAlert,
  onResetSession,
  activeSpecialty,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string | null>(null);
  const [severityValue, setSeverityValue] = useState<number>(5);
  const [showBodyMap, setShowBodyMap] = useState<boolean>(false);
  const [showSeveritySlider, setShowSeveritySlider] = useState<boolean>(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const filledCount = slots.filter((s) => s.state === 'filled').length;
  const progressPercent = Math.round((filledCount / slots.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || redFlagAlert) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handleBodyRegionConfirm = () => {
    if (!selectedBodyRegion) return;
    onSendMessage(`The discomfort is located in my ${selectedBodyRegion}.`);
    setShowBodyMap(false);
  };

  const handleSeverityConfirm = () => {
    onSendMessage(`My pain level is ${severityValue} out of 10.`);
    setShowSeveritySlider(false);
  };

  const handleSimulateUpload = async (category: 'clean_pdf' | 'prescription_photo' | 'wound_photo' | 'handwritten_note') => {
    setIsUploadingDoc(true);
    setUploadFeedback(null);
    setUploadError(null);

    let fileName = 'Document.pdf';
    if (category === 'clean_pdf') fileName = 'Cardiology_Intake_Referral.pdf';
    if (category === 'prescription_photo') fileName = 'Blood_Pressure_Prescription_Photo.jpg';
    if (category === 'wound_photo') fileName = 'Rash_and_Skin_Photo.jpg';
    if (category === 'handwritten_note') fileName = 'Handwritten_Med_Note.jpg';

    try {
      const res = await fetch('/api/document/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, category: category === 'clean_pdf' ? 'protocol' : 'prescription' }),
      });
      const data = await res.json();

      if (data.status === 'rejected') {
        setUploadError(data.rejectionReason);
      } else if (data.status === 'verified') {
        setUploadFeedback(`Extracted via Tier ${data.extractionTier}: ${data.summary}`);
        if (data.extractedMedications?.length) {
          onSendMessage(`I uploaded my prescription: ${data.extractedMedications.join(', ')}`);
        }
      } else if (data.status === 'pending_confirmation') {
        setUploadFeedback(`Tier 4 OCR: ${data.confirmPrompt}`);
      }
    } catch (e: any) {
      setUploadError('Failed to process document upload.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* LEFT & CENTER: Interactive Chat Session (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Chat Header with Clinic Context & Progress Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Clinic Intake Interview
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {activeSpecialty} Protocol Active
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Retrieval-driven questions guide your pre-appointment summary
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex flex-col items-end w-full sm:w-32">
              <div className="flex justify-between w-full text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Intake Progress</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RED FLAG ALERT BANNER (If Triggered) */}
        {redFlagAlert && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800 flex items-start gap-3 animate-in fade-in duration-300">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
                EMERGENCY STOP PROTOCOL TRIGGERED
              </div>
              <div className="text-sm font-semibold text-red-900 dark:text-red-200">
                A potential acute warning sign was detected. Automated intake has stopped.
              </div>
              <p className="text-xs text-red-800 dark:text-red-300">
                Please dial emergency medical services (911 / 999 / 112) or seek urgent medical attention immediately.
              </p>
              <button
                type="button"
                onClick={onResetSession}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md shadow-xs transition"
              >
                Reset & Start New Safe Session
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot' || msg.sender === 'system';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${
                  isBot ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium shadow-xs ${
                    isBot
                      ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isBot
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                        : 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Ghosted RAG Source Chip */}
                  {msg.sourceChunk && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 pl-1">
                      <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <span>
                        From: <span className="font-medium text-slate-700 dark:text-slate-300">{msg.sourceChunk.documentName}</span>{' '}
                        • {msg.sourceChunk.section}
                      </span>
                    </div>
                  )}

                  {/* Quick-reply Chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && !redFlagAlert && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                      {msg.quickReplies.map((replyText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => onSelectQuickReply(replyText)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition shadow-2xs"
                        >
                          {replyText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Animated Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 flex items-center justify-center border border-teal-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                </span>
                <span>Retrieving protocol question & updating note...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* MODAL / COLLAPSIBLE WIDGETS: Body Map & Severity Slider */}
        {showBodyMap && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <BodyMap selectedRegion={selectedBodyRegion} onSelectRegion={setSelectedBodyRegion} />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBodyMap(false)}
                className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedBodyRegion}
                onClick={handleBodyRegionConfirm}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}

        {showSeveritySlider && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Rate Pain / Discomfort Severity</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    severityValue <= 3
                      ? 'bg-emerald-100 text-emerald-800'
                      : severityValue <= 6
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Score: {severityValue} / 10
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={severityValue}
                onChange={(e) => setSeverityValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />

              <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300">
                <span>1 - Barely noticeable</span>
                <span>5 - Moderate discomfort</span>
                <span>10 - Worst imaginable</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeveritySlider(false)}
                  className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSeverityConfirm}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
                >
                  Submit Rating ({severityValue}/10)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar & Widget Shortcuts */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          {/* Quick Widget Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] flex-shrink-0">Helper Tools:</span>
            <button
              type="button"
              onClick={() => {
                setShowBodyMap(!showBodyMap);
                setShowSeveritySlider(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                showBodyMap
                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-400 text-teal-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Body Map
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSeveritySlider(!showSeveritySlider);
                setShowBodyMap(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                showSeveritySlider
                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-400 text-teal-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              1-10 Severity Scale
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              disabled={isLoading || redFlagAlert}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                redFlagAlert
                  ? 'Intake stopped due to safety alert.'
                  : 'Type your symptoms, history, or answers here...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || redFlagAlert}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Document Upload Subsystem & Live Note Preview (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
        {/* Document Ingestion Card (Tier 1-4 & Safety Rejection Test) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Document Ingestion & OCR</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 border border-teal-200 dark:border-teal-800">
              4-Tier Engine
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            Upload medical documents or prescriptions to pre-fill your medical note. Test sample fixtures:
          </p>

          <div className="space-y-2">
            <button
              type="button"
              disabled={isUploadingDoc}
              onClick={() => handleSimulateUpload('clean_pdf')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50 dark:bg-slate-850 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition flex items-center justify-between group"
            >
              <div className="text-xs">
                <div className="font-medium text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  📄 Clean PDF (Tier 1: PyMuPDF)
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300">Cardiology Referral & Med List</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </button>

            <button
              type="button"
              disabled={isUploadingDoc}
              onClick={() => handleSimulateUpload('prescription_photo')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50 dark:bg-slate-850 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition flex items-center justify-between group"
            >
              <div className="text-xs">
                <div className="font-medium text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  📸 Rx Photo (Tier 2: Local OCR)
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300">Deskewed Blood Pressure Rx</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </button>

            <button
              type="button"
              disabled={isUploadingDoc}
              onClick={() => handleSimulateUpload('wound_photo')}
              className="w-full text-left p-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center justify-between group"
            >
              <div className="text-xs">
                <div className="font-medium text-red-900 dark:text-red-200">
                  ⚠️ Wound / Rash Photo (Safety Gate)
                </div>
                <div className="text-[11px] text-red-600 dark:text-red-400">Tests Hard Rule 2: Rejection</div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>

          {/* Feedback & Rejection Messages */}
          {uploadFeedback && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-lg text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>{uploadFeedback}</div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>{uploadError}</div>
            </div>
          )}
        </div>

        {/* Live Mini Note Summary */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live Note Status</h3>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {filledCount} of {slots.length} filled
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {slots.map((slot) => {
              const isFilled = slot.state === 'filled';
              const isUnsure = slot.state === 'patient_unsure';
              return (
                <div
                  key={slot.id}
                  className={`p-2.5 rounded-lg border transition ${
                    isFilled
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : isUnsure
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">{slot.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        isFilled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                          : isUnsure
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isFilled ? 'Filled' : isUnsure ? 'Unsure' : 'Pending'}
                    </span>
                  </div>
                  {slot.value && (
                    <div className="mt-1 text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                      {slot.value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
