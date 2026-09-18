import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode,
  Download
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { WaveformCanvas } from '../visualizers/WaveformCanvas';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { audioEngine } from '../../services/audioEngine';
import { LiquidButton } from '../ui/liquid-glass-button';
import { RealLifeVoiceInputFrame } from '../pipeline/RealLifeVoiceInputFrame';

interface LiveAnalysisScreenProps {
  incident: AnalysisIncident;
  onNavigate: (screen: ScreenId) => void;
  soundEnabled: boolean;
  onShowToast?: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const LiveAnalysisScreen: React.FC<LiveAnalysisScreenProps> = ({
  incident,
  onNavigate,
  soundEnabled,
  onShowToast,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(4); // default all completed
  const [stageProgress, setStageProgress] = useState<number[]>([100, 100, 100, 100, 100]);
  const [selectedInspectorStage, setSelectedInspectorStage] = useState<number>(2); // Default inspect Spectral & Phase

  const stages = incident.pipelineStages;

  const stageTechnicalSpecs = [
    {
      title: "Step 1: Audio Intake & Signal Cleanup",
      engine: "WebAudio DSP Core v2.4 (PCM 32-bit Float)",
      metrics: [
        { label: "Sample Rate", value: `${incident.audioMetadata.sampleRateHz} Hz` },
        { label: "Channel Topology", value: incident.audioMetadata.channels === 1 ? "Mono (Diarized)" : "Stereo 2ch" },
        { label: "Pre-Emphasis Filter", value: "α = 0.97 (High-pass)" },
        { label: "DC Offset Removal", value: "-52.4 dB (Attenuated)" },
        { label: "RMS Input Energy", value: "-18.2 dBFS" },
      ],
      details: "Raw audio stream is buffered exclusively in volatile RAM. A high-pass pre-emphasis filter eliminates DC bias and low-frequency rumble below 70 Hz before Fourier decomposition."
    },
    {
      title: "Step 2: Voice Separation & Speaker Isolation",
      engine: "PyAnnote 3.1 + Silero VAD Ensemble",
      metrics: [
        { label: "Speakers Isolated", value: `${incident.speakers.length} Unique Timbral Tracks` },
        { label: "VAD Sensitivity", value: "99.2% Voice Frame Catch" },
        { label: "Overlap Ratio", value: "0.038 (Clean Turns)" },
        { label: "Latency", value: "68 ms Streaming Window" },
        { label: "Silence Threshold", value: "-45 dB Gate" },
      ],
      details: "Performs speaker segmentation into discrete chronological turns. Unsupervised spectral clustering separates interleaved cross-talk into isolated acoustic speaker lanes."
    },
    {
      title: "Step 3: AI Deepfake & Vocoder Anomaly Scan",
      engine: "WavLM-Large + Biquad Phase Inversion Probes",
      metrics: [
        { label: "Vocoder Cutoff", value: incident.riskCategory === 'synthetic_high' ? "7.2 kHz Brickwall" : "> 16 kHz Wideband" },
        { label: "Phase Jitter (PPQ5)", value: incident.riskCategory === 'synthetic_high' ? "0.08% (Unnatural Flat)" : "0.58% (Organic)" },
        { label: "Harmonic/Noise Ratio", value: "24.6 dB" },
        { label: "Glottal Regularity", value: incident.riskCategory === 'synthetic_high' ? "Synthetic Periodic" : "Human Micro-Variation" },
        { label: "Anomaly Flag Level", value: incident.riskCategory === 'synthetic_high' ? "CRITICAL DISCONTINUITY" : "NOMINAL HUMAN" },
      ],
      details: "Probes the signal for neural vocoder signatures: phase incoherence across harmonic boundaries, unnatural robotic regularities in vocal cord pitch periods, and synthetic brickwall frequency roll-offs."
    },
    {
      title: "Step 4: Biometric Voiceprint Identity Match",
      engine: "ECAPA-TDNN 512-Dimensional Vector Index",
      metrics: [
        { label: "Embedding Size", value: "512 Float32 Dimensions" },
        { label: "Scored Identity", value: incident.biometricMatch?.targetName || "Elena Vance (VIP-EXEC-9402)" },
        { label: "Cosine Distance", value: incident.biometricMatch?.cosineDistance ? incident.biometricMatch.cosineDistance.toFixed(4) : "0.1428" },
        { label: "Match Confidence", value: incident.biometricMatch ? `${incident.biometricMatch.voiceprintSimilarity}%` : "94.2%" },
        { label: "FAR / FRR Spec", value: "< 0.001% (Enterprise Grade Specification)" },
      ],
      details: "Extracts deep acoustic speaker embeddings and evaluates cosine distance against enrolled executive voiceprints stored in the cryptographic organizational directory."
    },
    {
      title: "Step 5: Authenticity Verdict & Final Risk Score",
      engine: "Resona Multi-Head Bayesian Evidence Synthesizer",
      metrics: [
        { label: "Calibrated Risk Score", value: `${incident.riskScore.toFixed(1)} / 100` },
        { label: "Confidence Interval", value: `±${incident.confidenceInterval.marginOfError}%` },
        { label: "Uncertainty Rating", value: `${incident.uncertaintyScore.toFixed(1)}% (Low Uncertainty)` },
        { label: "Zero-Disk Purge", value: "VERIFIED RAM ONLY" },
        { label: "Verdict Status", value: incident.verdictLabel },
      ],
      details: "Fuses all acoustic, spectral, phase, and biometric evidence vectors into a mathematically calibrated synthetic likelihood score, generating an auditable forensic verdict dossier."
    }
  ];

  const handleStartPipeline = () => {
    setIsRunning(true);
    setActiveStageIdx(0);
    setStageProgress([0, 0, 0, 0, 0]);

    if (soundEnabled) {
      audioEngine.playFeedbackSound('ping');
    }

    const isSynthetic = incident.riskCategory === 'synthetic_high';
    audioEngine.play(isSynthetic ? 'synthetic' : 'human', incident.audioMetadata.durationSeconds);

    let current = 0;
    const interval = setInterval(() => {
      setStageProgress((prev) => {
        const next = [...prev];
        if (next[current] < 100) {
          next[current] = Math.min(100, next[current] + 25);
        }
        return next;
      });

      if (stageProgress[current] >= 100) {
        current += 1;
        setActiveStageIdx(current);
        setSelectedInspectorStage(Math.min(current, 4));
        if (current >= stages.length) {
          clearInterval(interval);
          setIsRunning(false);
          setActiveStageIdx(stages.length - 1);
          if (soundEnabled) {
            audioEngine.playFeedbackSound(isSynthetic ? 'alert' : 'success');
          }
        }
      }
    }, 280);
  };

  const handleReset = () => {
    setIsRunning(false);
    audioEngine.stop();
    setActiveStageIdx(4);
    setStageProgress([100, 100, 100, 100, 100]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-2xl shadow-soft-blue">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              Live Acoustic Processing Pipeline
            </h2>
            <DemoBadge type="live" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-3xl">
            Real-time multi-stage signal decomposition: Conditioning &rarr; Diarization &rarr; Neural Phase &rarr; Biometric ECAPA-TDNN &rarr; Evidence Synthesis
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="p-3 rounded-full border border-sky-200 hover:border-blue-400 bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
            title="Reset Pipeline Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <LiquidButton
            size="lg"
            primary={true}
            onClick={handleStartPipeline}
            disabled={isRunning}
            className="cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current text-white mr-1.5" />
                <span>Simulate Ingest & Decompose</span>
              </>
            )}
          </LiquidButton>
        </div>
      </div>

      {/* Main Signal Display Card with Real-Time Waveform */}
      <div className="rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft-blue space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Live Audio Signal Monitor • {incident.audioMetadata.filename}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>Sampling: <strong>{(incident.audioMetadata.sampleRateHz / 1000).toFixed(1)} kHz</strong></span>
            <span>Duration: <strong>{incident.audioMetadata.durationSeconds}s</strong></span>
            <span>SNR: <strong className="text-emerald-600">+{incident.audioMetadata.snrDb} dB</strong></span>
          </div>
        </div>

        <WaveformCanvas
          duration={incident.audioMetadata.durationSeconds}
          speakers={incident.speakers}
          height={160}
          isLiveMonitoring={isRunning}
        />
      </div>

      {/* Real-Life Voice Input Frame with AI Model Chamber */}
      <RealLifeVoiceInputFrame onShowToast={onShowToast} />

      {/* 5-Step Intuitive Neural Pipeline Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Pipeline Verification Sequence (Step 1 to Step 5)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Click any step below to inspect forensic audio telemetry
          </span>
        </div>

        {/* 5 Nodes with animated connector ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
          {stages.map((st, idx) => {
            const isDone = stageProgress[idx] === 100;
            const isCurrent = idx === activeStageIdx && isRunning;
            const isSelected = selectedInspectorStage === idx;

            const stepLabels = ['STEP 1 • CLEANUP', 'STEP 2 • SEPARATE', 'STEP 3 • AI SCAN', 'STEP 4 • BIOMETRICS', 'STEP 5 • VERDICT'];
            const stepTitles = ['Audio Intake & Clean', 'Voice Separation', 'AI Deepfake Scan', 'Voice Identity Match', 'Authenticity Verdict'];
            const stepSummaries = [
              'Cleans noise, balances gain, and removes low-frequency rumble',
              'Isolates individual speaking turns and vocal timbres',
              'Detects synthetic vocoder roll-off & robotic pitch smoothing',
              'Benchmarks voiceprint against enrolled executive identities',
              'Calibrates multi-factor genuine vs synthetic likelihood',
            ];

            return (
              <div
                key={st.id}
                onClick={() => setSelectedInspectorStage(idx)}
                className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer select-none ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-[0_8px_24px_rgba(37,99,235,0.15)] ring-2 ring-blue-500/20'
                    : isCurrent
                    ? 'border-blue-400 bg-blue-50/40 shadow-soft-blue animate-pulse'
                    : isDone
                    ? 'border-sky-100 bg-white/90 shadow-soft-blue hover:border-blue-200'
                    : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {stepLabels[idx] || `STEP ${idx + 1}`}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        DONE
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                        RUNNING
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2.5 font-display leading-snug">
                    {stepTitles[idx] || st.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-sans">
                    {stepSummaries[idx] || st.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${stageProgress[idx]}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{stageProgress[idx]}%</span>
                    <span>{st.durationMs}ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Deep Algorithmic Telemetry Inspector */}
      {selectedInspectorStage !== null && (
        <div className="p-6 sm:p-7 rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/40 to-white shadow-soft-blue space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <h4 className="text-base font-bold text-slate-900 font-display">
                  {stageTechnicalSpecs[selectedInspectorStage].title}
                </h4>
              </div>
              <span className="text-xs font-mono text-blue-600 font-semibold">
                Engine: {stageTechnicalSpecs[selectedInspectorStage].engine}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-sky-100 shadow-2xs">
                Zero-Disk Volatile Memory
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {stageTechnicalSpecs[selectedInspectorStage].details}
          </p>

          {/* Metrics Key-Value Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {stageTechnicalSpecs[selectedInspectorStage].metrics.map((m, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white border border-sky-100/90 shadow-2xs font-mono text-xs">
                <span className="text-[10px] text-slate-400 block uppercase">{m.label}</span>
                <strong className="text-slate-900 text-xs font-semibold mt-0.5 block truncate">{m.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions Banner */}
      <div className="p-6 sm:p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-sky-200 shadow-2xs">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 font-display">
              Pipeline Inference Complete • Verdict Dossier Ready
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              Calibrated synthetic probability: <strong className="text-blue-600">{incident.syntheticLikelihood.toFixed(1)}%</strong> ({incident.verdictLabel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('workspace')}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Audio Studio
          </button>
          <LiquidButton
            size="default"
            primary={true}
            onClick={() => onNavigate('results')}
            className="cursor-pointer"
          >
            <span>Review Full Verdict Dossier</span>
            <ArrowRight className="h-4 w-4 ml-1 text-white" />
          </LiquidButton>
        </div>
      </div>
    </div>
  );
};
