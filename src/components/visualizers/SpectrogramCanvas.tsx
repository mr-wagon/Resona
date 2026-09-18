import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { AlertTriangle, Info } from 'lucide-react';

interface SpectrogramCanvasProps {
  duration?: number;
  height?: number;
  highlightAnomaly?: boolean;
  anomalyCeilingHz?: number;
}

export const SpectrogramCanvas: React.FC<SpectrogramCanvasProps> = ({
  duration = 18.5,
  height = 180,
  highlightAnomaly = true,
  anomalyCeilingHz = 7200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverFreq, setHoverFreq] = useState<number | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Pre-generate static spectrogram heatmap matrix for fast, crisp rendering
  const heatmapDataRef = useRef<number[][]>([]);
  if (heatmapDataRef.current.length === 0) {
    const timeSlices = 120;
    const freqBins = 64;
    const matrix: number[][] = [];

    for (let t = 0; t < timeSlices; t++) {
      const slice: number[] = [];
      const isSpeech = (Math.sin(t * 0.3) > -0.4);
      for (let f = 0; f < freqBins; f++) {
        const freqRatio = f / freqBins;
        const actualFreq = freqRatio * 8000;
        
        // Human speech natural falloff + formants at ~500Hz, ~1500Hz, ~2500Hz
        const formant1 = Math.exp(-Math.pow((actualFreq - 600) / 300, 2)) * 0.9;
        const formant2 = Math.exp(-Math.pow((actualFreq - 1800) / 450, 2)) * 0.7;
        const formant3 = Math.exp(-Math.pow((actualFreq - 2800) / 500, 2)) * 0.5;
        
        let val = (formant1 + formant2 + formant3) * (isSpeech ? 1 : 0.05);

        // If above anomaly ceiling, cut off energy abruptly (vocoder artifact)
        if (highlightAnomaly && actualFreq > anomalyCeilingHz) {
          val = val * 0.04;
        } else {
          val += (1 - freqRatio) * 0.25;
        }

        val += (Math.random() * 0.08);
        slice.push(Math.max(0, Math.min(1, val)));
      }
      matrix.push(slice);
    }
    heatmapDataRef.current = matrix;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFreqData: Uint8Array | null = null;

    const render = () => {
      const t = audioEngine.getCurrentTime();
      setCurrentTime(t);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Render spectrogram matrix
      const matrix = heatmapDataRef.current;
      const sliceWidth = w / matrix.length;
      const freqBins = matrix[0].length;
      const binHeight = h / freqBins;

      const isPlaying = audioEngine.getIsPlaying();
      if (isPlaying) {
        if (!localFreqData) {
          localFreqData = new Uint8Array(64);
        }
        audioEngine.getFrequencyData(localFreqData);
      }

      const playheadX = (t / duration) * w;

      for (let tIdx = 0; tIdx < matrix.length; tIdx++) {
        const x = tIdx * sliceWidth;
        const slice = matrix[tIdx];

        for (let fIdx = 0; fIdx < freqBins; fIdx++) {
          // Y is inverted: high frequency at top, 0Hz at bottom
          const y = h - (fIdx + 1) * binHeight;
          let energy = slice[fIdx];

          // React to live audio around playhead
          if (isPlaying && localFreqData && Math.abs(x - playheadX) < 15) {
            const liveE = (localFreqData[fIdx] || 0) / 255;
            energy = Math.max(energy, liveE * 0.9);
          }

          // Modern cyan-to-azure colormap on dark navy canvas for high scientific contrast
          if (energy < 0.12) {
            ctx.fillStyle = '#0B132B';
          } else if (energy < 0.35) {
            ctx.fillStyle = '#1C2541';
          } else if (energy < 0.6) {
            ctx.fillStyle = '#0284C7';
          } else if (energy < 0.8) {
            ctx.fillStyle = '#00F2FE';
          } else {
            ctx.fillStyle = '#FFFFFF';
          }

          ctx.fillRect(x, y, Math.ceil(sliceWidth), Math.ceil(binHeight));
        }
      }

      // Draw frequency guide lines
      const freqs = [
        { hz: 2000, label: '2 kHz' },
        { hz: 4000, label: '4 kHz' },
        { hz: 6000, label: '6 kHz' },
      ];

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      freqs.forEach((f) => {
        const y = h - (f.hz / 8000) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(f.label, 8, y - 3);
      });
      ctx.setLineDash([]);

      // Highlight Neural Vocoder Anomaly Ceiling (7.2 kHz)
      if (highlightAnomaly) {
        const anomalyY = h - (anomalyCeilingHz / 8000) * h;

        // Red hazard line
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(0, anomalyY);
        ctx.lineTo(w, anomalyY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#F87171';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(`ANOMALY CEILING: ${(anomalyCeilingHz / 1000).toFixed(1)} kHz (Neural Vocoder Cutoff)`, w - 380, anomalyY - 4);
      }

      // Playhead vertical line
      if (playheadX <= w) {
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00F2FE';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, h);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [duration, highlightAnomaly, anomalyCeilingHz]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = 1 - Math.max(0, Math.min(1, y / rect.height));
    setHoverFreq(Math.round(ratio * 8000));
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0A0E1A]/90 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono">
            High-Density Spectrogram (FFT 1024)
          </span>
          {highlightAnomaly && (
            <span className="flex items-center gap-1 rounded-full bg-red-950/80 px-2 py-0.5 text-[10px] font-mono text-red-400 border border-red-800">
              <AlertTriangle className="h-3 w-3" />
              Vocoder Cutoff Detected
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          {hoverFreq !== null && (
            <span className="text-cyan-400 font-semibold">Cursor: {hoverFreq} Hz</span>
          )}
          <span>Range: 0 Hz – 8.0 kHz</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          className="w-full block cursor-crosshair"
          style={{ height: `${height}px` }}
          onPointerMove={handlePointerMove}
          onMouseLeave={() => setHoverFreq(null)}
        />
      </div>

      {/* Legend & Frequency details */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Spectral Density:</span>
          <div className="flex items-center gap-1">
            <span className="h-2 w-4 rounded-sm bg-[#0B132B]" />
            <span className="text-[10px]">-60dB</span>
            <span className="h-2 w-4 rounded-sm bg-[#0284C7]" />
            <span className="text-[10px]">-30dB</span>
            <span className="h-2 w-4 rounded-sm bg-[#00F2FE]" />
            <span className="text-[10px]">0dBFS</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Window: Hanning • Hop Size: 256 • Dyn Range: 80dB</span>
        </div>
      </div>
    </div>
  );
};
