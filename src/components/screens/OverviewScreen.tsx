import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Upload, 
  Activity, 
  Cpu, 
  FileAudio, 
  Lock, 
  ArrowRight,
  Fingerprint,
  Sliders,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { AnalysisIncident, SystemTelemetry } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';
import { ScrollSplitCard } from '../home/ScrollSplitCard';

interface OverviewScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeIncident: AnalysisIncident;
  allIncidents: AnalysisIncident[];
  onSelectIncident: (incident: AnalysisIncident) => void;
  telemetry: SystemTelemetry;
  onFileUpload: (file: File) => void;
  onOpenAccountSetup?: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onNavigate,
  activeIncident,
  allIncidents,
  onSelectIncident,
  telemetry,
  onFileUpload,
  onOpenAccountSetup,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file: File) => {
    const validExts = ['.wav', '.mp3', '.m4a', '.ogg', '.flac'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setUploadError('Invalid format. Please upload WAV, MP3, M4A, or FLAC audio.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds 50MB ceiling limit.');
      return;
    }
    onFileUpload(file);
  };

  return (
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. HERO SECTION: BOLD, CONFIDENT & EDITORIAL                  */}
      {/* ============================================================ */}
      <section className="relative text-center pt-8 sm:pt-12 pb-6 max-w-4xl mx-auto space-y-6">
        {/* Modern Enterprise Status Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-sky-100 text-xs font-mono text-slate-700 shadow-soft-blue backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-semibold text-slate-900">Voice Intelligence & Identity Security</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-600 font-bold">Smart India Hackathon</span>
        </div>

        {/* Big Editorial Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.05]">
          Hear Beyond the <br />
          <span className="text-gradient-blue">Acoustic Surface.</span>
        </h1>

        {/* Clear, High-Impact Supporting Copy */}
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
          Detect neural synthetic voices, separate diarized speakers, and benchmark callers against verified biometric voiceprints with transparent physical DSP evidence.
        </p>

        {/* Primary Liquid Button CTA Suite */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <LiquidButton
            size="xl"
            primary={true}
            onClick={() => onNavigate('pipeline')}
            className="cursor-pointer"
          >
            <span>Launch Live Voice Pipeline</span>
            <ArrowRight className="h-5 w-5 text-white ml-1" />
          </LiquidButton>

          {onOpenAccountSetup && (
            <button
              onClick={onOpenAccountSetup}
              className="h-14 px-7 rounded-full bg-blue-50/80 hover:bg-blue-100/80 border border-sky-200 text-base font-semibold text-blue-700 transition-all cursor-pointer flex items-center gap-2 shadow-soft-blue"
            >
              <Fingerprint className="h-5 w-5 text-blue-600" />
              <span>Record Voiceprint</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('workspace')}
            className="h-14 px-7 rounded-full bg-white hover:bg-sky-50/80 border border-sky-200 text-base font-semibold text-slate-800 transition-all cursor-pointer flex items-center gap-2 shadow-soft-blue hover:border-blue-300"
          >
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Audio Studio</span>
          </button>
        </div>


        {/* Key Real-Time Metrics Strip */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-sky-100 shadow-soft-blue text-center">
            <span className="text-xl sm:text-2xl font-black text-blue-600 font-display block">99.4%</span>
            <span className="text-slate-500 text-[11px]">Synthetic Detection Acc</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-sky-100 shadow-soft-blue text-center">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-display block">&lt; 85ms</span>
            <span className="text-slate-500 text-[11px]">Streaming Diarization</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/90 border border-sky-100 shadow-soft-blue text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-display block">0 Bytes</span>
            <span className="text-slate-500 text-[11px]">RAM Ephemeral Storage</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SCROLL SPLIT CARD (HOMEPAGE ONLY)                         */}
      {/* ============================================================ */}
      <section className="relative w-full">
        <ScrollSplitCard
          onNavigate={onNavigate}
          activeIncident={activeIncident}
        />
      </section>

      {/* ============================================================ */}
      {/* 3. SECTION A: HOW RESONA WORKS (4-STEP PIPELINE)             */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto space-y-8 pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
            Signal Pipeline Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            How Resona Analyzes Audio
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            A 4-step pipeline designed for transparency, physical acoustic validity, and zero-disk privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-3 hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                STEP 01
              </span>
              <FileAudio className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Audio Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Wideband 44.1kHz / 16kHz PCM stream ingest with automated gain normalization and Signal-to-Noise Ratio (SNR) qualification.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-3 hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                STEP 02
              </span>
              <Layers className="h-5 w-5 text-sky-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Speaker Diarization</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Multi-scale spectral clustering separates continuous overlapping speech into isolated acoustic speaker lanes for targeted analysis.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-3 hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                STEP 03
              </span>
              <Cpu className="h-5 w-5 text-indigo-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Voice Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Dual-stream Conformer and SincNet scan for phase irregularities, vocoder cutoff thresholds, and ECAPA biometric distance.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-3 hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                STEP 04
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Evidence-Based Verdict</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Synthesizes an explainable evidence dossier with calibrated confidence and uncertainty margins rather than opaque scores.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SECTION B: CORE CAPABILITIES                              */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-1">
              Core Forensic Capabilities
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-full border border-sky-100 shadow-2xs">
            Resona Architecture v2.4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl space-y-3.5 shadow-soft-blue hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Core
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Synthetic Voice Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Detects diffusion vocoders, phase inconsistencies, and unnatural glottal pulse regularities characteristic of voice cloning models.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl space-y-3.5 shadow-soft-blue hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Core
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Speaker Diarization</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Separates multi-speaker telephone audio and conference recordings into discrete acoustic tracks with individual mute and solo channel controls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl space-y-3.5 shadow-soft-blue hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Fingerprint className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Core
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Biometric Identity Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Extracts 512-dimensional ECAPA-TDNN deep embeddings to compare incoming callers against enrolled executive voiceprint baselines.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. AUDIO INGESTION GATE: BIGGER DROPZONE & QUICK DEMOS       */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Acoustic Signal Ingestion Gate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Drop an audio recording for immediate physical signal decomposition or select a preset scenario:
          </p>
        </div>

        {/* Big Drag and drop container */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center backdrop-blur-xl ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
              : 'border-sky-200 bg-white/90 hover:border-blue-400 shadow-soft-blue'
          }`}
        >
          <input
            type="file"
            id="audio-upload"
            className="hidden"
            accept=".wav,.mp3,.m4a,.ogg,.flac"
            onChange={handleFileInput}
          />
          <label htmlFor="audio-upload" className="cursor-pointer block space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-sky-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                Click to browse audio files or drag and drop here
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                WAV, MP3, FLAC, M4A up to 50MB • In-memory 100% ephemeral processing
              </p>
            </div>
          </label>

          {uploadError && (
            <p className="text-xs font-mono text-rose-600 mt-3">{uploadError}</p>
          )}

          {/* Quick Scenario Preset Chips */}
          <div className="pt-6 border-t border-slate-100 mt-6">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-3">
              Or Benchmark With Pre-Calibrated Scenarios:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {allIncidents.slice(0, 4).map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc);
                    onNavigate('pipeline');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-xs font-medium text-slate-700 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  <span className={`h-2 w-2 rounded-full ${
                    inc.riskCategory === 'synthetic_high'
                      ? 'bg-rose-500'
                      : inc.riskCategory === 'human_verified'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`} />
                  <span className="font-semibold text-slate-900">{inc.title.split(':')[0]}</span>
                  <span className="font-mono text-slate-400 text-[10px]">({inc.audioMetadata.durationSeconds}s)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. EPHEMERAL ZERO-DISK PRIVACY BANNER                        */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto">
        <div className="p-7 rounded-3xl border border-sky-100 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 shadow-soft-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Zero-Disk Volatile Processing Guarantee
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mt-0.5 max-w-xl">
                Raw audio streams reside in transient RAM exclusively for inference duration. No acoustic audio is ever written to persistent disk storage or utilized for foundation model retraining.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('privacy')}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 border border-sky-200 text-xs font-semibold text-blue-700 transition-colors cursor-pointer shadow-2xs"
          >
            Audit Architecture
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FINAL CALL TO ACTION                                      */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_16px_40px_rgba(37,99,235,0.25)] text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Ready to Verify Voice Authenticity?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Begin with real-time acoustic inspection, run speaker separation, and generate verifiable forensic proof.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <LiquidButton
              size="lg"
              className="bg-white text-blue-600 hover:text-blue-700 font-bold shadow-lg"
              onClick={() => onNavigate('pipeline')}
            >
              <span>Explore Live Pipeline</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </LiquidButton>
          </div>
        </div>
      </section>
    </div>
  );
};
