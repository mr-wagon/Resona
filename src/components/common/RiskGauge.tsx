import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  confidence: number; // 0 to 100
  marginOfError?: number;
  uncertainty?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  category?: 'synthetic_high' | 'synthetic_moderate' | 'uncertain' | 'human_verified';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  confidence,
  marginOfError = 2.5,
  uncertainty = 10,
  size = 'md',
  label = 'Synthetic Risk Index',
  category,
}) => {
  const radius = size === 'lg' ? 68 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on risk score or category
  let color = '#2563EB';
  let badgeText = 'Human Verified';
  let Icon = ShieldCheck;
  let bgFill = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (category === 'synthetic_high' || score >= 75) {
    color = '#EF4444';
    badgeText = 'Potential Synthetic Voice';
    Icon = ShieldAlert;
    bgFill = 'bg-red-50 text-red-700 border-red-200';
  } else if (category === 'uncertain' || (score >= 35 && score < 75)) {
    color = '#F59E0B';
    badgeText = 'Review Required / Ambiguous';
    Icon = HelpCircle;
    bgFill = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    color = '#10B981';
    badgeText = 'Authentic Human Voice';
    Icon = ShieldCheck;
    bgFill = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  const dim = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/90 border border-sky-100/80 shadow-soft-blue">
      <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
        {/* SVG Circle Gauge */}
        <svg width={dim} height={dim} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active progress track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-slate-800">
            {score.toFixed(1)}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      {/* Label and semantic badge */}
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        
        <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgFill}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{badgeText}</span>
        </div>

        {/* Confidence & Uncertainty interval */}
        <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <div>
            <span className="text-slate-400">Confidence: </span>
            <span className="font-semibold text-slate-700">{confidence.toFixed(1)}% (±{marginOfError}%)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="text-slate-400">Uncertainty: </span>
            <span className="font-semibold text-slate-700">{uncertainty.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
