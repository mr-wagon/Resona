import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Fingerprint, 
  Waves, 
  Cpu, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import { AnalysisIncident, PipelineStage } from '../../types';
import { WaveformCanvas } from '../visualizers/WaveformCanvas';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { audioEngine } from '../../services/audioEngine';

interface LiveAnalysisScreenProps {
  incident: AnalysisIncident;
  onNavigate: (screen: ScreenId) => void;
  soundEnabled: boolean;
}

export const LiveAnalysisScreen: React.FC<LiveAnalysisScreenProps> = ({
  incident,
  onNavigate,
  soundEnabled,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(4); // default to all completed
  const [stageProgress, setStageProgress] = useState<number[]>([100, 100, 100, 100, 100]);

  // Stage details
  const stages = incident.pipelineStages;

  const handleStartPipeline = () => {
    setIsRunning(true);
    setActiveStageIdx(0);
    setStageProgress([0, 0, 0, 0, 0]);

    if (soundEnabled) {
      audioEngine.playFeedbackSound('ping');
    }

    // Play demo audio
    const isSynthetic = incident.riskCategory === 'synthetic_high';
    audioEngine.play(isSynthetic ? 'synthetic' : 'human', incident.audioMetadata.durationSeconds);

    // Simulate progressive execution across the 5 pipeline stages
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-display">
              Live Acoustic Processing Pipeline
            </h2>
            <DemoBadge type="live" />
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Real-time multi-stage signal decomposition: Conditioning &rarr; Diarization &rarr; Neural SVD &rarr; Biometric ECAPA-TDNN &rarr; Evidence Synthesis
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartPipeline}
            disabled={isRunning}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-soft-blue cursor-pointer ${
              isRunning
                ? 'bg-sky-100 text-sky-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-glow-blue'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Simulate Live Analysis Run</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset Pipeline State"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Live Waveform Monitor & Speaker Lanes */}
      <div className="rounded-2xl border border-sky-200/90 bg-white p-6 shadow-soft-blue space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-display">
                  {incident.audioMetadata.filename}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {incident.audioMetadata.codec} • {(incident.audioMetadata.sampleRateHz / 1000).toFixed(1)} kHz
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Active acoustic waveform with neural speaker diarization timebands
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Stream Active
            </span>
          </div>
        </div>

        {/* Canvas Waveform */}
        <WaveformCanvas
          duration={incident.audioMetadata.durationSeconds}
          speakers={incident.speakers}
          height={140}
          isLiveMonitoring={isRunning}
        />

        {/* Diarized Speaker Separation Lanes */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold font-mono text-slate-500 uppercase tracking-wider block">
            Diarized Speaker Segmentation Lanes ({incident.speakers.length} tracks detected)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incident.speakers.map((spk, idx) => (
              <div
                key={spk.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  spk.isFlaggedSynthetic
                    ? 'border-red-200 bg-red-50/40 text-red-950'
                    : 'border-sky-200 bg-sky-50/40 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: spk.color }}
                    />
                    <span className="text-xs font-bold font-mono">{spk.speakerLabel}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    spk.isFlaggedSynthetic
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {spk.isFlaggedSynthetic ? 'POTENTIAL SYNTHETIC' : 'AUTHENTIC HUMAN'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span>Speaker: <strong>{spk.speakerName}</strong></span>
                  <span>Active: {spk.startTime.toFixed(1)}s – {spk.endTime.toFixed(1)}s</span>
                  <span>F0 Pitch: ~{spk.f0MeanHz.toFixed(0)} Hz</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Stage Interactive Pipeline Execution Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Processing Pipeline Architecture (5-Stage Ensemble)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Current Stage: <span className="font-bold text-blue-600">{activeStageIdx + 1} of 5</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const isDone = stageProgress[idx] >= 100;
            const isCurrent = activeStageIdx === idx && isRunning;
            const isPending = stageProgress[idx] === 0;

            return (
              <div
                key={stage.id}
                className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-400 bg-sky-50/70 shadow-glow-blue scale-[1.02]'
                    : isDone
                    ? 'border-sky-200 bg-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Stage number badge & icon */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      STAGE 0{idx + 1}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {stage.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 leading-normal">
                    {stage.description}
                  </p>
                </div>

                {/* Progress bar and metrics */}
                <div className="mt-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">{stageProgress[idx]}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-400 to-blue-600'
                      }`}
                      style={{ width: `${stageProgress[idx]}%` }}
                    />
                  </div>

                  {stage.metricsSummary && (
                    <div className="mt-2 space-y-0.5 text-[10px] font-mono text-slate-600 bg-sky-50/50 p-1.5 rounded">
                      {Object.entries(stage.metricsSummary).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-400">{k}:</span>
                          <span className="font-semibold text-slate-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immediate Transition Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white text-blue-600 shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Pipeline Inferences Ready for Inspection</h4>
            <p className="text-[11px] text-slate-600">Explore calibrated synthetic likelihood, 4 forensic evidence cards, and security action playbooks.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('results')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-blue flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>View Detection Results</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
