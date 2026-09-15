import React from 'react';
import {
  Stethoscope,
  ClipboardList,
  Cpu,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'patient' | 'doctor' | 'inspector';
  onSelectTab: (tab: 'patient' | 'doctor' | 'inspector') => void;
  activeSpecialty: string;
  onChangeSpecialty: (spec: string) => void;
  onResetSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeSpecialty,
  onChangeSpecialty,
  onResetSession,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Clinic Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Clinic Intake RAG
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <Sparkles className="w-3 h-3 text-teal-500" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 hidden sm:block">
              Inverted RAG • Provenance Tracking • Free-Tier Architecture
            </p>
          </div>
        </div>

        {/* Center: Surface Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onSelectTab('patient')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'patient'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Patient</span> Interview
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('doctor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'doctor'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Doctor</span> Note
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('inspector')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inspector'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">RAG</span> Inspector
          </button>
        </nav>

        {/* Right Controls: Specialty Selector & Reset */}
        <div className="flex items-center gap-2">
          {/* Clinic Specialty Selector */}
          <select
            value={activeSpecialty}
            onChange={(e) => onChangeSpecialty(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="Cardiology">St. Jude Cardiology</option>
            <option value="General Practice">General Practice</option>
            <option value="Dermatology">Dermatology</option>
          </select>

          <button
            type="button"
            onClick={onResetSession}
            title="Reset Session"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
