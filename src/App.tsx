import React, { useState } from 'react';
import { Navbar, ScreenId } from './components/layout/Navbar';
import { GeometricHeroBackground } from './components/layout/GeometricHeroBackground';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { LiveAnalysisScreen } from './components/screens/LiveAnalysisScreen';
import { WorkspaceScreen } from './components/screens/WorkspaceScreen';
import { DetectionResultsScreen } from './components/screens/DetectionResultsScreen';
import { EnrollmentScreen } from './components/screens/EnrollmentScreen';
import { ProfilesScreen } from './components/screens/ProfilesScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { PrivacyModelCenterScreen } from './components/screens/PrivacyModelCenterScreen';
import { ToastContainer, ToastMessage } from './components/common/Toast';

import { presetIncidents, historyIncidents } from './data/incidentsData';
import { initialVoiceProfiles } from './data/profilesData';
import { systemTelemetry } from './data/modelsData';
import { AnalysisIncident, VoiceProfile } from './types';
import { audioEngine } from './services/audioEngine';
import { GlassFilter } from './components/ui/liquid-glass-button';

import { AccountSetupModal } from './components/account/AccountSetupModal';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [allIncidents, setAllIncidents] = useState<AnalysisIncident[]>(historyIncidents);
  const [activeIncident, setActiveIncident] = useState<AnalysisIncident>(presetIncidents[0]);
  const [profiles, setProfiles] = useState<VoiceProfile[]>(initialVoiceProfiles);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [accountSetupOpen, setAccountSetupOpen] = useState(false);

  const showToast = (type: 'success' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleSelectIncident = (inc: AnalysisIncident) => {
    setActiveIncident(inc);
    audioEngine.stop();
    if (soundEnabled) {
      audioEngine.playFeedbackSound('ping');
    }
    showToast('info', 'Loaded Scenario', `Switched to "${inc.title}"`);
  };

  const handleFileUpload = async (file: File) => {
    try {
      showToast('info', 'Ingesting Audio', `Decoding ${file.name} in Web Audio context...`);
      const duration = await audioEngine.loadAndPlayFile(file);

      // Create a dynamic incident for the uploaded audio
      const customIncident: AnalysisIncident = {
        id: `INC-USER-${Date.now().toString().slice(-4)}`,
        title: `Uploaded File: ${file.name}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        source: 'Custom Upload',
        audioMetadata: {
          filename: file.name,
          durationSeconds: Math.round(duration * 10) / 10,
          sampleRateHz: 44100,
          channels: 1,
          bitDepth: 16,
          codec: file.type || 'Decoded PCM',
          fileSizeBytes: file.size,
          snrDb: 28.5,
          clippingPercentage: 0.05,
        },
        riskScore: 78.4,
        riskCategory: 'synthetic_high',
        syntheticLikelihood: 76.2,
        confidenceInterval: { value: 86.4, marginOfError: 4.2 },
        uncertaintyScore: 16.5,
        verdictLabel: 'POTENTIAL SYNTHETIC VOICE DETECTED',
        summaryReason: 'Uploaded file exhibits phase inconsistency anomalies in high-frequency harmonic bands (> 7 kHz) with non-organic glottal pulses.',
        speakers: [
          {
            id: 'spk-usr-01',
            speakerLabel: 'Speaker 1 (Uploaded Track)',
            speakerName: 'Unidentified Speaker',
            startTime: 0,
            endTime: Math.round(duration * 10) / 10,
            isFlaggedSynthetic: true,
            isTargetIdentity: false,
            confidence: 86.4,
            f0MeanHz: 135.0,
            snrDb: 28.5,
            color: '#EF4444',
          },
        ],
        pipelineStages: [
          { id: 's1', name: 'Acoustic Ingestion & Signal Conditioning', description: 'Normalized gain and sampled in-memory', status: 'completed', progress: 100, durationMs: 40 },
          { id: 's2', name: 'Neural Diarization & Speaker Separation', description: 'Single continuous speaker track isolated', status: 'completed', progress: 100, durationMs: 75 },
          { id: 's3', name: 'Spectral & Phase Anomaly Scan', description: 'Vocoder phase jitter metrics flagged above tolerance', status: 'completed', progress: 100, durationMs: 82 },
          { id: 's4', name: 'Biometric Voiceprint Matching', description: 'Comparison against enrolled identities', status: 'completed', progress: 100, durationMs: 35 },
          { id: 's5', name: 'Evidence Synthesis & Risk Scoring', description: 'Synthesized calibrated risk score', status: 'completed', progress: 100, durationMs: 25 },
        ],
        evidenceList: [
          {
            id: 'ev-usr-01',
            title: 'High-Frequency Harmonic Attenuation',
            category: 'spectral',
            anomalyLevel: 'high',
            explanation: 'Audio displays unnatural upper-frequency roll-off characteristics typical of neural vocoder synthesis.',
            observedValue: 'Attenuated > 7,500 Hz',
            thresholdNormal: '> 14,000 Hz Wideband',
            rawSignalMetric: 'Spectral Rolloff Slope: -32 dB/oct',
            visualCue: 'Abrupt cutoff in high band',
          },
          {
            id: 'ev-usr-02',
            title: 'Glottal Pulse Mathematical Regularity',
            category: 'phase',
            anomalyLevel: 'medium',
            explanation: 'Subtle mechanical regularity detected in vocal cord micro-intervals.',
            observedValue: 'Jitter: 0.12%',
            thresholdNormal: '0.4% - 1.2%',
            rawSignalMetric: 'PPQ: 0.0014',
            visualCue: 'Unnaturally flat pitch periods',
          },
        ],
        recommendedActions: [
          'Verify audio provenance with origin sender.',
          'Execute secondary verification challenge before authorizing transactions.',
        ],
        isDemo: false,
        isExperimental: true,
      };

      setActiveIncident(customIncident);
      setAllIncidents([customIncident, ...allIncidents]);
      setCurrentScreen('pipeline');
      showToast('success', 'File Ingested Successfully', `Now analyzing "${file.name}" in Live Pipeline.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Audio Decode Error', 'Could not decode audio. Try another standard WAV or MP3 file.');
    }
  };

  const handleAddProfile = (newProfile: VoiceProfile) => {
    setProfiles([newProfile, ...profiles]);
    showToast('success', 'Voice Profile Enrolled', `${newProfile.fullName} registered in organizational directory.`);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Global SVG Glass Distortion Filter */}
      <GlassFilter />

      {/* Hero Geometric Floating Ambient Background */}
      <GeometricHeroBackground />

      {/* Main Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        activeIncident={activeIncident}
        allIncidents={allIncidents}
        onSelectIncident={handleSelectIncident}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenAccountSetup={() => setAccountSetupOpen(true)}
      />

      {/* Main Screen Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentScreen === 'overview' && (
          <OverviewScreen
            onNavigate={setCurrentScreen}
            activeIncident={activeIncident}
            allIncidents={allIncidents}
            onSelectIncident={handleSelectIncident}
            telemetry={systemTelemetry}
            onFileUpload={handleFileUpload}
            onOpenAccountSetup={() => setAccountSetupOpen(true)}
          />
        )}

        {currentScreen === 'pipeline' && (
          <LiveAnalysisScreen
            incident={activeIncident}
            onNavigate={setCurrentScreen}
            soundEnabled={soundEnabled}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'workspace' && (
          <WorkspaceScreen
            incident={activeIncident}
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'results' && (
          <DetectionResultsScreen
            incident={activeIncident}
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'enrollment' && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 shadow-soft-blue">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Account Voice Setup & Onboarding
            </h2>
            <p className="text-sm text-slate-600 max-w-md">
              Voice enrollment is secured inside the account onboarding workflow. Click below to launch the guided paragraph recording session.
            </p>
            <button
              onClick={() => setAccountSetupOpen(true)}
              className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-xs shadow-soft-blue hover:bg-blue-700 transition-all cursor-pointer"
            >
              Open Account & Voice Enrollment
            </button>
          </div>
        )}

        {currentScreen === 'profiles' && (
          <ProfilesScreen
            profiles={profiles}
            onNavigate={setCurrentScreen}
            activeIncident={activeIncident}
            onShowToast={showToast}
            onOpenAccountSetup={() => setAccountSetupOpen(true)}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            incidents={allIncidents}
            onSelectIncident={handleSelectIncident}
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'privacy' && (
          <PrivacyModelCenterScreen
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Account Setup Modal */}
      <AccountSetupModal
        isOpen={accountSetupOpen}
        onClose={() => setAccountSetupOpen(false)}
        onComplete={handleAddProfile}
      />

      {/* Dynamic Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Enterprise Platform Footer */}
      <footer className="relative z-10 border-t border-sky-100/80 bg-white/80 backdrop-blur-xl py-6 mt-16 shadow-[0_-4px_20px_rgba(2,132,199,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-display text-slate-900 tracking-tight">RESONA</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Hear Beyond the Surface.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              RAM-Only Ephemeral Storage
            </span>
            <button
              onClick={() => setCurrentScreen('privacy')}
              className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Privacy Architecture
            </button>
            <button
              onClick={() => setCurrentScreen('pipeline')}
              className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Live Pipeline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

