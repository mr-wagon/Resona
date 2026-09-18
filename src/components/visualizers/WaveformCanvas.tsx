import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import type { SpeakerSegment } from '../../types';

interface WaveformCanvasProps {
  duration: number;
  speakers?: SpeakerSegment[];
  height?: number;
  interactive?: boolean;
  onSeek?: (time: number) => void;
  accentColor?: string;
  isLiveMonitoring?: boolean;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  duration = 18.5,
  speakers = [],
  height = 140,
  interactive = true,
  onSeek,
  accentColor = '#00F2FE',
  isLiveMonitoring = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const animFrameId = useRef<number | null>(null);

  // Generate deterministic pseudo-peaks for realistic visual display
  const peaksRef = useRef<number[]>([]);
  if (peaksRef.current.length === 0) {
    const totalBars = 200;
    const p: number[] = [];
    for (let i = 0; i < totalBars; i++) {
      const pos = i / totalBars;
      const syllabic = Math.sin(pos * 40) * 0.35 + 0.45;
      const speechBurst = Math.sin(pos * 12) > -0.2 ? 1 : 0.08;
      const noise = (Math.random() * 0.25 - 0.125);
      const amp = Math.max(0.06, Math.min(0.95, (syllabic + noise) * speechBurst));
      p.push(amp);
    }
    peaksRef.current = p;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAnalyserData: Uint8Array | null = null;

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

      // Dark obsidian-to-midnight gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090E1A');
      bgGrad.addColorStop(1, '#06080F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Horizontal subtle baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Draw speaker segment regions
      speakers.forEach((spk) => {
        const startX = (spk.startTime / duration) * w;
        const endX = (spk.endTime / duration) * w;
        const segWidth = Math.max(2, endX - startX);

        ctx.fillStyle = spk.isFlaggedSynthetic
          ? 'rgba(239, 68, 68, 0.12)'
          : 'rgba(0, 242, 254, 0.08)';
        ctx.fillRect(startX, 0, segWidth, h);

        ctx.strokeStyle = spk.color || (spk.isFlaggedSynthetic ? '#EF4444' : '#00F2FE');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, 1);
        ctx.lineTo(endX, 1);
        ctx.stroke();
      });

      // Live Web Audio data
      const isPlaying = audioEngine.getIsPlaying() || isLiveMonitoring;
      if (isPlaying) {
        if (!localAnalyserData) {
          localAnalyserData = new Uint8Array(256);
        }
        audioEngine.getWaveformData(localAnalyserData);
      }

      // Waveform bars
      const bars = peaksRef.current;
      const barWidth = w / bars.length;
      const playheadX = (t / duration) * w;

      bars.forEach((peak, i) => {
        const x = i * barWidth;
        let amp = peak;

        if (isPlaying && localAnalyserData) {
          const sampleIdx = Math.floor((i / bars.length) * localAnalyserData.length);
          const liveVal = Math.abs((localAnalyserData[sampleIdx] - 128) / 128);
          if (Math.abs(x - playheadX) < 45) {
            amp = Math.max(amp, liveVal * 0.95);
          }
        }

        const barHeight = Math.max(3, amp * (h - 22));
        const y = (h - barHeight) / 2;
        const isPast = x <= playheadX;

        if (isPast) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#00F2FE');
          grad.addColorStop(0.5, '#38BDF8');
          grad.addColorStop(1, '#6366F1');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        }

        ctx.beginPath();
        ctx.roundRect(x + 0.5, y, Math.max(1.5, barWidth - 1), barHeight, 1.5);
        ctx.fill();
      });

      // Scanning playhead with cyan glow
      if (playheadX <= w) {
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00F2FE';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, h);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Playhead head
        ctx.fillStyle = '#00F2FE';
        ctx.beginPath();
        ctx.arc(playheadX, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(playheadX, 5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hover indicator line
      if (isHovering && interactive) {
        const hoverX = (hoverTime / duration) * w;
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hoverX, 0);
        ctx.lineTo(hoverX, h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [duration, speakers, interactive, isHovering, hoverTime, accentColor, isLiveMonitoring]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.x;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = clickRatio * duration;
    audioEngine.seek(seekTime);
    setCurrentTime(seekTime);
    if (onSeek) onSeek(seekTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.x;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverTime(clickRatio * duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <div className="relative w-full select-none rounded-2xl border border-white/10 bg-[#0A0E1A]/90 p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-xl border border-white/5">
        <canvas
          ref={canvasRef}
          className={`w-full block ${interactive ? 'cursor-pointer' : ''}`}
          style={{ height: `${height}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />
      </div>

      {/* Timeline labels */}
      <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-mono font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00F2FE]" />
          <span className="text-white font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {isHovering && interactive && (
          <div className="rounded-md bg-white/[0.06] px-2 py-0.5 text-cyan-300 border border-cyan-500/30 text-[10px]">
            Seek: {formatTime(hoverTime)}
          </div>
        )}

        <div className="flex items-center gap-3 text-slate-500">
          <span>0.0s</span>
          <span>{(duration * 0.5).toFixed(1)}s</span>
          <span>{duration.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
