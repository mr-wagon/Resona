import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Maximize2, 
  FileAudio, 
  Volume1, 
  Activity, 
  Download, 
  ShieldAlert, 
  Eye, 
  Layers, 
  Info,
  Radio,
  Repeat
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { WaveformCanvas } from '../visualizers/WaveformCanvas';
import { SpectrogramCanvas } from '../visualizers/SpectrogramCanvas';
import { audioEngine } from '../../services/audioEngine';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';

interface WorkspaceScreenProps {
  incident: AnalysisIncident;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  incident,
  onNavigate,
  onShowToast,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeView, setActiveView] = useState<'both' | 'waveform' | 'spectrogram'>('both');
  const [soloSpeakerId, setSoloSpeakerId] = useState<string | null>(null);
  const [mutedSpeakerIds, setMutedSpeakerIds] = useState<string[]>([]);
  const [loopEnabled, setLoopEnabled] = useState(false);

  const duration = incident.audioMetadata.durationSeconds;

  useEffect(() => {
    const checkPlaying = setInterval(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTime(audioEngine.getCurrentTime());
    }, 100);

    return () => clearInterval(checkPlaying);
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      const isSynthetic = incident.riskCategory === 'synthetic_high';
      audioEngine.play(isSynthetic ? 'synthetic' : 'human', duration);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    audioEngine.setPlaybackRate(speed);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audioEngine.setVolume(v);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.85);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSoloSpeaker = (spkId: string) => {
    if (soloSpeakerId === spkId) {
      setSoloSpeakerId(null);
      setMutedSpeakerIds([]);
      onShowToast('info', 'Solo Cleared', 'All speaker acoustic channels restored.');
    } else {
      setSoloSpeakerId(spkId);
      const otherIds = incident.speakers.filter((s) => s.id !== spkId).map((s) => s.id);
      setMutedSpeakerIds(otherIds);
      onShowToast('info', 'Speaker Isolated', `Now soloing ${incident.speakers.find(s => s.id === spkId)?.speakerLabel}.`);
    }
  };

  const handleToggleMuteSpeaker = (spkId: string) => {
    if (mutedSpeakerIds.includes(spkId)) {
      setMutedSpeakerIds(mutedSpeakerIds.filter((id) => id !== spkId));
    } else {
      setMutedSpeakerIds([...mutedSpeakerIds, spkId]);
    }
  };

  const handleExportAcousticReport = () => {
    const reportData = {
      caseId: incident.id,
      title: incident.title,
      timestamp: incident.timestamp,
      audioMetadata: incident.audioMetadata,
      syntheticRiskScore: incident.riskScore,
      verdict: incident.verdictLabel,
      evidenceSummary: incident.evidenceList.map((e) => ({
        title: e.title,
        observedValue: e.observedValue,
        thresholdNormal: e.thresholdNormal,
      })),
      diarizedSpeakers: incident.speakers,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RESONA_Acoustic_Report_${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('success', 'Acoustic Report Exported', `Saved forensic telemetry as JSON for ${incident.id}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Workspace Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-sky-100 bg-white shadow-soft-blue">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-soft-blue">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 font-display">
                Audio Intelligence Workspace
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
                {incident.audioMetadata.filename}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Interactive dual-view waveform and spectrogram forensic inspection laboratory
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveView('both')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeView === 'both' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setActiveView('waveform')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeView === 'waveform' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Waveform Only
            </button>
            <button
              onClick={() => setActiveView('spectrogram')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeView === 'spectrogram' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Spectrogram Only
            </button>
          </div>

          <button
            onClick={handleExportAcousticReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Acoustic JSON</span>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-soft-blue hover:from-blue-700 hover:to-indigo-700 transition-colors cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Verdict Review</span>
          </button>
        </div>
      </div>

      {/* Main Forensic Display Card */}
      <div className="rounded-2xl border border-sky-200/90 bg-white p-6 shadow-soft-blue space-y-6">
        {/* Waveform View */}
        {(activeView === 'both' || activeView === 'waveform') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold font-mono uppercase text-slate-800 tracking-wider">
                  Time-Domain Acoustic Amplitude (Waveform)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Peak FS: -1.2 dBFS • Dynamic Range: 78 dB
              </span>
            </div>

            <WaveformCanvas
              duration={duration}
              speakers={incident.speakers}
              height={140}
              onSeek={handleSeek}
              isLiveMonitoring={isPlaying}
            />
          </div>
        )}

        {/* Spectrogram View */}
        {(activeView === 'both' || activeView === 'spectrogram') && (
          <div className="space-y-2">
            <SpectrogramCanvas
              duration={duration}
              height={180}
              highlightAnomaly={incident.riskCategory === 'synthetic_high'}
              anomalyCeilingHz={7200}
            />
          </div>
        )}

        {/* Master Playback Controls Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Play/Pause/Stop */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-soft-blue hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(0)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Return to Start"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setLoopEnabled(!loopEnabled)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                loopEnabled
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title={loopEnabled ? 'Loop Active' : 'Loop Inactive'}
            >
              <Repeat className="h-4 w-4" />
            </button>

            {/* Time Stamp display */}
            <div className="font-mono text-xs font-semibold text-slate-700 bg-sky-50/70 border border-sky-100 px-3 py-1.5 rounded-xl">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-400 mx-1.5">/</span>
              <span className="text-slate-500">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs font-mono">
            <span className="text-slate-400 text-[10px] mr-1 uppercase">Speed:</span>
            {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  playbackSpeed === rate
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4 text-sky-600" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Speaker Separation & Acoustic Isolation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Diarized Speaker Isolation & Channel Controls
                </h3>
                <p className="text-xs text-slate-500">
                  Isolate individual speaker tracks to audit neural vocoder characteristics in solo
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                DiarizeNet v1.9
              </span>
            </div>

            <div className="space-y-3">
              {incident.speakers.map((spk) => {
                const isSolo = soloSpeakerId === spk.id;
                const isMutedSpk = mutedSpeakerIds.includes(spk.id);

                return (
                  <div
                    key={spk.id}
                    className={`p-4 rounded-xl border transition-all ${
                      spk.isFlaggedSynthetic
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-sky-200 bg-sky-50/30'
                    } ${isMutedSpk ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: spk.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 font-mono">
                              {spk.speakerLabel}
                            </h4>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              spk.isFlaggedSynthetic
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}>
                              {spk.isFlaggedSynthetic ? 'Synthetic Flag' : 'Human Baseline'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Claimed Identity: <strong>{spk.speakerName}</strong> • {spk.startTime.toFixed(1)}s to {spk.endTime.toFixed(1)}s
                          </p>
                        </div>
                      </div>

                      {/* Solo / Mute Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSoloSpeaker(spk.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSolo
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          SOLO
                        </button>
                        <button
                          onClick={() => handleToggleMuteSpeaker(spk.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            isMutedSpk
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          MUTE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Acoustic Technical Inspector */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Acoustic Signal Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Detailed DSP physical measurements extracted from raw frames
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Signal-to-Noise Ratio (SNR):</span>
                <span className="font-bold text-slate-800">{incident.audioMetadata.snrDb.toFixed(1)} dB</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Fundamental Pitch (F0 Mean):</span>
                <span className="font-bold text-slate-800">
                  {incident.speakers[0]?.f0MeanHz ? `${incident.speakers[0].f0MeanHz.toFixed(1)} Hz` : '124.2 Hz'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Period Jitter (PPQ):</span>
                <span className={`font-bold ${
                  incident.riskCategory === 'synthetic_high' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {incident.riskCategory === 'synthetic_high' ? '0.04% (Unnatural Flat)' : '0.82% (Biological)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Amplitude Shimmer (APQ):</span>
                <span className="font-bold text-slate-800">
                  {incident.riskCategory === 'synthetic_high' ? '0.12% (Static Machine)' : '2.14% (Organic Human)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Spectral Rolloff Frequency:</span>
                <span className="font-bold text-slate-800">
                  {incident.riskCategory === 'synthetic_high' ? '7,200 Hz (Cutoff Ceiling)' : '16,200 Hz (Full Band)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Audio Codec / Container:</span>
                <span className="font-bold text-slate-800">{incident.audioMetadata.codec}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-900 leading-relaxed font-sans">
                Acoustic markers are evaluated against empirical physiological vocal tract baselines. Synthetic vocoders fail to replicate aerodynamic glottal jitter and natural respiratory pauses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
