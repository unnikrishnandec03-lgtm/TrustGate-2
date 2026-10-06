export type Verdict = 'AUTHENTIC' | 'SUSPICIOUS' | 'CRITICAL_FRAUD';

export type ThreatVector =
  | 'VOICE_DEEPFAKE'
  | 'SYNTHETIC_KYC'
  | 'DOCUMENT_TAMPERING'
  | 'TRANSACTION_FRAUD'
  | 'SOCIAL_ENGINEERING'
  | 'CYBER_RECON';

export type HallmarkCategory =
  | 'METADATA'
  | 'PIXEL_ELA'
  | 'TYPOGRAPHY'
  | 'ARITHMETIC'
  | 'BIOMETRIC'
  | 'BEHAVIORAL';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EnforcementAction =
  | 'ALLOW'
  | 'FLAG_FOR_LEVEL_2_REVIEW'
  | 'QUARANTINE_AND_TERMINATE';

export interface ForensicHallmark {
  hallmark_id: string;
  category: HallmarkCategory;
  severity: Severity;
  title: string;
  finding_detail: string;
  bounding_box_2d: [number, number, number, number] | null; // [ymin, xmin, ymax, xmax] 0-1000 scale
  confidence?: number;
}

export interface ArithmeticReconciliation {
  performed: boolean;
  expected_value: number | null;
  detected_value: number | null;
  discrepancy_delta: number | null;
  status: 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';
  currency?: string;
  ledger_breakdown?: {
    label: string;
    stated: number;
    calculated: number;
    diff: number;
    flagged?: boolean;
  }[];
}

export interface MetadataFingerprint {
  software_signature: string;
  timestamp_anomaly: boolean;
  compression_uniformity: 'CONSISTENT' | 'ANOMALOUS';
  sha256?: string;
  camera_or_engine?: string;
  icc_profile?: string;
  resolution?: string;
  file_format?: string;
  exif_raw?: Record<string, string>;
}

export interface TrustGatePayload {
  project: 'TrustGate' | 'TrustGate Sentinel';
  verdict: Verdict;
  threat_vector: ThreatVector;
  overall_risk_score: number; // 0-100
  confidence_score: number; // 0.00 - 1.00
  forensic_hallmarks: ForensicHallmark[];
  arithmetic_reconciliation: ArithmeticReconciliation;
  metadata_fingerprint: MetadataFingerprint;
  enforcement_action: EnforcementAction;
}

export interface PresetScenario {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  category: ThreatVector;
  riskScore: number;
  verdict: Verdict;
  latencyMs: number;
  payload: TrustGatePayload;
  fileDetails: {
    fileName: string;
    fileSize: string;
    fileType: 'image' | 'document' | 'audio' | 'telemetry';
    thumbnailUrl?: string;
    sourceDocumentUrl?: string;
    elaHeatmapUrl?: string;
  };
  vectorScores: Record<ThreatVector, number>;
  spectrogramData?: {
    timePoints: string[];
    syntheticJitterIndex: number;
    vocoderArtifactFreq: string;
    missingInhalationCount: number;
    audioFrequencies: number[];
  };
  socialEngineeringAnalysis?: {
    urgencyMultiplier: number;
    roboticPacingScore: number;
    pretextType: string;
    channel: string;
    senderSpoofProbability: number;
  };
  transactionMesh?: {
    nodes: Array<{ id: string; label: string; role: string; risk: number }>;
    links: Array<{ source: string; target: string; amount: string; cycleId?: string }>;
    circularCycleFound: boolean;
  };
}

export interface HistoricalScan {
  timestamp: string;
  id: string;
  targetName: string;
  vector: ThreatVector;
  riskScore: number;
  verdict: Verdict;
  latencyMs: number;
  enforcement: EnforcementAction;
}

export interface RelevantCriterionResult {
  id: string;
  name: string;
  status: 'PASS' | 'SUSPICIOUS' | 'FAILED';
  weight_penalty: number;
  observed_finding: string;
}

export interface PinpointedAnomaly {
  id: string;
  criterion_name: string;
  location_label: string;
  spatial_bounding_box?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  temporal_marker?: {
    start_time: string;
    end_time: string;
  };
  discrepancy_detail: string;
  expected_normal?: string;
  actual_observed?: string;
}

export interface TargetedAuditResponse {
  detected_media_type: 'AUDIO' | 'PORTRAIT_KYC' | 'FINANCIAL_DOCUMENT';
  assigned_vector_id: 'VEC-01' | 'VEC-02' | 'VEC-04';
  assigned_vector_title: string;
  dynamic_risk_score: number;
  is_fraud: boolean;
  confidence_percentage: number;
  relevant_criteria_results: RelevantCriterionResult[];
  pinpointed_anomalies: PinpointedAnomaly[];
  monitor_intimation: {
    urgency: 'LOW' | 'ELEVATED' | 'CRITICAL';
    summary: string;
    recommended_action: 'APPROVE' | 'ESCALATE_REVIEW' | 'IMMEDIATE_FREEZE';
  };
}
