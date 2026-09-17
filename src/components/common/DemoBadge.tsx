import React, { useState } from 'react';
import { Info, Sparkles, ShieldCheck } from 'lucide-react';

interface DemoBadgeProps {
  type?: 'demo' | 'experimental' | 'live' | 'verified';
  className?: string;
  showTooltip?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  type = 'demo',
  className = '',
  showTooltip = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const configs = {
    demo: {
      label: 'DEMO SIMULATION',
      bg: 'bg-sky-50/90 text-sky-700 border-sky-200/80',
      dot: 'bg-sky-500',
      icon: Sparkles,
      tooltipTitle: 'Simulated Hackathon Dataset',
      tooltipText: 'This audio incident and model scores are pre-computed demonstration artifacts created for the Smart India Hackathon showcase to highlight transparent risk explainability without fabricating real live inference.',
    },
    experimental: {
      label: 'EXPERIMENTAL MODEL',
      bg: 'bg-amber-50/90 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: Info,
      tooltipTitle: 'Experimental Architecture (Beta)',
      tooltipText: 'This analysis utilizes experimental PhaseGuard zero-shot vocoder heuristics. Model weights are undergoing calibration and should not be used as the sole factor in critical financial authorization.',
    },
    live: {
      label: 'LOCAL INFERENCE READY',
      bg: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-500',
      icon: ShieldCheck,
      tooltipTitle: 'Client Audio Stream Active',
      tooltipText: 'Audio is running directly through your browser Web Audio API analyzer in isolated ephemeral memory. Zero audio bytes are permanently persisted.',
    },
    verified: {
      label: 'BIOMETRIC MATCH',
      bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      tooltipTitle: 'High-Fidelity Match',
      tooltipText: 'Extracted speaker embedding exceeds the 78% cosine distance threshold against the enrolled corporate voiceprint profile.',
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider border shadow-xs transition-all hover:scale-105 cursor-pointer ${current.bg}`}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse`} />
        <span>{current.label}</span>
        <Icon className="h-3 w-3 opacity-75" />
      </button>

      {/* Tooltip */}
      {showTooltip && isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-white p-3 shadow-xl border border-sky-200 z-50 text-left animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Info className="h-3.5 w-3.5 text-sky-600" />
            <span>{current.tooltipTitle}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            {current.tooltipText}
          </p>
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Resona Governance</span>
            <span>SIH-2026 Prototype</span>
          </div>
        </div>
      )}
    </div>
  );
};
