import React, { useState } from 'react';
import { 
  Lock, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle, 
  EyeOff, 
  Sparkles
} from 'lucide-react';
import { modelRegistry } from '../../data/modelsData';
import { DemoBadge } from '../common/DemoBadge';
import { LiquidButton } from '../ui/liquid-glass-button';

interface PrivacyModelCenterScreenProps {
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const PrivacyModelCenterScreen: React.FC<PrivacyModelCenterScreenProps> = ({
  onShowToast,
}) => {
  const [experimentalPhaseGuard, setExperimentalPhaseGuard] = useState(true);
  const [streamingLatencyOpt, setStreamingLatencyOpt] = useState(false);
  const [rightToErasureTriggered, setRightToErasureTriggered] = useState(false);

  const handleSimulatePurge = () => {
    setRightToErasureTriggered(true);
    onShowToast('success', 'Zero-Disk Ephemeral Purge', 'All audio memory buffers flushed. Zero audio bytes retained on storage.');
    setTimeout(() => setRightToErasureTriggered(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
              Privacy Governance & AI Model Registry
            </h2>
            <DemoBadge type="live" />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Transparent algorithmic boundaries, memory isolation protocols, and compliance controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Lock className="h-3.5 w-3.5" />
            <span>DPDP & GDPR Compliant</span>
          </span>
        </div>
      </div>

      {/* Ephemeral Zero-Disk Architecture Banner */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <EyeOff className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-display">
                Zero-Disk In-Memory Processing Guarantee
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed font-sans">
                Resona operates on an ephemeral streaming pipeline. Incoming audio waveforms are decompressed into volatile memory (RAM), analyzed across neural inference kernels, and immediately discarded upon verdict synthesis. Neither raw audio recordings nor reconstructed speech are ever written to persistent disk storage.
              </p>
            </div>
          </div>

          <LiquidButton
            onClick={handleSimulatePurge}
            disabled={rightToErasureTriggered}
            size="default"
            className="shrink-0 text-white font-semibold text-xs cursor-pointer"
          >
            <Trash2 className="h-4 w-4 text-rose-400 mr-2" />
            <span>{rightToErasureTriggered ? 'Flushing RAM...' : 'Trigger Immediate Cache Flush'}</span>
          </LiquidButton>
        </div>

        {/* Governance parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#080D1A]/80 border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Audio Retention Window:</span>
            <span className="font-bold text-emerald-400">0 Seconds (Ephemeral)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080D1A]/80 border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Biometric Encryption:</span>
            <span className="font-bold text-slate-200">AES-256-GCM / 512-Dim</span>
          </div>
          <div className="p-3 rounded-xl bg-[#080D1A]/80 border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Memory Isolation:</span>
            <span className="font-bold text-indigo-400">Hardware Enclave (TEE)</span>
          </div>
        </div>
      </div>

      {/* Active Model Registry Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">
            Active Neural Model Registry ({modelRegistry.length} Production Architectures)
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Transparent specification of deployed neural networks, inference latency, and verified benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modelRegistry.map((model) => (
            <div
              key={model.id}
              className="p-5 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-mono">
                        {model.name}
                      </h4>
                      <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold px-2 py-0.5 rounded">
                        {model.version}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {model.targetTask}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    model.isExperimental
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {model.isExperimental ? 'EXPERIMENTAL' : 'PRODUCTION'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
                  {model.description}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-[#080D1A]/80 border border-white/5 text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Model Backbone Architecture</span>
                  <span className="font-semibold text-white">{model.architecture}</span>
                </div>
              </div>

              {/* Benchmarks strip */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#080D1A]/80 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Avg Latency</span>
                  <span className="font-bold text-white">{model.inferenceLatencyMs} ms</span>
                </div>
                <div className="p-2 rounded-lg bg-[#080D1A]/80 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Benchmark Acc</span>
                  <span className="font-bold text-emerald-400">{model.accuracyRate}%</span>
                </div>
                <div className="p-2 rounded-lg bg-[#080D1A]/80 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">False Pos Rate</span>
                  <span className="font-bold text-slate-300">{model.falsePositiveRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experimental Features Toggle & System Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Experimental Controls */}
        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-display">
                Experimental Model Heuristics (Beta)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Enable advanced developmental algorithms under evaluation for zero-shot diffusion defense
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl border border-white/10 bg-[#080D1A]/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">PhaseGuard Zero-Shot Detection</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Analyze latent diffusion phase discontinuities</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExperimentalPhaseGuard(!experimentalPhaseGuard)}
                  className={`text-2xl cursor-pointer transition-colors ${experimentalPhaseGuard ? 'text-cyan-400' : 'text-slate-600'}`}
                >
                  {experimentalPhaseGuard ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-[#080D1A]/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Ultra-Low Latency Streaming (&lt; 80ms)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Truncate FFT hop size for real-time IVR interception</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStreamingLatencyOpt(!streamingLatencyOpt)}
                  className={`text-2xl cursor-pointer transition-colors ${streamingLatencyOpt ? 'text-cyan-400' : 'text-slate-600'}`}
                >
                  {streamingLatencyOpt ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Limitations & Hackathon Disclosure */}
        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-display">
                Responsible AI & Hackathon Boundaries
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Smart India Hackathon Prototype Engineering Transparency
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <strong className="text-amber-300 block mb-0.5">Simulation vs Real Inference:</strong>
                Preset cases use deterministic forensic acoustic matrices to showcase explainable UI breakdowns without fabricating actual server inferences.
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <strong className="text-cyan-300 block mb-0.5">Human Oversight Mandatory:</strong>
                Resona adheres to the principle that high-stakes actions (such as freezing large bank transfers) must trigger a secondary challenge rather than irrevocable algorithmic blocking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
