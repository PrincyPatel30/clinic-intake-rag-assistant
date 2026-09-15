/**
 * The floating launcher and the panel it opens.
 *
 * Deliberately thin: this owns the shell (launcher button, open/close
 * animation, sizing) and nothing else. The conversation itself lives in
 * IntakeConversation, which is also usable inline on a page -- the same intake
 * should not exist twice in two slightly different versions.
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IntakeConversation } from './IntakeConversation';

interface PopupChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  /** Accepted for API compatibility with the previous chat; unused here. */
  initialPrompt?: string;
}

export function PopupChatbot({ isOpen, onToggle }: PopupChatbotProps) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            /* Height is capped against the viewport so the panel never grows past
               the screen on a phone, where the keyboard already takes half of it. */
            className="w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-7rem))] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Clinic intake assistant"
          >
            <IntakeConversation onExit={onToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-semibold">{isOpen ? 'Close' : 'Start intake'}</span>
      </motion.button>
    </div>
  );
}
