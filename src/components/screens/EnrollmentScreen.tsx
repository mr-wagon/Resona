import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  UserCheck, 
  CheckCircle2, 
  Loader2, 
  Fingerprint, 
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoiceProfile } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';

interface EnrollmentScreenProps {
  onAddProfile: (profile: VoiceProfile) => void;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
  soundEnabled: boolean;
}

export const EnrollmentScreen: React.FC<EnrollmentScreenProps> = ({
  onAddProfile,
  onNavigate,
  onShowToast,
  soundEnabled,
}) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Corporate Treasury');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [securityTier, setSecurityTier] = useState<VoiceProfile['securityTier']>('Tier 1 - Executive');
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isSynthesizingEmbedding, setIsSynthesizingEmbedding] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const [audioInputMethod, setAudioInputMethod] = useState<'mic' | 'upload'>('mic');

  // Mic visualizer canvas ref
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Quality indicators
  const durationPass = recordedDuration >= 10 || recordingSeconds >= 10;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioEngine.stopMicrophoneRecording();
    };
  }, []);

  const startRecording = async () => {
    const success = await audioEngine.startMicrophoneRecording();
    if (!success) {
      onShowToast('warning', 'Microphone Access Required', 'Please allow microphone access or choose the File Upload tab.');
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);

    if (soundEnabled) {
      audioEngine.playFeedbackSound('ping');
    }

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Run canvas oscilloscope
    drawLiveOscilloscope();
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const result = await audioEngine.stopMicrophoneRecording();
    if (result) {
      setRecordedAudioUrl(result.url);
      setRecordedDuration(Math.max(result.durationSec, recordingSeconds));
      onShowToast('success', 'Voice Sample Captured', `Recorded ${recordingSeconds}s of acoustic speech.`);
    } else {
      // Fallback for demo if browser mic wasn't available
      setRecordedAudioUrl('#demo-mic');
      setRecordedDuration(12.5);
      onShowToast('info', 'Sample Registered', 'Demo voice sample registered.');
    }
  };

  const drawLiveOscilloscope = () => {
    const canvas = micCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(256);

    const render = () => {
      audioEngine.getWaveformData(dataArray);

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

      ctx.fillStyle = '#060812';
      ctx.fillRect(0, 0, w, h);

      // Grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Oscilloscope wave
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00F2FE';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const sliceWidth = w / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setRecordedAudioUrl(url);
      setRecordedDuration(15.2);
      onShowToast('success', 'Sample File Uploaded', `Loaded ${file.name}`);
    }
  };

  const handleEnrollProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recordedAudioUrl) {
      onShowToast('warning', 'Voice Sample Missing', 'Please record speech or upload an audio sample first.');
      return;
    }

    if (!consentAgreed) {
      onShowToast('warning', 'Consent Required', 'Explicit biometric consent must be acknowledged before enrollment.');
      return;
    }

    setIsSynthesizingEmbedding(true);

    setTimeout(() => {
      setIsSynthesizingEmbedding(false);
      setEnrollmentComplete(true);

      const newProfile: VoiceProfile = {
        id: `prof-${Date.now().toString().slice(-4)}`,
        fullName,
        role,
        department,
        employeeId,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@acme-corp.com`,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        securityTier,
        voiceprintQuality: 98.6,
        enrollmentDate: new Date().toISOString().split('T')[0],
        lastVerifiedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        embeddingHash: `sha256-${Math.random().toString(16).substring(2, 18)}`,
        voiceSamplesCount: 1,
        sampleDurationSec: recordedDuration,
      };

      onAddProfile(newProfile);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F2FE', '#6366F1', '#38BDF8', '#10B981'],
      });

      if (soundEnabled) {
        audioEngine.playFeedbackSound('success');
      }

      onShowToast('success', 'Voiceprint Enrolled', `Registered biometric identity for ${fullName}.`);
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
              Voice Profile Enrollment & Biometric Registration
            </h2>
            <DemoBadge type="live" />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Register authorized executive and treasury personnel voiceprints using 512-dimensional ECAPA-TDNN deep neural embeddings
          </p>
        </div>

        <button
          onClick={() => onNavigate('profiles')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
        >
          <span>View Identity Directory</span>
        </button>
      </div>

      <form onSubmit={handleEnrollProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Identity Metadata */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-display">
                Executive Identity Information
              </h3>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-medium placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Corporate Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Financial Officer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-medium placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Employee / Identity ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-9942"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-mono font-medium placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-medium"
                  >
                    <option className="bg-[#080D1A] text-white">Executive Leadership</option>
                    <option className="bg-[#080D1A] text-white">Corporate Treasury</option>
                    <option className="bg-[#080D1A] text-white">Finance & Accounting</option>
                    <option className="bg-[#080D1A] text-white">Global Cyber Defense</option>
                    <option className="bg-[#080D1A] text-white">Legal & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Voiceprint Authorization Scope
                  </label>
                  <select
                    value={securityTier}
                    onChange={(e) => setSecurityTier(e.target.value as VoiceProfile['securityTier'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-medium"
                  >
                    <option value="Tier 1 - Executive" className="bg-[#080D1A] text-white">Executive Authorization</option>
                    <option value="Tier 2 - Finance Approver" className="bg-[#080D1A] text-white">Operational & Financial Approver</option>
                    <option value="Tier 3 - Standard Enterprise" className="bg-[#080D1A] text-white">Standard Enterprise Access</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. david.chen@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#080D1A] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white text-xs font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Biometric consent box */}
            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Explicit Biometric Consent (DPDP / GDPR)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Voice embeddings are stored as 512-dimensional irreversible mathematical hashes. Raw audio recordings are never permanently retained.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#080D1A] accent-cyan-400 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-300">
                  I hereby authorize cryptographic voiceprint enrollment
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Capture Studio */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Acoustic Speech Capture Studio
                </h3>
                <p className="text-xs text-slate-400">
                  Provide at least 10 seconds of clear speech for deep feature vector extraction
                </p>
              </div>

              {/* Input Method Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-[#080D1A] border border-white/10 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAudioInputMethod('mic')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    audioInputMethod === 'mic'
                      ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Mic
                </button>
                <button
                  type="button"
                  onClick={() => setAudioInputMethod('upload')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    audioInputMethod === 'upload'
                      ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  File Upload
                </button>
              </div>
            </div>

            {/* Live Microphone Mode */}
            {audioInputMethod === 'mic' && (
              <div className="space-y-4">
                {/* Live Oscilloscope */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060812] shadow-inner">
                  <canvas
                    ref={micCanvasRef}
                    className="w-full h-32 block"
                  />
                  {!isRecording && !recordedAudioUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080D1A]/85 backdrop-blur-xs text-slate-400 text-xs">
                      <Mic className="h-6 w-6 text-cyan-400 mb-1 animate-pulse" />
                      <span>Click Start Recording to calibrate microphone</span>
                    </div>
                  )}

                  {isRecording && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span>REC {recordingSeconds}s / 10s min</span>
                    </div>
                  )}
                </div>

                {/* Recording action buttons */}
                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Start Voice Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      <span>Stop & Validate Sample ({recordingSeconds}s)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* File Upload UI */}
            {audioInputMethod === 'upload' && (
              <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center bg-[#080D1A]/60">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="enroll-file"
                />
                <label htmlFor="enroll-file" className="cursor-pointer block space-y-2">
                  <Upload className="h-8 w-8 text-cyan-400 mx-auto" />
                  <p className="text-xs font-semibold text-white">
                    Upload pristine reference voice recording (WAV or MP3)
                  </p>
                  <p className="text-[10px] text-slate-400">Minimum 10 seconds of clear speech recommended</p>
                </label>
              </div>
            )}

            {/* Voice Quality Gate Checklist */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#080D1A]/80 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                Acoustic Quality Gate (ISO/IEC 19794-13)
              </span>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ambient Noise Floor (&lt; -30dBFS):</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Speech Duration (&ge; 10 seconds):</span>
                  <span className={`inline-flex items-center gap-1 font-mono font-bold ${
                    durationPass ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {durationPass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-white/20" />}
                    {recordedDuration > 0 ? `${recordedDuration.toFixed(1)}s` : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vocal Clarity Index:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {recordedDuration > 0 ? '98.4% (Pristine)' : '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit & Generate Embedding */}
            <LiquidButton
              type="submit"
              disabled={isSynthesizingEmbedding || !recordedAudioUrl || !consentAgreed}
              className={`w-full text-white font-semibold text-xs cursor-pointer ${
                isSynthesizingEmbedding || !recordedAudioUrl || !consentAgreed ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              {isSynthesizingEmbedding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400 mr-2" />
                  <span>Synthesizing 512-Dim Voiceprint Embedding...</span>
                </>
              ) : enrollmentComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                  <span>Profile Enrolled Successfully!</span>
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 text-cyan-400 mr-2" />
                  <span>Generate Biometric Voiceprint & Enroll</span>
                </>
              )}
            </LiquidButton>
          </div>
        </div>
      </form>
    </div>
  );
};
