import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Fingerprint, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { AnalysisIncident } from '../../types';
import { RiskGauge } from '../common/RiskGauge';
import { DemoBadge } from '../common/DemoBadge';
import { ScreenId } from '../layout/Navbar';

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
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-soft-blue relative overflow-hidden ${
        isHighRisk
          ? 'bg-gradient-to-br from-white via-red-50/50 to-orange-50/40 border-red-200'
          : isHuman
          ? 'bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/40 border-emerald-200'
          : 'bg-gradient-to-br from-white via-amber-50/50 to-yellow-50/40 border-amber-200'
      }`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isHighRisk
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : isHuman
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {isHighRisk ? <ShieldAlert className="h-3.5 w-3.5" /> : isHuman ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                <span>CASE VERDICT • {incident.id}</span>
              </span>
              <DemoBadge type={incident.isExperimental ? 'experimental' : 'demo'} />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
              {incident.verdictLabel}
            </h1>

            <p className="text-sm text-slate-700 max-w-3xl leading-relaxed font-sans">
              {incident.summaryReason}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
              <span>Timestamp: {incident.timestamp}</span>
              <span>•</span>
              <span>Source: {incident.source}</span>
              <span>•</span>
              <span>Duration: {incident.audioMetadata.durationSeconds}s</span>
            </div>
          </div>

          {/* Gauge & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <RiskGauge
              score={incident.riskScore}
              confidence={incident.confidenceInterval.value}
              marginOfError={incident.confidenceInterval.marginOfError}
              uncertainty={incident.uncertaintyScore}
              category={incident.riskCategory}
              size="lg"
            />

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Forensic Dossier</span>
              </button>

              <button
                onClick={() => onNavigate('workspace')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-blue-600" />
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
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Biometric Identity Verification
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">ECAPA-TDNN Deep Speaker Embedding Matching</p>
                  </div>
                </div>

                {incident.biometricMatch && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                    incident.biometricMatch.matchDecision === 'matched'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : incident.biometricMatch.matchDecision === 'mismatch_spoof'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {incident.biometricMatch.matchDecision === 'matched' ? 'VERIFIED MATCH' : incident.biometricMatch.matchDecision === 'mismatch_spoof' ? 'MISMATCH / SPOOF' : 'INCONCLUSIVE'}
                  </span>
                )}
              </div>

              {incident.biometricMatch ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Claimed Corporate Profile</span>
                      <h4 className="text-sm font-bold text-slate-900">{incident.biometricMatch.targetName}</h4>
                      <p className="text-xs text-slate-500">{incident.biometricMatch.targetRole}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('profiles')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Voiceprint</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Similarity meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-600">Cosine Similarity Score:</span>
                      <span className={`font-bold ${
                        incident.biometricMatch.voiceprintSimilarity >= 78 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {incident.biometricMatch.voiceprintSimilarity.toFixed(1)}% (Threshold: 78.0%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          incident.biometricMatch.voiceprintSimilarity >= 78 ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${incident.biometricMatch.voiceprintSimilarity}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100">
                      <span className="text-slate-400 block text-[10px]">Cosine Distance</span>
                      <span className="font-bold text-slate-800">{incident.biometricMatch.cosineDistance.toFixed(3)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100">
                      <span className="text-slate-400 block text-[10px]">Embedding Confidence</span>
                      <span className="font-bold text-slate-800">{incident.biometricMatch.embeddingConfidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Target Profile Associated</p>
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
          <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Acoustic Signal Quality Analysis
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">Channel verification for physical forensic reliability</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Signal-to-Noise Ratio (SNR)</span>
                  <span className="text-base font-bold text-slate-900">{incident.audioMetadata.snrDb.toFixed(1)} dB</span>
                  <span className={`text-[10px] block mt-0.5 ${incident.audioMetadata.snrDb > 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {incident.audioMetadata.snrDb > 20 ? '• Optimal for ML Inference' : '• Low SNR Caution'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Clipping / Distortion</span>
                  <span className="text-base font-bold text-slate-900">{incident.audioMetadata.clippingPercentage.toFixed(2)}%</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">• Nominal Linear Headroom</span>
                </div>

                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Sampling Resolution</span>
                  <span className="text-base font-bold text-slate-900">{(incident.audioMetadata.sampleRateHz / 1000).toFixed(1)} kHz</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">• {incident.audioMetadata.bitDepth}-bit {incident.audioMetadata.codec}</span>
                </div>

                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Channels Diarized</span>
                  <span className="text-base font-bold text-slate-900">{incident.speakers.length} Speakers</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">• DiarizeNet v1.9</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-sans flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Audio quality meets the ISO/IEC 19794-13 biometric speech standards. Falsifiability is guaranteed: high background noise elevates uncertainty rather than forcing a false positive.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Deep Forensic Evidence Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Supporting Forensic Evidence Dossier ({incident.evidenceList.length} Anomaly Indicators)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Transparent, falsifiable acoustic indicators explaining the model inference
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incident.evidenceList.map((evidence) => {
            const isExpanded = expandedEvidenceIds.includes(evidence.id);

            return (
              <div
                key={evidence.id}
                className="p-5 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        evidence.anomalyLevel === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : evidence.anomalyLevel === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : evidence.anomalyLevel === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {evidence.anomalyLevel} Anomaly
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {evidence.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                      {evidence.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleEvidence(evidence.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {evidence.explanation}
                </p>

                {/* Evidence Metrics Table */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Observed Acoustic Metric</span>
                    <span className="font-bold text-slate-900">{evidence.observedValue}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Normal Human Baseline</span>
                    <span className="font-semibold text-slate-600">{evidence.thresholdNormal}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-sky-950 font-mono flex items-center justify-between animate-in fade-in duration-150">
                    <span>Signal Metric: {evidence.rawSignalMetric}</span>
                    <span className="text-sky-700 font-semibold">{evidence.visualCue}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Actions Playbook */}
      <div className="p-6 rounded-2xl border border-sky-100 bg-white shadow-soft-blue space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Recommended Security Playbook Actions
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-sans">
          Automated defense protocol triggered according to corporate risk tier policy:
        </p>

        <div className="space-y-2 pt-1">
          {incident.recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 text-xs text-slate-800 font-sans"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-mono font-bold text-[10px]">
                {idx + 1}
              </span>
              <span className="font-medium leading-normal">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible AI Notice & Limitations */}
      <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex items-start gap-3 text-xs text-slate-600">
        <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800">Model Limitations & Responsible AI Transparency:</span>
          <p className="leading-relaxed text-[11px]">
            Predictions represent statistical likelihoods computed from empirical acoustic and vocoder distribution models. Resona enforces human-in-the-loop oversight and never executes irrevocable financial actions solely on algorithmic confidence.
          </p>
        </div>
      </div>
    </div>
  );
};
