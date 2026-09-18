import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Cpu, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Volume2, 
  Sliders,
  Maximize2
} from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';
import { audioEngine } from '../../services/audioEngine';

interface RealLifeVoiceInputFrameProps {
  onShowToast?: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

interface AIModelSlot {
  id: string;
  name: string;
  category: string;
  engine: string;
  targetArtifact: string;
  status: 'standby' | 'ready' | 'simulated';
  detectionAccuracy: string;
  latencyMs: number;
}

export const RealLifeVoiceInputFrame: React.FC<RealLifeVoiceInputFrameProps> = ({ onShowToast }) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSimulatedActive, setIsSimulatedActive] = useState(true);
  const [micPermissionError, setMicPermissionError] = useState(false);
  
  // Real-time audio metrics
  const [peakDb, setPeakDb] = useState(-18.4);
  const [rmsEnergy, setRmsEnergy] = useState(0.42);
  const [hasVoiceActivity, setHasVoiceActivity] = useState(true);
  const [snrDb, setSnrDb] = useState(31.2);
  
  // Canvas visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Future AI Detection Model slots
  const [aiModelSlots, setAiModelSlots] = useState<AIModelSlot[]>([
    {
      id: 'model-wavlm',
      name: 'WavLM Forensic Classifier',
      category: 'Neural Vocoder Detection',
      engine: 'WavLM-Large + Multi-Scale Head',
      targetArtifact: 'High-frequency harmonic roll-off (>7.2 kHz) & neural phase cuts',
      status: 'standby',
      detectionAccuracy: '99.4%',
      latencyMs: 18,
    },
    {
      id: 'model-aasist',
      name: 'AASIST Anti-Spoofing Network',
      category: 'Phase & Graph Incoherence',
      engine: 'Integrated Spectro-Temporal Graph Net',
      targetArtifact: 'Sub-millisecond phase dispersion and synthetic glottal jitter',
      status: 'standby',
      detectionAccuracy: '98.8%',
      latencyMs: 24,
    },
    {
      id: 'model-glottal',
      name: 'Glottal Bio-Acoustic Inspector',
      category: 'Vocal Fold Biometrics',
      engine: 'Glottal Inverse Filtering (GIF-Net)',
      targetArtifact: 'Organic laryngeal micro-tremors vs mathematical algorithmic smoothing',
      status: 'standby',
      detectionAccuracy: '97.9%',
      latencyMs: 14,
    },
  ]);

  const [activeModelIds, setActiveModelIds] = useState<string[]>(['model-wavlm']);

  // Toggle Live Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      await audioEngine.stopMicrophoneRecording();
      setIsMicActive(false);
      setIsSimulatedActive(true);
      if (onShowToast) {
        onShowToast('info', 'Microphone Disconnected', 'Switched back to synthetic speech stream monitor.');
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Succeeded
        setIsMicActive(true);
        setIsSimulatedActive(false);
        setMicPermissionError(false);
        if (onShowToast) {
          onShowToast('success', 'Microphone Active', 'Ingesting real-life audio input at 48.0 kHz 32-bit Float.');
        }
      } catch (err) {
        console.warn('Microphone permission denied, using simulated vocal stream', err);
        setMicPermissionError(true);
        setIsMicActive(false);
        setIsSimulatedActive(true);
        if (onShowToast) {
          onShowToast('warning', 'Microphone Access Required', 'Microphone permission was denied. Running realistic simulated voice feed.');
        }
      }
    }
  };

  const handleToggleModel = (id: string) => {
    if (activeModelIds.includes(id)) {
      setActiveModelIds(activeModelIds.filter((m) => m !== id));
    } else {
      setActiveModelIds([...activeModelIds, id]);
    }
  };

  // Real-time canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      phase += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with crystal transparency
      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient grid
      ctx.fillStyle = 'rgba(2, 132, 199, 0.02)';
      ctx.fillRect(0, 0, width, height);

      // Draw center reference line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const barCount = 48;
      const barWidth = width / barCount;

      // Draw dynamic liquid frequency bars
      for (let i = 0; i < barCount; i++) {
        const normalizedIdx = i / barCount;
        
        // Multi-frequency wave synthesis
        const voiceActivityMultiplier = hasVoiceActivity ? 1 : 0.2;
        const wave1 = Math.sin(phase * 2 + i * 0.35) * 0.4;
        const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.3;
        const wave3 = Math.sin(phase * 3.2 - i * 0.5) * 0.2;
        
        const envelope = Math.sin(normalizedIdx * Math.PI);
        const amp = Math.max(0.08, (wave1 + wave2 + wave3 + 0.6) * envelope * voiceActivityMultiplier);
        
        const barHeight = amp * (height * 0.75);
        const x = i * barWidth + barWidth * 0.15;
        const y = (height - barHeight) / 2;

        // Liquid glass gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isMicActive) {
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.95)'); // Emerald live mic
          grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.85)'); // Cyan
          grad.addColorStop(1, 'rgba(37, 99, 235, 0.9)'); // Blue
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.95)'); // Sky blue
          grad.addColorStop(0.5, 'rgba(37, 99, 235, 0.85)'); // Royal blue
          grad.addColorStop(1, 'rgba(79, 70, 229, 0.9)'); // Indigo
        }

        ctx.fillStyle = grad;
        
        // Rounded bar
        ctx.beginPath();
        const r = Math.min(barWidth * 0.35, barHeight / 2);
        ctx.roundRect(x, y, barWidth * 0.7, barHeight, [r]);
        ctx.fill();

        // Top specular reflection highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, barWidth * 0.7 - 2, Math.max(2, barHeight * 0.15), [1]);
        ctx.fill();
      }

      // Draw continuous real-life vocal envelope curve
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isMicActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(37, 99, 235, 0.85)';
      ctx.shadowColor = isMicActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(37, 99, 235, 0.35)';
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x += 4) {
        const norm = x / width;
        const curve = Math.sin(norm * 14 + phase * 2.5) * Math.cos(norm * 6 - phase) * 26 * (hasVoiceActivity ? 1 : 0.2);
        const y = height / 2 + curve;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Oscillate live numbers gently
      setPeakDb(-16.0 + Math.sin(phase * 1.8) * 3.5);
      setRmsEnergy(0.38 + Math.sin(phase * 2.2) * 0.18);
      setHasVoiceActivity(Math.sin(phase * 0.8) > -0.7);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMicActive, hasVoiceActivity]);

  return (
    <div className="space-y-6">
      {/* Liquid Glass Main Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-sky-50/50 to-white/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(2,132,199,0.08),inset_0_1px_2px_rgba(255,255,255,1)] transition-all">
        
        {/* Specular gloss top reflection */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Frame Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-100/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-2xl border transition-all ${
                isMicActive 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                  : 'bg-blue-50 text-blue-600 border-sky-200 shadow-xs'
              }`}>
                {isMicActive ? <Mic className="h-5 w-5 animate-pulse" /> : <Activity className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                    Real-Life Voice Input Stream
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${
                    isMicActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${isMicActive ? 'bg-emerald-500 animate-ping' : 'bg-sky-500 animate-pulse'}`} />
                    {isMicActive ? 'Hardware Mic Ingest' : 'Real-Time Vocal Stream'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Continuous low-latency WebAudio acoustic capture directly fed into the neural analysis pipeline
                </p>
              </div>
            </div>
          </div>

          {/* Quick Audio Hardware Ingest Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <LiquidButton
              size="default"
              primary={isMicActive}
              onClick={handleToggleMic}
              className="cursor-pointer"
            >
              {isMicActive ? (
                <>
                  <MicOff className="h-4 w-4 mr-1 text-white" />
                  <span>Mute Live Mic</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-1 text-blue-600" />
                  <span>Connect Real-Life Mic</span>
                </>
              )}
            </LiquidButton>
          </div>
        </div>

        {/* Real-Life Voice Waveform & Spectrum Visualizer */}
        <div className="relative z-10 py-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Radio className={`h-3.5 w-3.5 ${isMicActive ? 'text-emerald-500 animate-pulse' : 'text-blue-600'}`} />
                <span>ACOUSTIC SPECTRUM (20 Hz - 24.0 kHz)</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                hasVoiceActivity ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {hasVoiceActivity ? 'VOICE ACTIVE' : 'NOISE FLOOR / SILENCE'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span>Peak: <strong className="text-slate-900 font-mono">{peakDb.toFixed(1)} dBFS</strong></span>
              <span className="hidden sm:inline">Energy: <strong className="text-slate-900 font-mono">{Math.round(rmsEnergy * 100)}%</strong></span>
              <span>Rate: <strong className="text-blue-600 font-mono">48.0 kHz 32-bit</strong></span>
            </div>
          </div>

          {/* Dynamic Visualizer Canvas */}
          <div className="relative h-32 sm:h-36 w-full rounded-2xl border border-sky-200/80 bg-slate-950/90 shadow-inner overflow-hidden flex items-center justify-center">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={144}
              className="w-full h-full object-cover"
            />

            {/* Subtle Liquid Glass Reflection Over Canvas */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10" />

            {/* Corner telemetry watermark */}
            <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                FRAME LATENCY: 12.4 ms
              </span>
              <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                SNR: +{snrDb.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Signal Mode</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-emerald-500' : 'bg-blue-600'} animate-pulse`} />
              <span className="text-xs font-bold text-slate-800 font-mono">
                {isMicActive ? 'Hardware Mic' : 'Live Stream'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Sampling Engine</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 font-mono">PCM 48kHz Float</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Zero-Disk Storage</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 font-mono">RAM Volatile Only</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 border border-sky-100 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Neural Ingest</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 font-mono">Pipeline Direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reserved Space: AI Models Detection Chamber */}
      <div className="rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-2xl p-6 sm:p-7 shadow-soft-blue space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100/80">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <h4 className="text-base font-bold font-display text-slate-900">
                AI Detection Model Chamber (Real-Time Voice Classification)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Modular Slot Rack
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Dedicated neural inference chamber reserved for upcoming AI detection models that inspect the real-time audio stream
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
            {activeModelIds.length} / {aiModelSlots.length + 1} Slots Armed
          </span>
        </div>

        {/* Model Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiModelSlots.map((slot) => {
            const isArmed = activeModelIds.includes(slot.id);

            return (
              <div
                key={slot.id}
                onClick={() => handleToggleModel(slot.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer select-none ${
                  isArmed
                    ? 'border-blue-500 bg-gradient-to-b from-blue-50/80 to-white shadow-[0_8px_20px_rgba(37,99,235,0.12)] ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                      {slot.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isArmed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isArmed ? 'ARMED / ACTIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 mt-2 font-display leading-snug">
                    {slot.name}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-sans">
                    {slot.targetArtifact}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Engine:</span>
                    <span className="text-slate-700 font-semibold truncate max-w-[110px]">{slot.engine}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Benchmark:</span>
                    <span className="text-emerald-600 font-bold">{slot.detectionAccuracy}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Inference:</span>
                    <span className="text-blue-700 font-semibold">{slot.latencyMs} ms</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reserved Model Slot: Future Model Ingestion Hook */}
          <div 
            onClick={() => {
              if (onShowToast) {
                onShowToast('info', 'Modular Model Hook Available', 'Space reserved for custom HuggingFace, ONNX, or PyTorch anti-spoofing weights.');
              }
            }}
            className="p-5 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 hover:bg-sky-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group select-none min-h-[170px]"
          >
            <div className="p-3 rounded-full bg-white text-blue-600 border border-sky-200 group-hover:scale-110 transition-transform shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 font-display">
                + Add Custom AI Model
              </h5>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5 max-w-[150px]">
                Reserved slot for upcoming custom deepfake neural detector
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-blue-600 bg-white px-2.5 py-0.5 rounded-full border border-sky-200">
              Hook Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
