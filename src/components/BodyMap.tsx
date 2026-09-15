import React from 'react';

interface BodyMapProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ selectedRegion, onSelectRegion }) => {
  const regions = [
    { id: 'Head / Face', x: 100, y: 35, r: 24 },
    { id: 'Neck', x: 100, y: 72, r: 12 },
    { id: 'Chest / Thorax', x: 100, y: 115, r: 28 },
    { id: 'Abdomen', x: 100, y: 175, r: 26 },
    { id: 'Left Arm', x: 50, y: 140, r: 18 },
    { id: 'Right Arm', x: 150, y: 140, r: 18 },
    { id: 'Lower Back / Spine', x: 100, y: 220, r: 20 },
    { id: 'Left Leg / Ankle', x: 75, y: 280, r: 22 },
    { id: 'Right Leg / Ankle', x: 125, y: 280, r: 22 },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Interactive Anatomical Map
        </span>
        <span className="text-xs text-slate-700 dark:text-slate-300">Tap region of discomfort</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Anatomical Schematic SVG */}
        <div className="relative w-48 h-80 flex-shrink-0 bg-white dark:bg-slate-950 rounded-lg p-2 border border-slate-200 dark:border-slate-850 shadow-inner flex items-center justify-center">
          <svg viewBox="0 0 200 340" className="w-full h-full max-h-72 select-none">
            {/* Body Outline Silhouette */}
            <path
              d="M100,12 C115,12 124,25 124,40 C124,55 116,65 110,68 L126,76 C145,86 168,110 162,175 L152,174 C156,120 140,105 126,98 L126,190 L140,240 L136,330 L114,330 L110,240 L100,205 L90,240 L86,330 L64,330 L60,240 L74,190 L74,98 C60,105 44,120 48,174 L38,175 C32,110 55,86 74,76 L90,68 C84,65 76,55 76,40 C76,25 85,12 100,12 Z"
              className="fill-slate-100 dark:fill-slate-800/50 stroke-slate-300 dark:stroke-slate-700 stroke-[1.5]"
            />

            {/* Interactive Region Hotspots */}
            {regions.map((reg) => {
              const isSelected = selectedRegion === reg.id;
              return (
                <g key={reg.id} className="cursor-pointer group" onClick={() => onSelectRegion(reg.id)}>
                  <circle
                    cx={reg.x}
                    cy={reg.y}
                    r={reg.r}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'fill-teal-500/60 stroke-teal-600 stroke-[2.5] filter drop-shadow'
                        : 'fill-teal-500/10 stroke-teal-500/40 stroke-1 hover:fill-teal-500/30 hover:stroke-teal-500'
                    }`}
                  />
                  <circle
                    cx={reg.x}
                    cy={reg.y}
                    r={3}
                    className={isSelected ? 'fill-teal-800 dark:fill-white' : 'fill-teal-600'}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Region Quick Select Chips */}
        <div className="flex flex-col gap-1.5 w-full max-w-xs">
          <div className="text-xs text-slate-700 dark:text-slate-300 mb-1">Or choose common areas:</div>
          <div className="grid grid-cols-2 gap-1.5">
            {regions.map((reg) => {
              const isSelected = selectedRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => onSelectRegion(reg.id)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 font-medium shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600'
                  }`}
                >
                  {reg.id}
                </button>
              );
            })}
          </div>
          {selectedRegion && (
            <div className="mt-2 text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-md border border-teal-200 dark:border-teal-800/60">
              Selected: <span className="font-semibold">{selectedRegion}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
