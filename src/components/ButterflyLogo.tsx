import React from 'react';

interface ButterflyLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const ButterflyLogo: React.FC<ButterflyLogoProps> = ({ size = 40, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Custom Butterfly Medical Vector Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform hover:scale-105 duration-200"
        aria-label="Butterfly Clinic Logo"
      >
        <defs>
          <linearGradient id="leftUpperWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="rightUpperWing" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="lowerWings" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Left Upper Wing */}
        <path
          d="M48 46 C40 28, 16 18, 14 36 C12 50, 32 60, 48 52 Z"
          fill="url(#leftUpperWing)"
          opacity="0.95"
        />

        {/* Right Upper Wing */}
        <path
          d="M52 46 C60 28, 84 18, 86 36 C88 50, 68 60, 52 52 Z"
          fill="url(#rightUpperWing)"
          opacity="0.95"
        />

        {/* Left Lower Wing */}
        <path
          d="M48 54 C34 60, 20 70, 24 82 C28 92, 42 84, 48 64 Z"
          fill="url(#lowerWings)"
          opacity="0.88"
        />

        {/* Right Lower Wing */}
        <path
          d="M52 54 C66 60, 80 70, 76 82 C72 92, 58 84, 52 64 Z"
          fill="url(#lowerWings)"
          opacity="0.88"
        />

        {/* Central Healthcare Spine / Medical Cross Motif */}
        <rect x="48" y="32" width="4" height="40" rx="2" fill="#ffffff" />
        <rect x="42" y="44" width="16" height="4" rx="2" fill="#ffffff" />

        {/* Antennae */}
        <path
          d="M48 32 C44 22, 36 18, 32 20"
          stroke="#0d9488"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="31" cy="20" r="2" fill="#0d9488" />

        <path
          d="M52 32 C56 22, 64 18, 68 20"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="69" cy="20" r="2" fill="#0284c7" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Butterfly Clinic
            </span>
          </div>
          <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400 tracking-wide uppercase">
            Care Navigation & Referral RAG
          </span>
        </div>
      )}
    </div>
  );
};
