import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Upload, 
  Activity, 
  Cpu, 
  Clock, 
  Sparkles, 
  FileAudio, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { AnalysisIncident, SystemTelemetry } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { WaveformCanvas } from '../visualizers/WaveformCanvas';
import { ScreenId } from '../layout/Navbar';

interface OverviewScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeIncident: AnalysisIncident;
  allIncidents: AnalysisIncident[];
  onSelectIncident: (incident: AnalysisIncident) => void;
  telemetry: SystemTelemetry;
  onFileUpload: (file: File) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onNavigate,
  activeIncident,
  allIncidents,
  onSelectIncident,
  telemetry,
  onFileUpload,
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section with Geometric Light Blue Styling */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/70 p-6 sm:p-8 lg:p-10 shadow-soft-blue">
        {/* Floating subtle geometric accents inside hero card */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-sky-200/30 to-blue-300/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-2 right-1/3 w-32 h-32 border border-sky-300/30 rounded-2xl rotate-12 bg-white/40 backdrop-blur-xs pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-sky-200 text-sky-800 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                AI Voice Intelligence & Defense Lab
              </span>
              <DemoBadge type="demo" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
              Hear Beyond the <br className="hidden sm:inline" />
              <span className="text-gradient-blue">Acoustic Surface.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-sans">
              Resona empowers financial institutions, call centers, and cyber defense teams with transparent, evidence-based voice security. Dissect neural synthetic deepfakes, separate overlapping speakers, and authenticate voiceprints in zero-disk memory.
            </p>

            {/* Quick Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('pipeline')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-soft-blue hover:from-blue-700 hover:to-indigo-700 hover:shadow-glow-blue transition-all cursor-pointer"
              >
                <Activity className="h-4 w-4" />
                <span>Run Live Audio Pipeline</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('results')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-sky-200 text-slate-700 font-semibold text-sm hover:bg-sky-50/80 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="h-4 w-4 text-sky-600" />
                <span>Inspect Forensic Verdict</span>
              </button>
            </div>

            {/* Scenario Quick Launcher Chips */}
            <div className="pt-3">
              <span className="text-xs font-semibold text-slate-500 block mb-2 font-mono uppercase tracking-wider">
                Simulated Forensic Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {allIncidents.slice(0, 4).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                      inc.id === activeIncident.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white/80 hover:bg-sky-50 text-slate-700 border-sky-200/80'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      inc.riskCategory === 'synthetic_high'
                        ? 'bg-red-500'
                        : inc.riskCategory === 'human_verified'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`} />
                    <span className="truncate max-w-[150px]">{inc.title.split(' - ')[0]}</span>
                    <span className="font-mono text-[10px] opacity-80">({inc.riskScore.toFixed(0)}%)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero Visualizer Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-sky-200/90 bg-white/90 p-4 sm:p-5 shadow-soft-blue space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">Live Acoustic Monitor</h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{activeIncident.audioMetadata.filename}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  activeIncident.riskCategory === 'synthetic_high'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : activeIncident.riskCategory === 'human_verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {activeIncident.riskScore.toFixed(0)}% Risk
                </span>
              </div>

              {/* Waveform visualizer */}
              <WaveformCanvas
                duration={activeIncident.audioMetadata.durationSeconds}
                speakers={activeIncident.speakers}
                height={110}
              />

              {/* Quick Mini Metadata */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px]">
                <div className="rounded-lg bg-sky-50/70 p-2 border border-sky-100">
                  <span className="text-slate-400 block text-[10px]">Sampling</span>
                  <span className="font-semibold text-slate-800">{(activeIncident.audioMetadata.sampleRateHz / 1000).toFixed(1)} kHz</span>
                </div>
                <div className="rounded-lg bg-sky-50/70 p-2 border border-sky-100">
                  <span className="text-slate-400 block text-[10px]">SNR Margin</span>
                  <span className="font-semibold text-slate-800">{activeIncident.audioMetadata.snrDb.toFixed(1)} dB</span>
                </div>
                <div className="rounded-lg bg-sky-50/70 p-2 border border-sky-100">
                  <span className="text-slate-400 block text-[10px]">Speakers</span>
                  <span className="font-semibold text-slate-800">{activeIncident.speakers.length || 1} Diarized</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('workspace')}
                className="w-full py-2.5 rounded-xl bg-sky-100/70 hover:bg-sky-200/70 text-sky-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Open in Audio Intelligence Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Telemetry Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">Engine Status</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">OPERATIONAL</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>4 / 4 Models Synced</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">Inference Latency</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{telemetry.averageLatencyMs} ms</div>
            <div className="mt-1 text-xs text-slate-500">
              <span>Streaming FFT Buffer</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">Threat Radar</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600 font-mono">{telemetry.globalThreatLevel}</div>
            <div className="mt-1 text-xs text-slate-500">
              <span>87 Spoof Attempts Blocked</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">Privacy Mode</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-indigo-700 font-mono">ZERO-DISK</div>
            <div className="mt-1 text-xs text-slate-500">
              <span>RAM-Only Ephemeral Pipe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Drag & Drop Audio Upload + Live Ingestion Zone */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl border border-sky-200/80 bg-white shadow-soft-blue">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Audio Ingestion & Diagnostic Gate</h3>
                <p className="text-xs text-slate-500">Drop an uncompressed audio capture to trigger the forensic pipeline</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-sky-50 text-[11px] font-mono font-semibold text-sky-700 border border-sky-200">
                WAV • MP3 • FLAC • M4A
              </span>
            </div>

            {/* Dropzone container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-sky-200 hover:border-sky-400 bg-sky-50/30'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-soft-blue">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop audio file here, or <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports up to 50MB per stream. Audio is processed in browser memory.
                  </p>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Availability Matrix */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 font-display">Active Inference Models</h3>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Dual-branch deep neural networks executing synthetic anomaly scans and speaker separation
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">Resona-DeepVoice-SVD</span>
                      <span className="text-[10px] text-sky-700 font-mono bg-sky-100 px-1.5 py-0.2 rounded font-semibold">v2.4.1</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dual-Stream Conformer + Vocoder Artifacts</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">86ms</span>
                </div>

                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">Resona-AcousticDiarize</span>
                      <span className="text-[10px] text-sky-700 font-mono bg-sky-100 px-1.5 py-0.2 rounded font-semibold">v1.9.4</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Continuous Multi-Speaker Separation</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">110ms</span>
                </div>

                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">Resona-BioPrint-TDNN</span>
                      <span className="text-[10px] text-sky-700 font-mono bg-sky-100 px-1.5 py-0.2 rounded font-semibold">v3.1.0</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">512-Dim ECAPA Biometric Embeddings</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">44ms</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('privacy')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center justify-between cursor-pointer"
            >
              <span>View Full Model Registry & Privacy Governance</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Investigations & Security Audit Feed */}
      <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft-blue">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Recent Voice Forensic Investigations</h3>
            <p className="text-xs text-slate-500">Real-time audit log of screened incoming voice streams across corporate channels</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Case ID</th>
                <th className="pb-3 font-semibold">Incident Title</th>
                <th className="pb-3 font-semibold">Channel Source</th>
                <th className="pb-3 font-semibold">Risk Verdict</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allIncidents.slice(0, 5).map((inc) => (
                <tr key={inc.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 font-mono font-medium text-slate-500">{inc.id}</td>
                  <td className="py-3.5 font-semibold text-slate-900 max-w-xs truncate">{inc.title}</td>
                  <td className="py-3.5 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <FileAudio className="h-3 w-3 text-sky-500" />
                      {inc.source}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      inc.riskCategory === 'synthetic_high'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : inc.riskCategory === 'human_verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inc.riskScore.toFixed(0)}% • {inc.riskCategory === 'synthetic_high' ? 'Synthetic Alert' : inc.riskCategory === 'human_verified' ? 'Verified Human' : 'Uncertain'}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-600">
                    {inc.confidenceInterval.value.toFixed(1)}% (±{inc.confidenceInterval.marginOfError}%)
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => {
                        onSelectIncident(inc);
                        onNavigate('results');
                      }}
                      className="px-2.5 py-1 rounded-md bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 font-medium transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
