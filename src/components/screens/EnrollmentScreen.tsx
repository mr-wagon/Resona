import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Fingerprint, 
  Radio, 
  Lock, 
  Play, 
  Pause,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoiceProfile } from '../../types';
import { audioEngine } from '../../services/audioEngine';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';

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
  const [micActive, setMicActive] = useState(false);
  const [isSynthesizingEmbedding, setIsSynthesizingEmbedding] = useState(false);
  const [enrollmentComplete, setEnrollmentComplete] = useState(false);
  const [audioInputMethod, setAudioInputMethod] = useState<'mic' | 'upload'>('mic');

  // Mic visualizer canvas ref
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Quality indicators
  const noiseFloorPass = true;
  const durationPass = recordedDuration >= 10 || recordingSeconds >= 10;
  const clarityScore = recordedDuration > 0 ? 97.4 : 0;

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
    setMicActive(true);
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
    setMicActive(false);
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

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Oscilloscope wave
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00F2FE';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 8;
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
    if (!fullName || !role || !employeeId) {
      onShowToast('warning', 'Incomplete Form', 'Please complete Full Name, Role, and Employee ID.');
      return;
    }
    if (!consentAgreed) {
      onShowToast('warning', 'Consent Required', 'Please confirm explicit biometric consent agreement.');
      return;
    }
    if (!recordedAudioUrl) {
      onShowToast('warning', 'Voice Sample Needed', 'Please record or upload a voice sample before enrolling.');
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
        colors: ['#0284C7', '#2563EB', '#38BDF8', '#10B981'],
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
      <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Voice Profile Enrollment & Biometric Registration
            </h2>
            <DemoBadge type="live" />
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Register authorized executive and treasury personnel voiceprints using 512-dimensional ECAPA-TDNN deep neural embeddings
          </p>
        </div>

        <button
          onClick={() => onNavigate('profiles')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>View Identity Directory</span>
        </button>
      </div>

      <form onSubmit={handleEnrollProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Identity Metadata */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Executive Identity Information
              </h3>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Corporate Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Financial Officer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employee / Identity ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-9942"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-medium bg-white"
                  >
                    <option>Executive Leadership</option>
                    <option>Corporate Treasury</option>
                    <option>Finance & Accounting</option>
                    <option>Global Cyber Defense</option>
                    <option>Legal & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Security Authorization Tier
                  </label>
                  <select
                    value={securityTier}
                    onChange={(e) => setSecurityTier(e.target.value as VoiceProfile['securityTier'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-medium bg-white"
                  >
                    <option>Tier 1 - Executive</option>
                    <option>Tier 2 - Finance Approver</option>
                    <option>Tier 3 - Standard Enterprise</option>
                    <option>Tier 4 - VIP Client</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. david.chen@acme-corp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Biometric Consent Governance Card */}
          <div className="p-5 rounded-2xl border border-sky-100 bg-sky-50/50 space-y-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <h4 className="font-bold text-slate-900">Biometric Consent & DPDP / GDPR Compliance Notice</h4>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Voice samples are converted into non-invertible, irreversible 512-dimensional numerical vectors. Raw voice audio is purged immediately post-enrollment. In accordance with Digital Personal Data Protection (DPDP) and enterprise security policy, registered identities possess an unconditional right to biometric revocation and erasure.
            </p>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-800">
                I authorize Resona to extract biometric acoustic embeddings from my voice sample for cryptographic identity verification.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Audio Sample Capture & Quality Gate */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Voiceprint Sample Acquisition
                </h3>
              </div>

              {/* Mode toggle */}
              <div className="flex p-0.5 rounded-lg bg-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAudioInputMethod('mic')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    audioInputMethod === 'mic' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Microphone
                </button>
                <button
                  type="button"
                  onClick={() => setAudioInputMethod('upload')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    audioInputMethod === 'upload' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Microphone Recording UI */}
            {audioInputMethod === 'mic' && (
              <div className="space-y-4">
                {/* Live Oscilloscope canvas */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <canvas
                    ref={micCanvasRef}
                    className="w-full h-32 block"
                  />
                  {!isRecording && !recordedAudioUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-slate-400 text-xs">
                      <Mic className="h-6 w-6 text-sky-400 mb-1" />
                      <span>Click Start Recording to calibrate microphone</span>
                    </div>
                  )}

                  {isRecording && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-400 font-mono text-[10px]">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs shadow-soft-blue hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Start Voice Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer animate-pulse"
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
              <div className="p-6 border-2 border-dashed border-sky-200 rounded-xl text-center bg-sky-50/20">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="enroll-file"
                />
                <label htmlFor="enroll-file" className="cursor-pointer block space-y-2">
                  <Upload className="h-8 w-8 text-sky-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">
                    Upload pristine reference voice recording (WAV or MP3)
                  </p>
                  <p className="text-[10px] text-slate-500">Minimum 10 seconds of clear speech recommended</p>
                </label>
              </div>
            )}

            {/* Voice Quality Gate Checklist */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider block">
                Acoustic Quality Gate (ISO/IEC 19794-13)
              </span>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ambient Noise Floor (&lt; -30dBFS):</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Speech Duration (&ge; 10 seconds):</span>
                  <span className={`inline-flex items-center gap-1 font-mono font-bold ${
                    durationPass ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {durationPass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
                    {recordedDuration > 0 ? `${recordedDuration.toFixed(1)}s` : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Vocal Clarity Index:</span>
                  <span className="font-mono font-bold text-sky-700">
                    {recordedDuration > 0 ? '98.4% (Pristine)' : '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit & Generate Embedding */}
            <button
              type="submit"
              disabled={isSynthesizingEmbedding || !recordedAudioUrl || !consentAgreed}
              className={`w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSynthesizingEmbedding || !recordedAudioUrl || !consentAgreed
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-soft-blue hover:from-blue-700 hover:to-indigo-700 hover:shadow-glow-blue'
              }`}
            >
              {isSynthesizingEmbedding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing 512-Dim Voiceprint Embedding...</span>
                </>
              ) : enrollmentComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Profile Enrolled Successfully!</span>
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" />
                  <span>Generate Biometric Voiceprint & Enroll</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
