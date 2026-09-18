import React from 'react';

export const GeometricHeroBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Soft Ambient Sky Blue Radial Glows */}
      <div 
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 80%)',
        }}
      />
      <div 
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-[130px] opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(14, 165, 233, 0.06) 50%, transparent 80%)',
        }}
      />
      <div 
        className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* Floating Acoustic Wave Geometry SVG */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-35" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="soft-blue-wave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
          </linearGradient>
          <pattern id="light-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(2, 132, 199, 0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Micro Grid Background */}
        <rect width="100%" height="100%" fill="url(#light-grid)" />

        {/* Dynamic Sine Waves */}
        <path
          d="M-100 280 C 300 120, 600 440, 1100 240 C 1400 120, 1700 380, 2100 220"
          fill="none"
          stroke="url(#soft-blue-wave)"
          strokeWidth="1.5"
          className="animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <path
          d="M-100 340 C 350 200, 650 500, 1150 300 C 1450 180, 1750 440, 2100 280"
          fill="none"
          stroke="url(#soft-blue-wave)"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
