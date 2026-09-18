import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Download, 
  ShieldAlert, 
  Repeat, 
  Volume1, 
  Info, 
  Layers, 
  Sparkles, 
  Activity, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Gauge, 
  Mic, 
  MicOff, 
  Fingerprint, 
  ArrowRightLeft, 
  UserCheck, 
  ShieldCheck, 
  TrendingUp, 
  ChevronRight,
  Radio
} from 'lucide-react';
import { AnalysisIncident, VoiceProfile } from '../../types';
import { WaveformCanvas } from '../visualizers/WaveformCanvas';
import { SpectrogramCanvas } from '../visualizers/SpectrogramCanvas';
import { audioEngine } from '../../services/audioEngine';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';
import { initialVoiceProfiles } from '../../data/profilesData';

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

  // Forensic DSP Rack Filters
  const [bandpassFilterActive, setBandpassFilterActive] = useState(false);
  const [pitchZoomActive, setPitchZoomActive] = useState(false);
  const [phaseInversionActive, setPhaseInversionActive] = useState(false);

  // Embedded Audio vs Real-Life Audio Comparative States
  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialVoiceProfiles[0].id);
  const [auditionMode, setAuditionMode] = useState<'sync' | 'saved' | 'reallife'>('sync');
  const [abCrossfader, setAbCrossfader] = useState<number>(0); // -1 = 100% saved, 0 = equal, +1 = 100% real life
  const [isLiveMicComparing, setIsLiveMicComparing] = useState(false);
  const [liveMicRms, setLiveMicRms] = useState(0.35);

  const selectedProfile = initialVoiceProfiles.find((p) => p.id === selectedProfileId) || initialVoiceProfiles[0];
  const duration = incident.audioMetadata.durationSeconds;

  // Comparison metrics calculation
  const isSyntheticIncident = incident.riskCategory === 'synthetic_high';
  const baselineSimilarity = incident.biometricMatch?.voiceprintSimilarity ?? (isSyntheticIncident ? 22.4 : 95.2);
  const matchPassesThreshold = baselineSimilarity >= 78.0;

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
      if (auditionMode === 'saved') {
        audioEngine.play('human', duration);
      } else if (auditionMode === 'reallife') {
        audioEngine.play(isSyntheticIncident ? 'synthetic' : 'human', duration);
      } else {
        // Synchronized audition
        audioEngine.play(isSyntheticIncident ? 'synthetic' : 'human', duration);
      }
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
    } else {
      setSoloSpeakerId(spkId);
    }
  };

  const handleToggleMuteSpeaker = (spkId: string) => {
    if (mutedSpeakerIds.includes(spkId)) {
      setMutedSpeakerIds(mutedSpeakerIds.filter((id) => id !== spkId));
    } else {
      setMutedSpeakerIds([...mutedSpeakerIds, spkId]);
    }
  };

  // Toggle Live Microphone comparison
  const handleToggleLiveMic = async () => {
    if (isLiveMicComparing) {
      await audioEngine.stopMicrophoneRecording();
      setIsLiveMicComparing(false);
      onShowToast('info', 'Microphone Disconnected', 'Studio comparison returned to incoming file audio stream.');
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsLiveMicComparing(true);
        onShowToast('success', 'Real-Life Mic Active', `Now comparing real-time microphone against saved voiceprint of ${selectedProfile.fullName}.`);
      } catch (err) {
        setIsLiveMicComparing(true); // fallback mode
        onShowToast('warning', 'Simulated Live Audio', 'Microphone access unavailable. Streaming live acoustic simulation for comparison.');
      }
    }
  };

  const handleExportAcousticReport = () => {
    const report = {
      incidentId: incident.id,
      timestamp: incident.timestamp,
      enrolledProfileTested: {
        id: selectedProfile.id,
        name: selectedProfile.fullName,
        role: selectedProfile.role,
        embeddingHash: selectedProfile.embeddingHash,
        baselineQuality: selectedProfile.voiceprintQuality,
      },
      comparativeAnalysis: {
        cosineSimilarityPercent: baselineSimilarity,
        verificationFloor: 78.0,
        verdict: matchPassesThreshold ? 'AUTHENTICATED_MATCH' : 'BIOMETRIC_REJECT',
        crossfaderPosition: abCrossfader,
        auditionMode,
      },
      audioMetadata: incident.audioMetadata,
      forensicDspFilters: {
        upperBandpassActive: bandpassFilterActive,
        f0PitchZoom: pitchZoomActive,
        phaseInversionScan: phaseInversionActive,
      },
      acousticMeasurements: {
        snrDb: incident.audioMetadata.snrDb,
        clipping: incident.audioMetadata.clippingPercentage,
        f0MeanHz: incident.speakers[0]?.f0MeanHz || 124.2,
        jitterPpq: isSyntheticIncident ? 0.04 : 0.82,
        shimmerApq: isSyntheticIncident ? 0.12 : 2.14,
        spectralRolloffHz: isSyntheticIncident ? 7200 : 16200,
      },
      speakers: incident.speakers,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RESONA_Comparative_Forensic_Report_${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('success', 'Comparative Report Exported', `Saved dual-track forensic telemetry for ${incident.id}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  // Generate time markers for the ruler
  const timeMarkers = [];
  const step = duration > 15 ? 2 : 1;
  for (let t = 0; t <= duration; t += step) {
    timeMarkers.push(t);
  }

  // Generate 16 vector bar values for 512-D embedding representation
  const vectorBars = [0.82, 0.45, 0.91, 0.33, 0.67, 0.88, 0.24, 0.76, 0.58, 0.94, 0.41, 0.83, 0.72, 0.39, 0.65, 0.89];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Workspace Header Bar with Liquid Glass Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-r from-white/95 via-sky-50/60 to-white/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(2,132,199,0.08),inset_0_1px_2px_rgba(255,255,255,1)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent" />
        
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Forensic Audio Studio & Comparative DSP Rack
              </h2>
              <span className="text-[11px] font-mono px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {incident.audioMetadata.filename}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
              Dual-track comparison: benchmark saved biometric voiceprints against real-life audio with real-time cosine distance
            </p>
          </div>
        </div>

        {/* View Switchers & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-600 shadow-inner">
            <button
              onClick={() => setActiveView('both')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeView === 'both' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Dual Multi-Track
            </button>
            <button
              onClick={() => setActiveView('waveform')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeView === 'waveform' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Waveform
            </button>
            <button
              onClick={() => setActiveView('spectrogram')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeView === 'spectrogram' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Spectrogram
            </button>
          </div>

          <button
            onClick={handleExportAcousticReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 border border-sky-200 hover:bg-sky-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export Report</span>
          </button>

          <LiquidButton
            primary={true}
            size="default"
            onClick={() => onNavigate('results')}
            className="cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            <span>Verdict Dossier</span>
          </LiquidButton>
        </div>
      </div>

      {/* DUAL-TRACK COMPARATIVE FORENSIC ENGINE (Saved Voiceprint vs Real-Life Audio) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-sky-50/40 to-white/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_16px_40px_rgba(2,132,199,0.08),inset_0_1px_2px_rgba(255,255,255,1)] space-y-6">
        
        {/* Specular gloss top edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100/80">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                Acoustic Biometric Comparison Chamber
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                512-D ECAPA-TDNN Matching
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Comparing saved enrolled biometric vector against incoming real-life vocal sample
            </p>
          </div>

          {/* Enrolled Identity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Benchmark Identity:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-sky-200/90 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              {initialVoiceProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Cards: Track A (Saved Embedded Voiceprint) & Track B (Real-Life Audio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* TRACK A: Saved Enrolled Voiceprint (Embedded Audio) */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-sky-200/80 bg-white/80 backdrop-blur-md shadow-soft-blue space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                    TRACK A: SAVED EMBEDDED VOICEPRINT
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ENROLLED BASELINE
                </span>
              </div>

              {/* Profile details */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <img
                  src={selectedProfile.avatarUrl}
                  alt={selectedProfile.fullName}
                  className="w-11 h-11 rounded-xl object-cover border border-sky-100 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate font-display">
                    {selectedProfile.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{selectedProfile.role}</p>
                  <span className="text-[10px] font-mono text-slate-400">{selectedProfile.employeeId}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Baseline Health</span>
                  <span className="text-xs font-bold text-emerald-600">{selectedProfile.voiceprintQuality}%</span>
                </div>
              </div>

              {/* 512-D Neural Vector Visualizer */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>512-D Embedding Vector</span>
                  <span className="text-blue-600 truncate max-w-[120px]">{selectedProfile.embeddingHash}</span>
                </div>
                <div className="h-6 w-full rounded-lg bg-slate-900/90 p-1 flex items-end gap-1">
                  {vectorBars.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-cyan-400"
                      style={{ height: `${val * 100}%` }}
                      title={`Dim ${idx * 32}: ${val.toFixed(2)}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Track A Audition Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setAuditionMode('saved');
                  audioEngine.play('human', 6);
                  onShowToast('info', 'Auditioning Saved Voiceprint', `Playing reference acoustic samples for ${selectedProfile.fullName}.`);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Audition Saved Track</span>
              </button>

              <span className="text-[10px] font-mono text-slate-400">
                F0: ~124 Hz • Clean Glottal
              </span>
            </div>
          </div>

          {/* MIDDLE: Real-Time Cosine Similarity Gauge & Differential Verdict */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-sky-200/80 bg-gradient-to-b from-white to-sky-50/50 backdrop-blur-md shadow-soft-blue flex flex-col items-center justify-between text-center space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              VECTOR SIMILARITY
            </span>

            {/* Circular Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`transition-all duration-700 ${
                    matchPassesThreshold
                      ? 'stroke-emerald-500'
                      : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - baselineSimilarity / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-xl font-extrabold font-mono leading-none ${
                  matchPassesThreshold ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {baselineSimilarity.toFixed(1)}%
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">Floor: 78.0%</span>
              </div>
            </div>

            {/* Biometric Status Tag */}
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                matchPassesThreshold
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300'
              }`}>
                {matchPassesThreshold ? 'IDENTITY VERIFIED' : 'MISMATCH ALERT'}
              </span>
              <p className="text-[10px] text-slate-500 font-sans leading-tight">
                {matchPassesThreshold
                  ? 'Vocal tract matches enrolled baseline'
                  : 'Vector deviates from enrolled identity'}
              </p>
            </div>
          </div>

          {/* TRACK B: Real-Life Audio Input */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-sky-200/80 bg-white/80 backdrop-blur-md shadow-soft-blue space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${
                    isLiveMicComparing ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-sky-50 text-sky-600 border-sky-200'
                  }`}>
                    {isLiveMicComparing ? <Mic className="h-4 w-4 animate-pulse" /> : <Activity className="h-4 w-4" />}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                    TRACK B: REAL-LIFE AUDIO INPUT
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  isLiveMicComparing
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isLiveMicComparing ? 'HARDWARE MIC' : 'INGESTED STREAM'}
                </span>
              </div>

              {/* Real-Life Source Info Box */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Signal Origin</span>
                  <strong className="text-xs font-bold text-slate-900 truncate block">
                    {isLiveMicComparing ? 'Live Microphone Stream (Local Hardware)' : incident.audioMetadata.filename}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {incident.audioMetadata.sampleRateHz} Hz • {incident.audioMetadata.channels === 1 ? 'Mono' : 'Stereo'}
                  </span>
                </div>

                {/* Direct Live Mic button inside Studio */}
                <button
                  onClick={handleToggleLiveMic}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isLiveMicComparing
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 hover:text-blue-700'
                  }`}
                >
                  {isLiveMicComparing ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Stop Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-blue-600" />
                      <span>Compare Mic</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Real-Life Spectrum Ribbon */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Acoustic Frequency Deviation</span>
                  <span className={isSyntheticIncident ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {isSyntheticIncident ? 'Vocoder Cutoff > 7.2kHz Flagged' : 'Organic Vocal Range Verified'}
                  </span>
                </div>
                <div className="h-6 w-full rounded-lg bg-slate-900/90 p-1 flex items-end gap-1">
                  {vectorBars.map((val, idx) => {
                    const alteredVal = isSyntheticIncident ? (idx > 10 ? 0.05 : val * 0.7) : val * 0.95;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-sm ${
                          isSyntheticIncident && idx > 10
                            ? 'bg-rose-500/50'
                            : 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        }`}
                        style={{ height: `${alteredVal * 100}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Track B Audition Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setAuditionMode('reallife');
                  audioEngine.play(isSyntheticIncident ? 'synthetic' : 'human', 6);
                  onShowToast('info', 'Auditioning Real-Life Audio', `Playing real-world vocal input stream.`);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Audition Real-Life Track</span>
              </button>

              <span className="text-[10px] font-mono text-slate-400">
                Peak: -1.2 dBFS • Headroom: +14 dB
              </span>
            </div>
          </div>
        </div>

        {/* Synchronized A/B Crossfader & Comparison Deck */}
        <div className="p-4 rounded-2xl bg-white/70 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">
              A/B Comparison Crossfader:
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                abCrossfader < 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                Track A (Saved)
              </span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={abCrossfader}
                onChange={(e) => setAbCrossfader(parseFloat(e.target.value))}
                className="w-32 sm:w-44 accent-blue-600 cursor-pointer"
              />
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                abCrossfader > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                Track B (Real Life)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuditionMode('sync');
                handleTogglePlay();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-xs font-bold hover:brightness-105 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>{isPlaying ? 'Pause Synchronized Deck' : 'Play Both Synchronized'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Multi-Track Timeline Stage */}
      <div className="rounded-3xl border border-sky-100 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-soft-blue space-y-6">
        {/* Scrubbable Time Ruler Header */}
        <div className="space-y-1.5 select-none">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              TIMELINE RULER (48.0 kHz TIME-BASE)
            </span>
            <span>TOTAL SAMPLES: {(duration * 48000).toLocaleString()} PTS</span>
          </div>

          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPercent = (e.clientX - rect.left) / rect.width;
              handleSeek(clickPercent * duration);
            }}
            className="relative h-7 w-full bg-slate-100/90 rounded-xl border border-slate-200/80 cursor-pointer overflow-hidden flex items-center px-2"
          >
            {/* Timeline Tick Marks */}
            <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
              {timeMarkers.map((t) => (
                <div key={t} className="flex flex-col items-center">
                  <span className="h-2 w-px bg-slate-300" />
                  <span>{t}s</span>
                </div>
              ))}
            </div>

            {/* Playhead Indicator Needle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)] z-20 pointer-events-none"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 -ml-1 bg-rose-600 rounded-full shadow-xs" />
            </div>
          </div>
        </div>

        {/* Waveform Track */}
        {(activeView === 'both' || activeView === 'waveform') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-bold font-mono uppercase text-slate-800 tracking-wider">
                  Track 01: Time-Domain Amplitude & Speaker Segments
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Peak: -1.2 dBFS • Headroom: +14.2 dB
              </span>
            </div>

            <WaveformCanvas
              duration={duration}
              speakers={incident.speakers}
              height={160}
              onSeek={handleSeek}
              isLiveMonitoring={isPlaying}
            />
          </div>
        )}

        {/* Spectrogram Track */}
        {(activeView === 'both' || activeView === 'spectrogram') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span className="text-xs font-bold font-mono uppercase text-slate-800 tracking-wider">
                  Track 02: FFT Short-Time Fourier Spectrogram (20 Hz - 22 kHz)
                </span>
              </div>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                {incident.riskCategory === 'synthetic_high' ? '⚠️ Neural Vocoder Anomaly Highlighted' : '✓ Full Biological Bandwidth'}
              </span>
            </div>

            <SpectrogramCanvas
              duration={duration}
              height={180}
              highlightAnomaly={incident.riskCategory === 'synthetic_high'}
              anomalyCeilingHz={7200}
            />
          </div>
        )}

        {/* Master Playback & Forensic Controls Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Transport buttons */}
          <div className="flex items-center gap-3">
            <LiquidButton
              primary={true}
              size="default"
              onClick={handleTogglePlay}
              className="cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              <span>{isPlaying ? 'Pause Studio' : 'Play Studio Track'}</span>
            </LiquidButton>

            <button
              onClick={() => handleSeek(0)}
              className="p-2.5 rounded-full border border-sky-200 hover:bg-sky-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
              title="Return to Start"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setLoopEnabled(!loopEnabled)}
              className={`p-2.5 rounded-full border transition-colors cursor-pointer shadow-2xs ${
                loopEnabled
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'border-sky-200 hover:bg-sky-50 text-slate-600'
              }`}
              title={loopEnabled ? 'Loop Active' : 'Loop Inactive'}
            >
              <Repeat className="h-4 w-4" />
            </button>

            {/* Time Stamp display */}
            <div className="font-mono text-xs font-semibold text-slate-700 bg-sky-50 border border-sky-200/80 px-4 py-2 rounded-full shadow-2xs">
              <span className="text-blue-700 font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-400 mx-1.5">/</span>
              <span className="text-slate-500">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-mono border border-slate-200/60">
            <span className="text-slate-400 text-[10px] ml-2 mr-1 uppercase font-bold">Speed:</span>
            {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  playbackSpeed === rate
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-rose-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4 text-slate-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-blue-600" />
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

      {/* Bottom Forensic Controls: Speaker Diarization + DSP Filter Rack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Diarized Speaker Separation */}
        <div className="lg:col-span-7">
          <div className="p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Diarized Speaker Isolation & Acoustic Channels
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Solo or mute separated speakers to isolate neural vocoder artifacts
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold">
                PyAnnote Diarization
              </span>
            </div>

            <div className="space-y-3">
              {incident.speakers.map((spk) => {
                const isSolo = soloSpeakerId === spk.id;
                const isMutedSpk = mutedSpeakerIds.includes(spk.id);

                return (
                  <div
                    key={spk.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      spk.isFlaggedSynthetic
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-sky-200 bg-sky-50/40'
                    } ${isMutedSpk ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: spk.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 font-mono">
                              {spk.speakerLabel}
                            </h4>
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              spk.isFlaggedSynthetic
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            }`}>
                              {spk.isFlaggedSynthetic ? 'SYNTHETIC FLAG' : 'HUMAN BASELINE'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-sans">
                            Claimed Identity: <strong className="text-slate-900">{spk.speakerName}</strong> • {spk.startTime.toFixed(1)}s to {spk.endTime.toFixed(1)}s
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
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
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

        {/* Right: Forensic DSP Filter Probes Rack */}
        <div className="lg:col-span-5">
          <div className="p-7 rounded-3xl border border-sky-100 bg-white/90 backdrop-blur-xl shadow-soft-blue space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Forensic DSP Filter Probes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Real-time harmonic isolation and vocoder artifact probes
                </p>
              </div>
              <Filter className="h-4 w-4 text-blue-600" />
            </div>

            {/* Filter Toggle Rack */}
            <div className="space-y-2.5">
              <div 
                onClick={() => {
                  setBandpassFilterActive(!bandpassFilterActive);
                  onShowToast('info', 'DSP Filter Toggled', !bandpassFilterActive ? 'Upper vocoder bandpass (>7kHz) isolated' : 'Full spectrum restored');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  bandpassFilterActive
                    ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    7.2 kHz Brickwall Cutoff Probe
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Attenuates frequencies below 7.2kHz to expose vocoder roll-off
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  bandpassFilterActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {bandpassFilterActive ? 'ACTIVE' : 'BYPASS'}
                </span>
              </div>

              <div 
                onClick={() => {
                  setPitchZoomActive(!pitchZoomActive);
                  onShowToast('info', 'Pitch Tracker Active', !pitchZoomActive ? 'Fundamental F0 vocal harmonic zoomed' : 'Pitch tracking normalized');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  pitchZoomActive
                    ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    Fundamental F0 Glottal Tracker
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Isolates base vocal cord vibration (70 Hz - 300 Hz)
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  pitchZoomActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {pitchZoomActive ? 'ACTIVE' : 'BYPASS'}
                </span>
              </div>

              <div 
                onClick={() => {
                  setPhaseInversionActive(!phaseInversionActive);
                  onShowToast('info', 'Phase Residual Probe', !phaseInversionActive ? 'Phase inversion subtraction enabled' : 'Phase probe bypassed');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  phaseInversionActive
                    ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-mono">
                    Micro-Phase Residual Discontinuity
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Sub-millisecond frame phase difference detection
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  phaseInversionActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {phaseInversionActive ? 'ACTIVE' : 'BYPASS'}
                </span>
              </div>
            </div>

            {/* Telemetry Summary Box */}
            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-900 leading-relaxed font-sans">
                DSP filter probes simulate forensic laboratory audio software (iZotope / Audition). Real-time frequency response reflects active vocoder boundaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
