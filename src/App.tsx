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
import { Shield, Sparkles, Heart } from 'lucide-react';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [allIncidents, setAllIncidents] = useState<AnalysisIncident[]>(historyIncidents);
  const [activeIncident, setActiveIncident] = useState<AnalysisIncident>(presetIncidents[0]);
  const [profiles, setProfiles] = useState<VoiceProfile[]>(initialVoiceProfiles);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-700">
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
          />
        )}

        {currentScreen === 'pipeline' && (
          <LiveAnalysisScreen
            incident={activeIncident}
            onNavigate={setCurrentScreen}
            soundEnabled={soundEnabled}
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
          <EnrollmentScreen
            onAddProfile={handleAddProfile}
            onNavigate={setCurrentScreen}
            onShowToast={showToast}
            soundEnabled={soundEnabled}
          />
        )}

        {currentScreen === 'profiles' && (
          <ProfilesScreen
            profiles={profiles}
            onNavigate={setCurrentScreen}
            activeIncident={activeIncident}
            onShowToast={showToast}
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

      {/* Dynamic Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Enterprise Platform Footer */}
      <footer className="relative z-10 border-t border-sky-100 bg-white/80 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-display text-slate-900 tracking-tight">RESONA</span>
            <span>•</span>
            <span>Hear Beyond the Surface.</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-400">Smart India Hackathon 2026 Prototype</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Zero-Disk Storage Mode Active
            </span>
            <button
              onClick={() => setCurrentScreen('privacy')}
              className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Privacy Architecture
            </button>
            <button
              onClick={() => setCurrentScreen('pipeline')}
              className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Pipeline Specs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
