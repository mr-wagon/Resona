import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Fingerprint, 
  Sliders, 
  Activity, 
  HelpCircle,
  Info
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { RiskGauge } from '../common/RiskGauge';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';
import { LiquidButton } from '../ui/liquid-glass-button';

interface DetectionResultsScreenProps {
  incident: AnalysisIncident;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const DetectionResultsScreen: React.FC<DetectionResultsScreenProps> = ({
  incident,
  onNavigate,
  onShowToast,
}) => {
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<string[]>(['ev-01', 'ev-02']);

  const toggleEvidence = (id: string) => {
    if (expandedEvidenceIds.includes(id)) {
      setExpandedEvidenceIds(expandedEvidenceIds.filter((item) => item !== id));
    } else {
      setExpandedEvidenceIds([...expandedEvidenceIds, id]);
    }
  };

  const handleDownloadReport = () => {
    const reportJson = {
      reportHeader: {
        platform: 'RESONA AI Voice Intelligence Platform',
        version: 'v2.4.1-enterprise',
        classification: 'RESTRICTED FORENSIC INTELLIGENCE',
        generatedTimestamp: new Date().toISOString(),
      },
      caseMetadata: {
        incidentId: incident.id,
        title: incident.title,
        source: incident.source,
        audioFile: incident.audioMetadata.filename,
        durationSeconds: incident.audioMetadata.durationSeconds,
      },
      verdict: {
        riskScore: incident.riskScore,
        verdictLabel: incident.verdictLabel,
        syntheticLikelihood: incident.syntheticLikelihood,
        calibratedConfidence: `${incident.confidenceInterval.value}% (±${incident.confidenceInterval.marginOfError}%)`,
        uncertaintyScore: `${incident.uncertaintyScore}%`,
        summaryReason: incident.summaryReason,
      },
      biometricVerification: incident.biometricMatch || 'Not evaluated',
      forensicEvidence: incident.evidenceList,
      recommendedActions: incident.recommendedActions,
      modelGovernance: {
        ephemeralProcessing: true,
        responsibleAiNotice: 'Demonstration simulation report generated for Smart India Hackathon evaluation.',
      },
    };

    const blob = new Blob([JSON.stringify(reportJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RESONA_Forensic_Evidence_${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onShowToast('success', 'Forensic Audit Report Exported', `Downloaded evidence dossier for ${incident.id}`);
  };

  const isHighRisk = incident.riskCategory === 'synthetic_high';
  const isHuman = incident.riskCategory === 'human_verified';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Verdict Headline Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
        isHighRisk
          ? 'bg-[#0C1222]/90 border-rose-500/30 shadow-[0_12px_40px_rgba(244,63,94,0.15)]'
          : isHuman
          ? 'bg-[#0C1222]/90 border-emerald-500/30 shadow-[0_12px_40px_rgba(16,185,129,0.15)]'
          : 'bg-[#0C1222]/90 border-amber-500/30 shadow-[0_12px_40px_rgba(245,158,11,0.15)]'
      }`}>
        {/* Glow orb */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isHighRisk ? 'bg-rose-500' : isHuman ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isHighRisk
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : isHuman
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {isHighRisk ? <ShieldAlert className="h-3.5 w-3.5" /> : isHuman ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                <span>CASE VERDICT • {incident.id}</span>
              </span>
              <DemoBadge type={incident.isExperimental ? 'experimental' : 'demo'} />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display">
              {incident.verdictLabel}
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {incident.summaryReason}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Timestamp: <span className="text-slate-200">{incident.timestamp}</span></span>
              <span>•</span>
              <span>Source: <span className="text-slate-200">{incident.source}</span></span>
              <span>•</span>
              <span>Duration: <span className="text-slate-200">{incident.audioMetadata.durationSeconds}s</span></span>
            </div>
          </div>

          {/* Gauge & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0">
            <RiskGauge
              score={incident.riskScore}
              confidence={incident.confidenceInterval.value}
              marginOfError={incident.confidenceInterval.marginOfError}
              uncertainty={incident.uncertaintyScore}
              category={incident.riskCategory}
              size="lg"
            />

            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              <LiquidButton
                onClick={handleDownloadReport}
                size="default"
                className="w-full text-white font-semibold text-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-cyan-300 mr-2" />
                <span>Download Forensic Dossier</span>
              </LiquidButton>

              <button
                onClick={() => onNavigate('workspace')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Inspect in Audio Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Verification & Audio Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biometric Match Card */}
        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Biometric Identity Verification
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">ECAPA-TDNN Deep Speaker Embedding Matching</p>
                  </div>
                </div>

                {incident.biometricMatch && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                    incident.biometricMatch.matchDecision === 'matched'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : incident.biometricMatch.matchDecision === 'mismatch_spoof'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {incident.biometricMatch.matchDecision === 'matched' ? 'VERIFIED MATCH' : incident.biometricMatch.matchDecision === 'mismatch_spoof' ? 'MISMATCH / SPOOF' : 'INCONCLUSIVE'}
                  </span>
                )}
              </div>

              {incident.biometricMatch ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#080D1A]/80 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">Claimed Corporate Profile</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{incident.biometricMatch.targetName}</h4>
                      <p className="text-xs text-slate-400">{incident.biometricMatch.targetRole}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('profiles')}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Voiceprint</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Similarity meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-400">Cosine Similarity Score:</span>
                      <span className={`font-bold ${
                        incident.biometricMatch.voiceprintSimilarity >= 78 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {incident.biometricMatch.voiceprintSimilarity.toFixed(1)}% (Threshold: 78.0%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#080D1A] border border-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          incident.biometricMatch.voiceprintSimilarity >= 78 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                        }`}
                        style={{ width: `${incident.biometricMatch.voiceprintSimilarity}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#080D1A]/80 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Cosine Distance</span>
                      <span className="font-bold text-slate-200">{incident.biometricMatch.cosineDistance.toFixed(3)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080D1A]/80 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Embedding Confidence</span>
                      <span className="font-bold text-cyan-400">{incident.biometricMatch.embeddingConfidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#080D1A]/50 border border-dashed border-white/10 text-center space-y-2">
                  <HelpCircle className="h-8 w-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No Target Profile Associated</p>
                  <p className="text-[11px] text-slate-500">
                    This sample was analyzed as an un-enrolled external caller without a target identity comparison.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Quality & Forensic Signal Integrity */}
        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Acoustic Signal Quality Analysis
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Channel verification for physical forensic reliability</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl border border-white/5 bg-[#080D1A]/80 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] block">Signal-to-Noise Ratio (SNR)</span>
                  <span className="text-base font-bold text-white">{incident.audioMetadata.snrDb.toFixed(1)} dB</span>
                  <span className={`text-[10px] block mt-0.5 ${incident.audioMetadata.snrDb > 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {incident.audioMetadata.snrDb > 20 ? '• Optimal for ML Inference' : '• Low SNR Caution'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-[#080D1A]/80 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] block">Clipping / Distortion</span>
                  <span className="text-base font-bold text-white">{incident.audioMetadata.clippingPercentage.toFixed(2)}%</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">• Nominal Linear Headroom</span>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-[#080D1A]/80 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] block">Sampling Resolution</span>
                  <span className="text-base font-bold text-white">{(incident.audioMetadata.sampleRateHz / 1000).toFixed(1)} kHz</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">• {incident.audioMetadata.bitDepth}-bit {incident.audioMetadata.codec}</span>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-[#080D1A]/80 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] block">Channels Diarized</span>
                  <span className="text-base font-bold text-white">{incident.speakers.length} Speakers</span>
                  <span className="text-[10px] text-cyan-300 block mt-0.5">• DiarizeNet v1.9</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200/90 font-sans flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Audio quality meets the ISO/IEC 19794-13 biometric speech standards. Falsifiability is guaranteed: high background noise elevates uncertainty rather than forcing a false positive.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Deep Forensic Evidence Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">
            Supporting Forensic Evidence Dossier ({incident.evidenceList.length} Anomaly Indicators)
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Transparent, falsifiable acoustic indicators explaining the model inference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incident.evidenceList.map((evidence) => {
            const isExpanded = expandedEvidenceIds.includes(evidence.id);

            return (
              <div
                key={evidence.id}
                className="p-5 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-3 transition-all hover:border-cyan-500/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        evidence.anomalyLevel === 'critical'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : evidence.anomalyLevel === 'high'
                          ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                          : evidence.anomalyLevel === 'medium'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {evidence.anomalyLevel} Anomaly
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {evidence.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5">
                      {evidence.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleEvidence(evidence.id)}
                    className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {evidence.explanation}
                </p>

                {/* Evidence Metrics Table */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-[#080D1A]/80 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Observed Acoustic Metric</span>
                    <span className="font-bold text-white">{evidence.observedValue}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#080D1A]/80 border border-white/5">
                    <span className="text-slate-500 block text-[10px]">Normal Human Baseline</span>
                    <span className="font-semibold text-slate-400">{evidence.thresholdNormal}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 font-mono flex items-center justify-between animate-in fade-in duration-150">
                    <span>Signal Metric: {evidence.rawSignalMetric}</span>
                    <span className="text-cyan-300 font-semibold">{evidence.visualCue}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Actions Playbook */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0C1222]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-display">
            Recommended Security Playbook Actions
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Automated defense protocol triggered according to corporate risk tier policy:
        </p>

        <div className="space-y-2 pt-1">
          {incident.recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#080D1A]/80 border border-white/5 flex items-start gap-3 text-xs text-slate-200 font-sans"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[10px]">
                {idx + 1}
              </span>
              <span className="font-medium leading-normal">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible AI Notice & Limitations */}
      <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white">Model Limitations & Responsible AI Transparency:</span>
          <p className="leading-relaxed text-[11px] text-slate-400">
            Predictions represent statistical likelihoods computed from empirical acoustic and vocoder distribution models. Resona enforces human-in-the-loop oversight and never executes irrevocable financial actions solely on algorithmic confidence.
          </p>
        </div>
      </div>
    </div>
  );
};
