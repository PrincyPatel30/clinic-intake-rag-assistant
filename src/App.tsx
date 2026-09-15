import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  Smile,
  Stethoscope,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PopupChatbot } from './components/PopupChatbot';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroPrompt, setHeroPrompt] = useState('');
  const [activePromptToSend, setActivePromptToSend] = useState<string | undefined>(undefined);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    setActivePromptToSend(heroPrompt.trim());
    setIsChatOpen(true);
    setHeroPrompt('');
  };

  const handleQuickQuestionClick = (text: string) => {
    setActivePromptToSend(text);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Notification / Clinic Hours Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 2:00 PM</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>450 Healthcare Blvd, Suite 200</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:18005550199"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Emergency / Hotline: (800) 555-0199</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Clinic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Dr. Butterfly Clinic
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Comprehensive Healthcare & Oral Surgery
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-sky-600 transition">
              Specialties
            </a>
            <a href="#care" className="hover:text-sky-600 transition">
              Patient Care
            </a>
            <a href="#about" className="hover:text-sky-600 transition">
              About Us
            </a>
            <a href="#contact" className="hover:text-sky-600 transition">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search/Chat Prompt */}
      <section className="bg-gradient-to-b from-white via-sky-50/40 to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Virtual Intake & Care Navigation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Clinical Care,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              Guidance & Support
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to Dr. Butterfly Clinic. Whether you are experiencing dental pain, wisdom tooth
            swelling, or chest discomfort, our clinical team is here for you.
          </p>

          {/* Prompt Bar in Hero */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleHeroSubmit}
              className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2"
            >
              <div className="pl-3 text-slate-400">
                <MessageSquare className="w-5 h-5 text-sky-600" />
              </div>
              <input
                type="text"
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="Ask our virtual assistant (e.g., 'My wisdom tooth is hurting and swollen')..."
                className="flex-1 px-2 py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Popular questions:</span>
              <button
                onClick={() =>
                  handleQuickQuestionClick('My back wisdom tooth is swollen and hurts to chew')
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 transition"
              >
                Wisdom tooth pain
              </button>
              <button
                onClick={() =>
                  handleQuickQuestionClick('What should I do if I feel chest pressure on exertion?')
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 transition"
              >
                Chest tightness
              </button>
              <button
                onClick={() =>
                  handleQuickQuestionClick('What are your clinic hours and walk-in policies?')
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 transition"
              >
                Clinic hours & visits
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Specialties Section */}
      <section id="services" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Our Core Clinical Specialties
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Our multidisciplinary team combines specialized oral surgery, cardiac wellness, and
              comprehensive primary medicine under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Oral Surgery */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Oral & Maxillofacial Care</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Specialized evaluation and management of impacted third molars (wisdom teeth),
                pericoronitis, facial infections, and dental referrals.
              </p>
              <button
                onClick={() =>
                  handleQuickQuestionClick('Tell me about your wisdom tooth removal services')
                }
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 pt-2"
              >
                <span>Ask about dental care</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Cardiology */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Cardiovascular Wellness</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                In-depth screening for chest symptoms, blood pressure management, exertional
                monitoring, and coordinated clinical cardiology evaluations.
              </p>
              <button
                onClick={() =>
                  handleQuickQuestionClick('What heart and blood pressure screenings do you offer?')
                }
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 pt-2"
              >
                <span>Ask about heart health</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: General Practice */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Family & Preventive Medicine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Comprehensive health exams, routine preventive diagnostics, chronic symptom
                follow-ups, and coordinated doctor appointments.
              </p>
              <button
                onClick={() =>
                  handleQuickQuestionClick('How can I schedule a general health checkup?')
                }
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 pt-2"
              >
                <span>Ask about appointments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How Virtual Intake Works */}
      <section id="care" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Virtual Intake Works
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Our intelligent assistant is always ready in the bottom right corner to guide you
              through your symptoms before your consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-semibold text-slate-800 text-base">Open Chatbot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click the chat bubble or type directly into the prompt box to start your
                consultation.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-semibold text-slate-800 text-base">Backend LLM Processing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The backend retrieves clinical guidelines and queries the model to formulate safe,
                grounded intake questions.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-semibold text-slate-800 text-base">Care Guidance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive clear clarification questions, next steps, or referral information for your
                visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA Banner */}
      <section className="py-14 bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Need to Speak with a Doctor or Specialist?
          </h2>
          <p className="text-sky-100 text-sm sm:text-base max-w-xl mx-auto">
            Our clinic accepts new patients and referrals. Chat with our assistant to get preliminary
            guidance, or call our office directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-6 py-3 bg-white text-sky-800 hover:bg-sky-50 font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
            >
              Start Chat Consultation
            </button>
            <a
              href="tel:18005550199"
              className="px-6 py-3 bg-sky-700/60 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl border border-sky-400/30 transition"
            >
              Call (800) 555-0199
            </a>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="font-bold">Dr. Butterfly Clinic</span>
            <span className="text-slate-500">• 450 Healthcare Blvd</span>
          </div>

          <div className="text-center sm:text-right text-slate-500">
            For severe emergencies (crushing chest pain, stroke symptoms), immediately dial 911 or
            go to the nearest ER.
          </div>
        </div>
      </footer>

      {/* The Pop-up Chatbot (Floating at bottom-right) */}
      <PopupChatbot
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        initialPrompt={activePromptToSend}
      />
    </div>
  );
}
