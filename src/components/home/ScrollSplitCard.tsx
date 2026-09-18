"use client";

import React, { useState } from 'react';
import { ScrollSplitCard as ComponentryScrollSplitCard, ScrollSplitCardItem } from '../ui/scroll-split-card';
import { ScreenId } from '../layout/Navbar';
import { AnalysisIncident } from '../../types';
import { Activity, Fingerprint, ShieldCheck, Waves, Cpu, Database } from 'lucide-react';

interface ScrollSplitCardWrapperProps {
  onNavigate: (screen: ScreenId) => void;
  activeIncident: AnalysisIncident;
}

export const ScrollSplitCard: React.FC<ScrollSplitCardWrapperProps> = ({
  onNavigate,
  activeIncident,
}) => {
  const [themeMode, setThemeMode] = useState<'resona' | 'architect'>('resona');

  const resonaCards: ScrollSplitCardItem[] = [
    {
      title: "Phase & Vocoder Forensics",
      description: "Extracts sub-millisecond phase discontinuities, harmonic distortion, and neural vocoder brickwall cutoffs in real-time streams.",
      bgColor: "#FFFFFF",
      textColor: "#0F172A",
      icon: (
        <div className="p-3 rounded-2xl bg-sky-50 text-blue-600 border border-sky-100 shadow-sm">
          <Activity className="h-6 w-6" />
        </div>
      )
    },
    {
      title: "ECAPA-TDNN Biometrics",
      description: "512-dimensional neural speaker embeddings benchmarked against enrolled executive identity voiceprints with cosine distance verification.",
      bgColor: "#1D4ED8",
      textColor: "#FFFFFF",
      icon: (
        <div className="p-3 rounded-2xl bg-white/15 text-white border border-white/20 shadow-sm backdrop-blur-md">
          <Fingerprint className="h-6 w-6" />
        </div>
      )
    },
    {
      title: "Zero-Disk Ephemeral Vault",
      description: "RAM-only execution guarantees zero raw audio bytes are ever written to disk storage. Compliant with DPDP, GDPR, and ISO 27001.",
      bgColor: "#0F172A",
      textColor: "#FFFFFF",
      icon: (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-6 w-6" />
        </div>
      )
    }
  ];

  const architectCards: ScrollSplitCardItem[] = [
    {
      title: "Multi-Channel Audio Ingest",
      description: "Direct SIP/RTP stream capture, browser WebAudio, and lossless FLAC/WAV forensic import at 48kHz / 24-bit depth.",
      bgColor: "#FFFFFF",
      textColor: "#0F172A",
      icon: (
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <Waves className="h-6 w-6" />
        </div>
      )
    },
    {
      title: "Self-Supervised WavLM Backing",
      description: "Trained on over 60,000 hours of acoustic data to discern synthetic vocoder artifacts from natural human vocal tracts.",
      bgColor: "#0284C7",
      textColor: "#FFFFFF",
      icon: (
        <div className="p-3 rounded-2xl bg-white/15 text-white border border-white/20 shadow-sm backdrop-blur-md">
          <Cpu className="h-6 w-6" />
        </div>
      )
    },
    {
      title: "Enterprise Biometric Ledger",
      description: "Deterministic vector hash index allowing sub-50ms cosine match across 100,000+ registered VIP voice profiles.",
      bgColor: "#0F172A",
      textColor: "#FFFFFF",
      icon: (
        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm backdrop-blur-md">
          <Database className="h-6 w-6" />
        </div>
      )
    }
  ];

  const activeCards = themeMode === 'resona' ? resonaCards : architectCards;

  return (
    <div className="relative w-full">
      {/* Category selector */}
      <div className="flex items-center justify-center pb-2">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/90 border border-sky-100 shadow-soft-blue backdrop-blur-xl">
          <button
            onClick={() => setThemeMode('resona')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              themeMode === 'resona'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acoustic Forensics
          </button>
          <button
            onClick={() => setThemeMode('architect')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              themeMode === 'architect'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Architecture
          </button>
        </div>
      </div>

      <ComponentryScrollSplitCard
        imageSrc="/acoustic-spectrogram.jpg"
        cards={activeCards}
        startText="Scroll down or tap to separate layers"
        endText="Hear Beyond the Surface"
      />
    </div>
  );
};
