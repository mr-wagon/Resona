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
      bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
      dot: 'bg-cyan-400',
      icon: Sparkles,
      tooltipTitle: 'Simulated Forensic Dataset',
      tooltipText: 'This audio incident and model scores are pre-computed demonstration artifacts created to highlight transparent risk explainability without fabricating real live inference.',
    },
    experimental: {
      label: 'EXPERIMENTAL MODEL',
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      dot: 'bg-amber-400',
      icon: Info,
      tooltipTitle: 'Experimental Architecture (Beta)',
      tooltipText: 'This analysis utilizes experimental PhaseGuard zero-shot vocoder heuristics. Model weights are undergoing calibration and should not be used as the sole factor in critical financial authorization.',
    },
    live: {
      label: 'LOCAL INFERENCE READY',
      bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
      dot: 'bg-indigo-400',
      icon: ShieldCheck,
      tooltipTitle: 'Client Audio Stream Active',
      tooltipText: 'Audio is running directly through your browser Web Audio API analyzer in isolated ephemeral memory. Zero audio bytes are permanently persisted.',
    },
    verified: {
      label: 'BIOMETRIC MATCH',
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      dot: 'bg-emerald-400',
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider border shadow-xs transition-all hover:scale-105 cursor-pointer backdrop-blur-md ${current.bg}`}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse`} />
        <span>{current.label}</span>
        <Icon className="h-3 w-3 opacity-75" />
      </button>

      {/* Tooltip */}
      {showTooltip && isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-[#0D1424]/95 p-3.5 shadow-2xl border border-white/15 z-50 text-left animate-in fade-in duration-150 backdrop-blur-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>{current.tooltipTitle}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
            {current.tooltipText}
          </p>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Resona Governance</span>
            <span className="text-cyan-400">Enterprise Prototype</span>
          </div>
        </div>
      )}
    </div>
  );
};
