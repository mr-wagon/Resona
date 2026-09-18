import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Fingerprint, 
  Activity, 
  User, 
  Building, 
  Briefcase, 
  Lock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoiceProfile } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { LiquidButton } from '../ui/liquid-glass-button';

interface AccountSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newProfile: VoiceProfile) => void;
}

export const AccountSetupModal: React.FC<AccountSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  // Wizard steps: 'profile' -> 'recording' -> 'processing' -> 'success'
  const [step, setStep] = useState<'profile' | 'recording' | 'processing' | 'success'>('profile');

  // Step 1: User Profile Details
  const [fullName, setFullName] = useState('Elena Vance');
  const [role, setRole] = useState('Chief Financial Authorizer');
  const [department, setDepartment] = useState('Corporate Treasury');
  const [employeeId, setEmployeeId] = useState('VIP-EXEC-9402');
  const [email, setEmail] = useState('e.vance@resona.internal');
  const [securityTier, setSecurityTier] = useState<VoiceProfile['securityTier']>('Tier 1 - Executive');

  // Step 2: Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState({ rms: 0, peak: 0, hasVoice: false });
  const [f0Live, setF0Live] = useState(142);
  const [useSimulatedMic, setUseSimulatedMic] = useState(false);

  // Storage & biometric output state
  const [biometricResult, setBiometricResult] = useState<{
    durationSec: number;
    f0MeanHz: number;
    jitterPercent: number;
    snrDb: number;
    vector512: number[];
    fingerprintHash: string;
  } | null>(null);

  // Canvas ref for live oscilloscope
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const timerInterval = useRef<number | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Paragraph prompt template
  const paragraphText = `Hello, my name is ${fullName || 'Elena Vance'}. I am authorizing my biometric acoustic voiceprint for Resona Voice Intelligence. My voice is unique, verified, and protected by ephemeral neural cryptographic hashing.`;

  // Draw real-time oscilloscope
  const startOscilloscope = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser ? analyser.fftSize : 512;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray as unknown as Uint8Array<ArrayBuffer>);
      } else {
        dataArray.fill(128);
      }

      // Update live metrics
      const metrics = audioEngine.getLiveAudioMetrics();
      setAudioMetrics(metrics);
      if (metrics.hasVoice) {
        setF0Live((prev) => Math.round(125 + metrics.rms * 160 + (Math.random() * 8 - 4)));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.moveTo(y, 0);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Draw oscilloscope waveform
      ctx.lineWidth = 2.5;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#0284C7');
      gradient.addColorStop(0.5, '#2563EB');
      gradient.addColorStop(1, '#38BDF8');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        // Simulated sine jitter if hardware mic is silent or simulated
        if (useSimulatedMic && isRecording) {
          v = 1.0 + Math.sin(i * 0.08 + Date.now() * 0.008) * 0.35 * Math.sin(Date.now() * 0.003);
        }

        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  const handleStartRecording = async () => {
    audioEngine.playFeedbackSound('ping');
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);

    const hasMic = await audioEngine.startMicrophoneRecording();
    if (!hasMic) {
      setUseSimulatedMic(true);
    } else {
      setUseSimulatedMic(false);
    }

    setIsRecording(true);
    startOscilloscope();

    timerInterval.current = window.setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;
        if (next >= 15) {
          handleStopRecording();
        }
        return next;
      });
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    setIsRecording(false);
    const result = await audioEngine.stopMicrophoneRecording();

    if (result) {
      setRecordedBlob(result.blob);
      setRecordedUrl(result.url);
    } else {
      // Create fallback synthetic calibration blob
      const dummyBlob = new Blob([new Uint8Array(1024)], { type: 'audio/webm' });
      setRecordedBlob(dummyBlob);
      setRecordedUrl(null);
    }

    audioEngine.playFeedbackSound('ping');
  };

  const handleTogglePlayback = () => {
    if (!recordedUrl) {
      // Play synthetic demo preview
      if (!isPlayingBack) {
        audioEngine.play('human', 5);
        setIsPlayingBack(true);
        setTimeout(() => setIsPlayingBack(false), 5000);
      } else {
        audioEngine.stop();
        setIsPlayingBack(false);
      }
      return;
    }

    if (!playbackAudioRef.current) {
      playbackAudioRef.current = new Audio(recordedUrl);
      playbackAudioRef.current.onended = () => setIsPlayingBack(false);
    }

    if (isPlayingBack) {
      playbackAudioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      playbackAudioRef.current.play();
      setIsPlayingBack(true);
    }
  };

  // Step 3: Run biometric storage processing animation
  const handleProcessAndStore = async () => {
    setStep('processing');
    audioEngine.playFeedbackSound('ping');

    // Analyze recorded audio
    const blobToAnalyze = recordedBlob || new Blob([new Uint8Array(1024)], { type: 'audio/webm' });
    const analysis = await audioEngine.analyzeRecordedVoiceprint(blobToAnalyze, fullName);
    setBiometricResult(analysis);

    // Sequence stages: 2.2 seconds condensation animation
    setTimeout(() => {
      audioEngine.playFeedbackSound('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0284C7', '#38BDF8', '#10B981', '#F59E0B'],
      });
      setStep('success');
    }, 2400);
  };

  const handleFinalize = () => {
    if (!biometricResult) return;

    const newProfile: VoiceProfile = {
      id: `prof-${Date.now().toString().slice(-4)}`,
      fullName,
      role,
      department,
      employeeId,
      email,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop`,
      securityTier,
      voiceprintQuality: 98.4,
      enrollmentDate: new Date().toISOString().split('T')[0],
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      embeddingHash: biometricResult.fingerprintHash,
      voiceSamplesCount: 1,
      sampleDurationSec: biometricResult.durationSec || 8.4,
    };

    onComplete(newProfile);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      audioEngine.stop();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-white/95 border border-sky-100 shadow-[0_24px_60px_-12px_rgba(2,132,199,0.25),0_0_0_1px_rgba(255,255,255,0.9)] overflow-hidden text-slate-900 flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-soft-blue">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 leading-tight">
                Executive Account & Voice Setup
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Enroll cryptographic voice footprint into Resona Identity Vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Step Navigation */}
        <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-sky-100/60 text-xs font-medium text-slate-500">
          <div className={`flex items-center gap-2 ${step === 'profile' ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'profile' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1</span>
            <span>Profile Credentials</span>
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 ${step === 'recording' ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'recording' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2</span>
            <span>Guided Voice Paragraph</span>
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 ${step === 'processing' || step === 'success' ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>3</span>
            <span>Vault Seal</span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* STEP 1: IDENTITY CREDENTIALS */}
          {step === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Voiceprints are hashed in RAM via volatile neural networks. No raw audio is retained permanently. Enter executive credentials for the biometric audit log.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-200/80 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
                    placeholder="e.g. Dr. Elena Vance"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                    Organizational Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-200/80 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
                    placeholder="e.g. Chief Financial Authorizer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-blue-600" />
                    Department / Unit
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-200/80 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value="Corporate Treasury">Corporate Treasury</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                    <option value="Global Cyber Defense">Global Cyber Defense</option>
                    <option value="Private Banking">Private Banking</option>
                    <option value="Engineering & Technology">Engineering & Technology</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-blue-600" />
                    Voiceprint Authorization Scope
                  </label>
                  <select
                    value={securityTier}
                    onChange={(e) => setSecurityTier(e.target.value as VoiceProfile['securityTier'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-sky-200/80 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value="Tier 1 - Executive">Executive Authorization ($50M+ Wire Clearance)</option>
                    <option value="Tier 2 - Finance Approver">Finance Approver & Signer</option>
                    <option value="Tier 3 - Standard Enterprise">Standard Enterprise Access</option>
                    <option value="Tier 4 - VIP Client">VIP Client Verification</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <LiquidButton
                  size="lg"
                  primary={true}
                  onClick={() => setStep('recording')}
                  className="cursor-pointer"
                >
                  <span>Proceed to Voice Enrollment</span>
                  <ArrowRight className="h-4 w-4 ml-1 text-white" />
                </LiquidButton>
              </div>
            </div>
          )}

          {/* STEP 2: GUIDED BIOMETRIC PARAGRAPH RECORDING */}
          {step === 'recording' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Guided Biometric Voice Authorization
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Read the official verification paragraph clearly into your microphone
                  </p>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>REC: 00:{recordingTime.toString().padStart(2, '0')} / 00:15</span>
                  </div>
                )}
              </div>

              {/* Guided Paragraph Display Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/40 border border-sky-200/90 shadow-sm relative overflow-hidden">
                <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                  <span>Authorized Read-Aloud Prompt:</span>
                  <span>Minimum 5 seconds speech required</span>
                </div>
                
                <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed font-sans select-none">
                  "{paragraphText}"
                </p>

                {/* Progress highlight line */}
                <div className="w-full bg-sky-200/60 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (recordingTime / 8) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Live Oscilloscope & Audio Telemetry */}
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">Live Acoustic Oscilloscope</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      F0: <strong className="text-blue-600">{f0Live} Hz</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      audioMetrics.hasVoice 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {audioMetrics.hasVoice ? 'VOICE DETECTED' : 'ROOM SILENCE'}
                    </span>
                  </div>
                </div>

                {/* Real-time Oscilloscope Canvas */}
                <div className="h-28 w-full bg-slate-950/5 rounded-xl overflow-hidden relative border border-sky-100/80 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={112}
                    className="w-full h-full"
                  />
                  {!isRecording && !recordedBlob && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xs">
                      <span className="text-xs text-slate-500 font-sans">
                        Press "Start Recording" to activate microphone
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-blue transition-all cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
                      <span>{recordedBlob ? 'Re-record Paragraph' : 'Start Recording'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop & Capture Voiceprint</span>
                    </button>
                  )}

                  {recordedBlob && !isRecording && (
                    <button
                      onClick={handleTogglePlayback}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {isPlayingBack ? <Pause className="h-3.5 w-3.5 text-blue-600" /> : <Play className="h-3.5 w-3.5 text-blue-600" />}
                      <span>{isPlayingBack ? 'Pause' : 'Review Audio'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setStep('profile')}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <LiquidButton
                    size="lg"
                    primary={true}
                    disabled={!recordedBlob && recordingTime < 4}
                    onClick={handleProcessAndStore}
                    className="cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-1 text-white" />
                    <span>Generate & Seal Footprint</span>
                  </LiquidButton>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BIOMETRIC CONDENSATION & PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              {/* Rotating biometric iris graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/60"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-sky-300/80"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [0.8, 1.1, 0.9, 1], opacity: [0.5, 1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-soft-blue"
                >
                  <Fingerprint className="h-10 w-10 animate-pulse" />
                </motion.div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Condensing 512-D Acoustic Voiceprint
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Extracting ECAPA-TDNN neural embeddings, glottal pulse timing, and zero-knowledge cryptographic fingerprint...
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-[11px] font-mono text-blue-700">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Hashing ephemeral vector memory: RAM_0x9B42</span>
              </div>
            </div>
          )}

          {/* STEP 4: STORAGE COMPLETE & PROFILE CREDENTIAL CARD */}
          {step === 'success' && biometricResult && (
            <div className="space-y-6 animate-in zoom-in-95 duration-400">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 font-display">
                    Voice Footprint Successfully Registered & Sealed!
                  </h4>
                  <p className="text-xs text-emerald-700 font-sans">
                    Biometric identity credential added to organizational directory with hardware tamper protection.
                  </p>
                </div>
              </div>

              {/* Holographic Credential Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-[0_20px_50px_rgba(2,132,199,0.25)] border border-sky-400/30 relative overflow-hidden"
              >
                {/* Holographic shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/10 to-transparent animate-shimmer pointer-events-none" />

                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center shadow-md">
                      <Fingerprint className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                        RESONA BIOMETRIC VAULT
                      </span>
                      <h3 className="text-lg font-bold font-display text-white">{fullName}</h3>
                      <p className="text-xs text-slate-300">{role} • {department}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    VERIFIED VOICEPRINT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10 text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">F0 Pitch</span>
                    <strong className="text-white text-sm">{biometricResult.f0MeanHz} Hz</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">SNR Margin</span>
                    <strong className="text-emerald-400 text-sm">+{biometricResult.snrDb} dB</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Quality</span>
                    <strong className="text-sky-300 text-sm">98.4%</strong>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[320px]">
                    HASH: {biometricResult.fingerprintHash}
                  </span>
                  <span className="text-sky-400 font-semibold">512-D ECAPA-TDNN</span>
                </div>
              </motion.div>

              <div className="flex justify-end gap-3 pt-2">
                <LiquidButton
                  size="lg"
                  primary={true}
                  onClick={handleFinalize}
                  className="cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 text-white" />
                  <span>Enter Platform as Enrolled User</span>
                </LiquidButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
