import React from 'react';

export const GeometricHeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Luminous radial gradients with pretty blue shades */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute top-12 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[100px]" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-100/30 blur-2xl" />

      {/* Delicate technical grid */}
      <div className="absolute inset-0 tech-grid-pattern opacity-60" />

      {/* Floating Geometric Elements (Hero Geometric Design) */}
      
      {/* 1. Large tilted gradient diamond / rhombus */}
      <div className="absolute top-16 right-[12%] w-64 h-64 border border-sky-300/40 rounded-3xl bg-gradient-to-br from-white/60 to-sky-100/30 backdrop-blur-md rotate-12 shadow-soft-blue animate-float-gentle" />

      {/* 2. Concentric acoustic resonance iris */}
      <div className="absolute top-28 left-[6%] w-48 h-48 rounded-full border border-blue-200/60 bg-gradient-to-tr from-sky-50/50 to-white/40 backdrop-blur-sm animate-float-slow flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border border-sky-400/30 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
        <div className="absolute w-16 h-16 rounded-full border border-blue-500/20 bg-blue-500/5" />
      </div>

      {/* 3. Small sharp geometric accent block */}
      <div className="absolute -bottom-8 left-1/3 w-36 h-36 border border-indigo-200/50 rounded-2xl bg-gradient-to-tl from-indigo-50/40 to-white/60 backdrop-blur-md -rotate-6 shadow-sm animate-float-gentle" style={{ animationDelay: '2s' }} />

      {/* 4. Fine soundwave vector path */}
      <svg className="absolute top-1/2 left-0 right-0 w-full h-32 opacity-15" viewBox="0 0 1200 120" fill="none">
        <path
          d="M0 60 Q 150 10, 300 60 T 600 60 T 900 60 T 1200 60"
          stroke="url(#wave-grad)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M0 60 Q 150 110, 300 60 T 600 60 T 900 60 T 1200 60"
          stroke="url(#wave-grad)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#2563EB" stopOpacity="0.5" />
            <stop offset="1" stopColor="#4F46E5" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
