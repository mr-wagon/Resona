export type RiskCategory = 'synthetic_high' | 'synthetic_moderate' | 'uncertain' | 'human_verified';

export interface SpeakerSegment {
  id: string;
  speakerLabel: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  isFlaggedSynthetic: boolean;
  isTargetIdentity: boolean;
  confidence: number;
  f0MeanHz: number;
  snrDb: number;
  color: string;
}

export interface ForensicEvidence {
  id: string;
  title: string;
  category: 'spectral' | 'phase' | 'prosody' | 'respiratory' | 'biometric';
  anomalyLevel: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  observedValue: string;
  thresholdNormal: string;
  rawSignalMetric: string;
  visualCue: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number; // 0 to 100
  durationMs: number;
  metricsSummary?: Record<string, string>;
}

export interface AudioMetadata {
  filename: string;
  durationSeconds: number;
  sampleRateHz: number;
  channels: number;
  bitDepth: number;
  codec: string;
  fileSizeBytes: number;
  snrDb: number;
  clippingPercentage: number;
}

export interface BiometricMatchResult {
  targetProfileId: string;
  targetName: string;
  targetRole: string;
  voiceprintSimilarity: number; // 0 to 100
  matchDecision: 'matched' | 'mismatch_spoof' | 'inconclusive';
  cosineDistance: number;
  embeddingConfidence: number;
}

export interface AnalysisIncident {
  id: string;
  title: string;
  timestamp: string;
  source: 'VoIP Enterprise Call' | 'Inbound Voicemail' | 'Zoom Executive Recording' | 'Call Center IVR' | 'Wire Authorization Line' | 'Custom Upload';
  audioMetadata: AudioMetadata;
  riskScore: number; // 0 to 100
  riskCategory: RiskCategory;
  syntheticLikelihood: number; // 0 to 100
  confidenceInterval: {
    value: number;
    marginOfError: number;
  };
  uncertaintyScore: number; // 0 to 100
  verdictLabel: string;
  summaryReason: string;
  biometricMatch?: BiometricMatchResult;
  speakers: SpeakerSegment[];
  pipelineStages: PipelineStage[];
  evidenceList: ForensicEvidence[];
  recommendedActions: string[];
  isDemo: boolean;
  isExperimental: boolean;
  analystNotes?: string;
}

export interface VoiceProfile {
  id: string;
  fullName: string;
  role: string;
  department: string;
  employeeId: string;
  email: string;
  avatarUrl: string;
  securityTier: 'Tier 1 - Executive' | 'Tier 2 - Finance Approver' | 'Tier 3 - Standard Enterprise' | 'Tier 4 - VIP Client';
  voiceprintQuality: number; // 0 to 100
  enrollmentDate: string;
  lastVerifiedDate: string;
  status: 'active' | 'needs_update' | 'flagged_compromised';
  embeddingHash: string;
  voiceSamplesCount: number;
  sampleDurationSec: number;
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  version: string;
  architecture: string;
  targetTask: string;
  inferenceLatencyMs: number;
  accuracyRate: number;
  falsePositiveRate: number;
  status: 'active' | 'evaluating' | 'deprecated';
  isExperimental: boolean;
  description: string;
}

export interface SystemTelemetry {
  platformStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  activeModelsCount: number;
  averageLatencyMs: number;
  globalThreatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
  memoryIsolatedProcessing: boolean;
  audioStreamsProcessed: number;
  verifiedIdentitiesCount: number;
  spoofAttemptsBlocked: number;
}
