import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  Users,
  Eye,
  Sliders,
  Play,
  RotateCw,
  Download,
  Lock,
  Unlock,
  Radio,
  Activity,
  FileText,
  FileCheck,
  FileX,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  Flame,
  KeyRound,
  FileCode,
  Copy,
  Check,
  RefreshCw,
  AlertOctagon,
  Phone,
  Mail,
  Send,
  Maximize2,
  LogOut,
  Sun,
  Moon,
  Upload,
  FileUp,
  File,
  Music,
  Image as ImageIcon,
  FileSpreadsheet,
  Battery,
  CheckCheck,
  Inbox,
  ArrowUpRight,
  Globe,
  Crosshair,
} from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { PictureAnomalyAndWebPostureViewer } from './components/PictureAnomalyAndWebPostureViewer';
import { AdaptiveTriageWorkbench } from './components/AdaptiveTriageWorkbench';
import { WebGroundingAuditSection } from './components/WebGroundingAuditSection';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type UserRole = 'ANALYST' | 'MONITOR' | 'DIRECTOR';

export interface ThreatDiscipline {
  id: string;
  code: string;
  title: string;
  tagline: string;
  hallmarkDetail: string;
  riskScore: number;
  latencyMs: number;
  confidence: number;
  sha256: string;
  assetType: 'audio' | 'identity' | 'document' | 'ledger' | 'pretext' | 'graph';
  assetTitle: string;
  assetSubtitle: string;
  anomalyCoordinates: { x: number; y: number; label: string };
  metrics: { label: string; value: string; anomaly: boolean }[];
  rawVerdict: 'SUSPICIOUS' | 'CRITICAL_FRAUD' | 'AUTHENTIC';
}

export interface AnalystSubmission {
  id: string;
  vectorCode: string;
  targetName: string;
  submittedBy: string;
  timestamp: string;
  aiRiskScore: number;
  analystVerdict: 'FLAG_SUSPICIOUS' | 'CONFIRM_FRAUD' | 'FALSE_POSITIVE';
  confidenceScore: number;
  notes: string;
  qaStatus: 'PENDING_REVIEW' | 'APPROVED' | 'OVERRIDDEN' | 'REJECTED' | 'ESCALATED_TO_DIRECTOR';
}

export interface DirectorIntimation {
  id: string;
  submissionId: string;
  vectorCode: string;
  fileName: string;
  fileType: string;
  riskScore: number;
  analystName: string;
  monitorName: string;
  analystNotes: string;
  monitorNotes: string;
  intimationTimestamp: string;
  status: 'PENDING_DIRECTOR' | 'CLEARED_MISTAKE' | 'QUARANTINE_AUTHORIZED';
  sha256: string;
}

export interface UploadPreset {
  name: string;
  type: string;
  size: string;
  vectorCode: string;
  disciplineId: string;
  riskScore: number;
  verdict: 'CRITICAL_FRAUD' | 'SUSPICIOUS' | 'AUTHENTIC';
  hallmark: string;
  tagline: string;
  sha256: string;
}

export interface RejectedDocument {
  id: string;
  vectorCode: string;
  fileName: string;
  rejectedAt: string;
  riskScore: number;
  failureReason: string;
  thresholdDelta: string;
  shaFingerprint: string;
  status: 'QUARANTINED' | 'OVERRIDDEN';
}

// ============================================================================
// COMPREHENSIVE MOCK DATA (6 DISCIPLINES & RBAC DATASETS)
// ============================================================================

const THREAT_DISCIPLINES: ThreatDiscipline[] = [
  {
    id: 'vec-01',
    code: 'VEC-01',
    title: 'Voice Clones & Audio Deepfakes',
    tagline: 'Acoustic Phase Jitter & Vocoder Artifacts',
    hallmarkDetail: 'Vocoder pitch invariance, acoustic phase jitter, absence of natural breathing micro-tremors. Hard cutoff detected at 8.2 kHz.',
    riskScore: 92,
    latencyMs: 312,
    confidence: 0.98,
    sha256: '3e1c95b682e047f481c4e97a39d248b9015c7e09b1f2384a8027a4e6291b5c2a',
    assetType: 'audio',
    assetTitle: 'CEO_Offshore_Approval_Call_9402.wav',
    assetSubtitle: 'Synthetic Voice Waveform · ElevenLabs v2 Neural Profile Detected',
    anomalyCoordinates: { x: 55, y: 38, label: '8.2 kHz Neural Filter Seam' },
    metrics: [
      { label: 'Harmonic Phase Jitter', value: '4.8x Baseline', anomaly: true },
      { label: 'Physiological Inhalation', value: '0.00% Found', anomaly: true },
      { label: 'Conversational Cadence', value: '210ms Robotic', anomaly: true },
      { label: 'Dynamic SNR', value: '42.1 dB', anomaly: false },
    ],
    rawVerdict: 'CRITICAL_FRAUD',
  },
  {
    id: 'vec-02',
    code: 'VEC-02',
    title: 'Synthetic KYC & Ghost Identities',
    tagline: 'Diffusion Inpainting & Corneal Specularity',
    hallmarkDetail: 'Diffusion inpainting seam divergence, halo boundary artifacts, virtual camera bypass markers, and asymmetric corneal specularity disparity.',
    riskScore: 95,
    latencyMs: 440,
    confidence: 0.99,
    sha256: '99bf0122e84128f8ac2304859a91c28f11902830219803450912830192830192',
    assetType: 'identity',
    assetTitle: 'IDENTITY_CREDENTIAL_GHOST_8819.jpg',
    assetSubtitle: 'Government ID · Latent Diffusion Face Swap on Stock Blank',
    anomalyCoordinates: { x: 48, y: 44, label: 'Diffusion Inpainting Boundary' },
    metrics: [
      { label: 'Corneal Reflection Kelvin', value: '5600K / 4000K Delta', anomaly: true },
      { label: 'Pixel Mesh Divergence', value: '0.88 Generative', anomaly: true },
      { label: 'Micro-Texture Frequency', value: 'Over-Smoothed', anomaly: true },
      { label: 'Template Hologram Match', value: '98.2% Standard', anomaly: false },
    ],
    rawVerdict: 'CRITICAL_FRAUD',
  },
  {
    id: 'vec-03',
    code: 'VEC-03',
    title: 'Document Integrity & Tampering',
    tagline: 'Pixel ELA Noise Deltas & Font Kerning',
    hallmarkDetail: 'Error Level Analysis (ELA) compression noise deltas, resampled quantization tables, and non-standard typography kerning variance.',
    riskScore: 88,
    latencyMs: 380,
    confidence: 0.96,
    sha256: '4a6b4d320fb72462e08615c4d3209581eb080a2b5e28a0115c5443fa7e4a11b9',
    assetType: 'document',
    assetTitle: 'HDFC_Bank_Statement_Q3_Tampered.pdf',
    assetSubtitle: 'Financial Statement · 4.8x Higher JPEG Resave Density',
    anomalyCoordinates: { x: 62, y: 52, label: 'ELA Quantization Residual Delta' },
    metrics: [
      { label: 'Resave ELA Delta', value: '4.8x Matrix Spike', anomaly: true },
      { label: 'Font Kerning Variance', value: '+1.4pt Faux-Bold', anomaly: true },
      { label: 'EXIF Software Marker', value: 'Adobe Photoshop CC', anomaly: true },
      { label: 'PDF Object Structure', value: 'Valid v1.6 Container', anomaly: false },
    ],
    rawVerdict: 'CRITICAL_FRAUD',
  },
  {
    id: 'vec-04',
    code: 'VEC-04',
    title: 'Financial Ledger Discrepancies',
    tagline: 'Cross-Field Arithmetic Contradiction',
    hallmarkDetail: 'Cross-field arithmetic contradiction: Gross Earnings minus Deductions != declared Net compensation by ₹75,000 variance.',
    riskScore: 84,
    latencyMs: 290,
    confidence: 0.97,
    sha256: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    assetType: 'ledger',
    assetTitle: 'Corporate_Payroll_Ledger_Oct2026.csv',
    assetSubtitle: 'Reconciliation Audit · Stated ₹14,20,000 vs Calculated ₹13,45,000',
    anomalyCoordinates: { x: 70, y: 65, label: '₹75,000 Balance Discrepancy' },
    metrics: [
      { label: 'Ledger Sum Delta', value: '₹75,000.00 Mismatch', anomaly: true },
      { label: 'Deduction Balance Ratio', value: 'Math Contradiction', anomaly: true },
      { label: 'Employee ID Checksum', value: 'Valid Luhn Check', anomaly: false },
      { label: 'Bank Routing Transit', value: 'Authorized IFSC', anomaly: false },
    ],
    rawVerdict: 'SUSPICIOUS',
  },
  {
    id: 'vec-05',
    code: 'VEC-05',
    title: 'AI Pretexting & Social Engineering',
    tagline: 'Prompt Injection & Conversational Urgency',
    hallmarkDetail: 'Automated conversational turn velocity, prompt injection markers, synthetic urgency heuristics, and homograph Cyrillic domain spoofing.',
    riskScore: 79,
    latencyMs: 345,
    confidence: 0.94,
    sha256: '55b0a3901b7a2d8157e1039bb834892cfa920384a1e948c3b708320184fae231',
    assetType: 'pretext',
    assetTitle: 'Urgent_CFO_Escrow_Directive_710.eml',
    assetSubtitle: 'Executive Email · 9.4x Urgency Multiplier & Spoofed Domain',
    anomalyCoordinates: { x: 42, y: 30, label: 'Punycode Homograph Header' },
    metrics: [
      { label: 'Urgency Multiplier', value: '9.4x Anomaly', anomaly: true },
      { label: 'Punycode Domain Spoof', value: 'Cyrillic "о" Detected', anomaly: true },
      { label: 'Autonomous Turn Rate', value: 'Sub-second Botnet', anomaly: true },
      { label: 'DKIM Sign Status', value: 'Header Broken', anomaly: true },
    ],
    rawVerdict: 'SUSPICIOUS',
  },
  {
    id: 'vec-06',
    code: 'VEC-06',
    title: 'Wash Trading & Sybil Networks',
    tagline: 'Graph Collusion & Circular Liquidity Loops',
    hallmarkDetail: 'Graph collusion mesh, circular liquidity routing loop across 14 newly generated wallet nodes returning 98.1% principal funds.',
    riskScore: 97,
    latencyMs: 512,
    confidence: 0.99,
    sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    assetType: 'graph',
    assetTitle: 'Mempool_Cluster_Telemetry_Tx904.json',
    assetSubtitle: '4-Hop Circular Collusion Mesh · $420,000 Principal Wash Cycle',
    anomalyCoordinates: { x: 50, y: 50, label: 'Circular Collusion Node Hop' },
    metrics: [
      { label: 'Principal Recycling Rate', value: '98.1% Returned', anomaly: true },
      { label: 'Poisson Clock Sync', value: '12.000s Robotic', anomaly: true },
      { label: 'Sybil Node Generation', value: '14 Wallets < 1hr', anomaly: true },
      { label: 'Gas Price War Priority', value: '380 Gwei Private', anomaly: false },
    ],
    rawVerdict: 'CRITICAL_FRAUD',
  },
];

const INITIAL_SUBMISSIONS: AnalystSubmission[] = [
  {
    id: 'SUB-4091',
    vectorCode: 'VEC-03',
    targetName: 'HDFC_Statement_Q3_Tampered.pdf',
    submittedBy: 'David Park (Analyst)',
    timestamp: '2 mins ago',
    aiRiskScore: 88,
    analystVerdict: 'CONFIRM_FRAUD',
    confidenceScore: 0.96,
    notes: 'ELA shows clear JPEG recompression boundary around INR 8,50,000 line item with Arial Bold font stroke variance.',
    qaStatus: 'PENDING_REVIEW',
  },
  {
    id: 'SUB-4089',
    vectorCode: 'VEC-01',
    targetName: 'CEO_Offshore_Approval_Call_9402.wav',
    submittedBy: 'Elena Rostova (Analyst)',
    timestamp: '8 mins ago',
    aiRiskScore: 92,
    analystVerdict: 'CONFIRM_FRAUD',
    confidenceScore: 0.98,
    notes: 'No physiological micro-breathing across 8.4 seconds. Artificial vocoder frequency cutoff at 8.2 kHz.',
    qaStatus: 'PENDING_REVIEW',
  },
  {
    id: 'SUB-4085',
    vectorCode: 'VEC-04',
    targetName: 'Corporate_Payroll_Ledger_Oct2026.csv',
    submittedBy: 'Sarah Connor (Analyst)',
    timestamp: '24 mins ago',
    aiRiskScore: 84,
    analystVerdict: 'FLAG_SUSPICIOUS',
    confidenceScore: 0.95,
    notes: 'Math discrepancy of ₹75,000 detected between gross and net deductions. Requires supervisor sign-off.',
    qaStatus: 'APPROVED',
  },
  {
    id: 'SUB-4078',
    vectorCode: 'VEC-02',
    targetName: 'IDENTITY_CREDENTIAL_GHOST_8819.jpg',
    submittedBy: 'Marcus Brody (Analyst)',
    timestamp: '41 mins ago',
    aiRiskScore: 95,
    analystVerdict: 'CONFIRM_FRAUD',
    confidenceScore: 0.99,
    notes: 'Corneal lighting mismatch: 5600K studio strobe in left pupil vs 4000K diffuse illumination in right.',
    qaStatus: 'APPROVED',
  },
];

const INITIAL_REJECTIONS: RejectedDocument[] = [
  {
    id: 'REJ-901',
    vectorCode: 'VEC-03',
    fileName: 'HDFC_Statement_Q3_Tampered.pdf',
    rejectedAt: '19:42:10',
    riskScore: 88,
    failureReason: 'Resave ELA Compression Delta (4.8x) & Font Kerning (+1.4pt)',
    thresholdDelta: '+13% over 75% cutoff',
    shaFingerprint: '4a6b4d320fb72462e08615c4d3209581...',
    status: 'QUARANTINED',
  },
  {
    id: 'REJ-902',
    vectorCode: 'VEC-01',
    fileName: 'CEO_Offshore_Approval_Call_9402.wav',
    rejectedAt: '19:35:48',
    riskScore: 92,
    failureReason: 'Neural TTS Vocoder Phase Jitter & Hard Frequency Cutoff at 8.2 kHz',
    thresholdDelta: '+17% over 75% cutoff',
    shaFingerprint: '3e1c95b682e047f481c4e97a39d248b9...',
    status: 'QUARANTINED',
  },
  {
    id: 'REJ-903',
    vectorCode: 'VEC-04',
    fileName: 'Corporate_Payroll_Ledger_Oct2026.csv',
    rejectedAt: '19:18:22',
    riskScore: 84,
    failureReason: 'Cross-Field Arithmetic Contradiction (₹75,000 Variance Gap)',
    thresholdDelta: '+9% over 75% cutoff',
    shaFingerprint: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f...',
    status: 'QUARANTINED',
  },
  {
    id: 'REJ-904',
    vectorCode: 'VEC-02',
    fileName: 'IDENTITY_CREDENTIAL_GHOST_8819.jpg',
    rejectedAt: '18:54:19',
    riskScore: 95,
    failureReason: 'Diffusion Inpainting Boundary Seam & Specularity Mismatch',
    thresholdDelta: '+20% over 75% cutoff',
    shaFingerprint: '99bf0122e84128f8ac2304859a91c28f...',
    status: 'QUARANTINED',
  },
  {
    id: 'REJ-905',
    vectorCode: 'VEC-06',
    fileName: 'Mempool_Cluster_Telemetry_Tx904.json',
    rejectedAt: '18:22:04',
    riskScore: 97,
    failureReason: 'Deterministic 4-Hop Circular Collusion Mesh ($420k Re-circulation)',
    thresholdDelta: '+22% over 75% cutoff',
    shaFingerprint: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d...',
    status: 'QUARANTINED',
  },
];

const SAMPLE_UPLOAD_PRESETS: UploadPreset[] = [
  {
    name: 'HDFC_Bank_Statement_Q3_Tampered.pdf',
    type: 'Document (PDF)',
    size: '1.42 MB',
    vectorCode: 'VEC-03',
    disciplineId: 'vec-03',
    riskScore: 88,
    verdict: 'CRITICAL_FRAUD',
    hallmark: 'Resave ELA Compression Noise Delta (4.8x) & Font Kerning (+1.4pt discrepancy in account balance)',
    tagline: 'Document Tampering & ELA Residuals',
    sha256: '4a6b4d320fb72462e08615c4d3209581eb080a2b5e28a0115c5443fa7e4a11b9',
  },
  {
    name: 'CEO_Offshore_Approval_Call_ElevenLabs.wav',
    type: 'Voice Audio (WAV)',
    size: '3.8 MB',
    vectorCode: 'VEC-01',
    disciplineId: 'vec-01',
    riskScore: 92,
    verdict: 'CRITICAL_FRAUD',
    hallmark: 'Vocoder pitch invariance, acoustic phase jitter, absence of natural breathing micro-tremors (8.2 kHz hard cutoff)',
    tagline: 'Synthetic Voice Waveform · Deepfake Audio',
    sha256: '3e1c95b682e047f481c4e97a39d248b9015c7e09b1f2384a8027a4e6291b5c2a',
  },
  {
    name: 'IDENTITY_CREDENTIAL_GHOST_8819.jpg',
    type: 'Identity Photo (JPG)',
    size: '2.1 MB',
    vectorCode: 'VEC-02',
    disciplineId: 'vec-02',
    riskScore: 95,
    verdict: 'CRITICAL_FRAUD',
    hallmark: 'Diffusion inpainting seam divergence, halo boundary artifacts, asymmetric corneal reflection (5600K vs 4000K)',
    tagline: 'Synthetic KYC & Ghost Identity',
    sha256: '99bf0122e84128f8ac2304859a91c28f11902830219803450912830192830192',
  },
  {
    name: 'Corporate_Payroll_Ledger_Discrepant.csv',
    type: 'Financial Ledger (CSV)',
    size: '840 KB',
    vectorCode: 'VEC-04',
    disciplineId: 'vec-04',
    riskScore: 84,
    verdict: 'SUSPICIOUS',
    hallmark: 'Cross-field arithmetic contradiction (Gross minus Deductions != declared Net compensation by ₹75,000)',
    tagline: 'Financial Ledger Contradiction',
    sha256: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
  },
  {
    name: 'Verified_Govt_Passport_Authentic.png',
    type: 'Authentic Document (PNG)',
    size: '1.9 MB',
    vectorCode: 'VEC-02',
    disciplineId: 'vec-02',
    riskScore: 12,
    verdict: 'AUTHENTIC',
    hallmark: 'Zero diffusion seams. Authentic holographic micro-engraving & corneal Kelvin match across both pupils.',
    tagline: 'Verified Clean Government Credential',
    sha256: 'b5c2a3e1c95b682e047f481c4e97a39d248b9015c7e09b1f2384a8027a4e6291',
  },
];

const INITIAL_INTIMATIONS: DirectorIntimation[] = [
  {
    id: 'INT-701',
    submissionId: 'SUB-4089',
    vectorCode: 'VEC-01',
    fileName: 'CEO_Offshore_Approval_Call_9402.wav',
    fileType: 'Voice Deepfake Audio',
    riskScore: 92,
    analystName: 'Elena Rostova (Analyst)',
    monitorName: 'Stan Hristov (Monitor)',
    analystNotes: 'No physiological micro-breathing across 8.4 seconds. Artificial vocoder frequency cutoff at 8.2 kHz.',
    monitorNotes: 'Verified neural pitch invariance. Escalated to Executive Director for final clearance or quarantine.',
    intimationTimestamp: '5 mins ago',
    status: 'PENDING_DIRECTOR',
    sha256: '3e1c95b682e047f481c4e97a39d248b9015c7e09b1f2384a8027a4e6291b5c2a',
  },
];

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Authentication & Session Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);
  const toggleTheme = () => setIsDark((prev) => !prev);

  // Global Active Role Tier
  const [activeRole, setActiveRole] = useState<UserRole>('ANALYST');
  const [operatorName, setOperatorName] = useState('Elena Rostova');
  const [operatorPhone, setOperatorPhone] = useState('+1 (555) 234-5678');
  const [operatorEmail, setOperatorEmail] = useState('elena.rostova@gmail.com');

  // File Upload & Multimodal Scanning State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
    verdict: 'CRITICAL_FRAUD' | 'SUSPICIOUS' | 'AUTHENTIC';
    riskScore: number;
    failureHallmark: string;
    vectorCode: string;
    sha256: string;
    latencyMs: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cross-Tier Escalation Workflow Tracking (Analyst -> Monitor -> Director)
  const [lastEscalatedSub, setLastEscalatedSub] = useState<AnalystSubmission | null>(null);
  const [lastIntimation, setLastIntimation] = useState<DirectorIntimation | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'ALL' | 'DOCUMENT' | 'PHOTO' | 'VOICE'>('ALL');
  const [analystStageMode, setAnalystStageMode] = useState<'web_grounding' | 'adaptive_triage' | 'web_posture' | 'telemetry'>('web_grounding');
  const [pictureInspectionModal, setPictureInspectionModal] = useState<{
    isOpen: boolean;
    fileName: string;
    imageSrc?: string;
    riskScore: number;
    isAuthentic?: boolean;
  } | null>(null);

  // Intimations State (Monitor -> Director)
  const [intimations, setIntimations] = useState<DirectorIntimation[]>(INITIAL_INTIMATIONS);

  const handleLogin = (name: string, phone: string, email: string, role: UserRole) => {
    setOperatorName(name);
    setOperatorPhone(phone);
    setOperatorEmail(email);
    setActiveRole(role);
    setIsAuthenticated(true);
    showToast(`OPERATOR AUTHENTICATED: Welcome ${name}. Access granted as ${role}.`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('OPERATOR SIGNED OUT: Returned to authentication portal.', 'warn');
  };

  // Analyst State
  const [activeVectorId, setActiveVectorId] = useState<string>('vec-03');
  const [inspectionMode, setInspectionMode] = useState<'source' | 'ela' | 'composite'>('composite');
  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(true);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState<boolean>(false);
  const [escalationNotes, setEscalationNotes] = useState<string>('');
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'warn' | 'rose' } | null>(null);

  // Monitor State
  const [submissions, setSubmissions] = useState<AnalystSubmission[]>(INITIAL_SUBMISSIONS);
  const [rejectedDocs, setRejectedDocs] = useState<RejectedDocument[]>(INITIAL_REJECTIONS);
  const [rejectionFilter, setRejectionFilter] = useState<string>('ALL');

  // Director State
  const [autoPassThreshold, setAutoPassThreshold] = useState<number>(30);
  const [autoRejectThreshold, setAutoRejectThreshold] = useState<number>(75);
  const [isGatewayLocked, setIsGatewayLocked] = useState<boolean>(false);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState<boolean>(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [isRebalanceActive, setIsRebalanceActive] = useState<boolean>(false);

  // Active Threat Discipline
  const activeDiscipline = THREAT_DISCIPLINES.find((d) => d.id === activeVectorId) || THREAT_DISCIPLINES[2];

  // DOM Refs for Anime.js
  const roleContainerRef = useRef<HTMLDivElement>(null);
  const laserScannerRef = useRef<HTMLDivElement>(null);
  const riskCounterRef = useRef<HTMLSpanElement>(null);
  const latencyCounterRef = useRef<HTMLSpanElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  // Role Switch Animation with Anime.js
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === activeRole) return;

    if (roleContainerRef.current) {
      anime({
        targets: roleContainerRef.current,
        opacity: [1, 0],
        translateY: [0, -10],
        duration: 180,
        easing: 'easeInQuad',
        complete: () => {
          setActiveRole(newRole);
          setTimeout(() => {
            if (roleContainerRef.current) {
              anime({
                targets: roleContainerRef.current,
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 320,
                easing: 'easeOutCubic',
              });

              // Stagger cards in the new view
              anime({
                targets: '.stagger-card',
                opacity: [0, 1],
                translateY: [18, 0],
                delay: anime.stagger(60),
                duration: 400,
                easing: 'easeOutCubic',
              });
            }
          }, 40);
        },
      });
    } else {
      setActiveRole(newRole);
    }
  };

  // Vector card click with Anime.js Elastic Spring Transition
  const handleSelectVector = (vectorId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveVectorId(vectorId);
    const target = event.currentTarget;
    anime({
      targets: target,
      scale: [1, 1.05, 1],
      translateY: [0, -4, 0],
      duration: 380,
      easing: 'spring(1, 80, 10, 0)',
    });
  };

  // Animate Laser Scanner (sweeps all the way down and up)
  useEffect(() => {
    if (laserScannerRef.current && isLaserScanning && activeRole === 'ANALYST') {
      anime.remove(laserScannerRef.current);
      const containerHeight = laserScannerRef.current.parentElement?.clientHeight || 370;
      const anim = anime({
        targets: laserScannerRef.current,
        translateY: [0, containerHeight - 8],
        duration: 2000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
      return () => {
        anim.pause();
        if (laserScannerRef.current) {
          anime.remove(laserScannerRef.current);
        }
      };
    }
  }, [isLaserScanning, activeRole, activeVectorId, uploadedFile, analystStageMode]);

  // Animate Risk and Latency Tickers with easeOutExpo
  useEffect(() => {
    if (activeRole === 'ANALYST') {
      const targetRisk = uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore;
      const targetLatency = uploadedFile ? uploadedFile.latencyMs : activeDiscipline.latencyMs;

      const riskObj = { val: 0 };
      if (riskCounterRef.current) {
        anime({
          targets: riskObj,
          val: targetRisk,
          round: 1,
          duration: 900,
          easing: 'easeOutExpo',
          update: () => {
            if (riskCounterRef.current) {
              riskCounterRef.current.innerText = `${riskObj.val}%`;
            }
          },
        });
      }

      const latencyObj = { val: 100 };
      if (latencyCounterRef.current) {
        anime({
          targets: latencyObj,
          val: targetLatency,
          round: 1,
          duration: 800,
          easing: 'easeOutExpo',
          update: () => {
            if (latencyCounterRef.current) {
              latencyCounterRef.current.innerText = `${latencyObj.val}ms`;
            }
          },
        });
      }

      // Animate Reticle Radar Pulse
      if (reticleRef.current) {
        anime({
          targets: reticleRef.current,
          scale: [0.95, 1.15, 0.95],
          duration: 1800,
          loop: true,
          easing: 'easeInOutSine',
        });
      }
    }
  }, [activeRole, activeVectorId, uploadedFile]);

  // Notification helper
  const showToast = (message: string, type: 'success' | 'warn' | 'rose' = 'success') => {
    setActionNotification({ message, type });
    setTimeout(() => {
      setActionNotification(null);
    }, 3800);
  };

  // Analyst Action: Verify Clean
  const handleVerifyClean = () => {
    showToast(`VERIFIED ORIGINAL: "${activeDiscipline.assetTitle}" passed all biometric/arithmetic bounds. Routed to core banking ledger.`, 'success');
  };

  // Analyst Action: Open Escalation Modal
  const handleOpenEscalation = () => {
    setEscalationNotes(activeDiscipline.hallmarkDetail);
    setIsEscalationModalOpen(true);
  };

  // Analyst Action: Submit Escalation to Monitor
  const handleSubmitEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: AnalystSubmission = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      vectorCode: activeDiscipline.code,
      targetName: activeDiscipline.assetTitle,
      submittedBy: `${operatorName} (Analyst)`,
      timestamp: 'Just now',
      aiRiskScore: activeDiscipline.riskScore,
      analystVerdict: 'CONFIRM_FRAUD',
      confidenceScore: activeDiscipline.confidence,
      notes: escalationNotes || activeDiscipline.hallmarkDetail,
      qaStatus: 'PENDING_REVIEW',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    setIsEscalationModalOpen(false);
    showToast(`CASE ESCALATED: Sent to Level 2 Monitor Queue with analyst notes and cryptographic SHA-256 seal.`, 'warn');
  };

  // Handler for Adaptive Triage Escalation (Analyst -> Monitor)
  const handleAdaptiveEscalate = (dossier: {
    targetName: string;
    vectorCode: string;
    riskScore: number;
    verdict: string;
    notes: string;
    auditResponse: any;
  }) => {
    const newSub: AnalystSubmission = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      vectorCode: dossier.vectorCode,
      targetName: dossier.targetName,
      submittedBy: `${operatorName} (Analyst)`,
      timestamp: 'Just now',
      aiRiskScore: dossier.riskScore,
      analystVerdict: dossier.verdict === 'AUTHENTIC' ? 'FALSE_POSITIVE' : 'CONFIRM_FRAUD',
      confidenceScore: (dossier.auditResponse?.confidence_percentage || 95) / 100,
      notes: dossier.notes,
      qaStatus: 'PENDING_REVIEW',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    setLastEscalatedSub(newSub);
    showToast(`SUPERVISORY INTIMATION: "${dossier.targetName}" escalated to Level 2 Monitor Queue with medium-specific findings.`, 'warn');
  };

  // Monitor Action: QA Decision
  const handleMonitorDecision = (id: string, action: 'APPROVED' | 'OVERRIDDEN' | 'REJECTED') => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, qaStatus: action } : sub))
    );
    if (action === 'APPROVED') {
      showToast(`ESCALATION APPROVED: Case ${id} locked in HSM quarantine enclave.`, 'rose');
    } else if (action === 'OVERRIDDEN') {
      showToast(`OVERRIDDEN TO PASS: Case ${id} designated legitimate and forwarded to core banking.`, 'success');
    } else {
      showToast(`STRIKE ASSIGNED: Case ${id} flagged for forensic re-training audit.`, 'warn');
    }
  };

  // Monitor Action: Force Override in Rejected Vault
  const handleToggleVaultStatus = (id: string) => {
    setRejectedDocs((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextStatus = doc.status === 'QUARANTINED' ? 'OVERRIDDEN' : 'QUARANTINED';
          showToast(`AUDIT VAULT: Document ${id} status shifted to ${nextStatus}.`, nextStatus === 'OVERRIDDEN' ? 'warn' : 'rose');
          return { ...doc, status: nextStatus };
        }
        return doc;
      })
    );
  };

  // MULTIMODAL FILE UPLOAD & AI FORENSIC ANALYSIS ENGINE
  const handleProcessFileUpload = (fileData: {
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
    vectorCode?: string;
    disciplineId?: string;
    riskScore?: number;
    verdict?: 'CRITICAL_FRAUD' | 'SUSPICIOUS' | 'AUTHENTIC';
    hallmark?: string;
    sha256?: string;
  }) => {
    setIsUploading(true);
    setUploadProgress(20);

    setTimeout(() => setUploadProgress(65), 350);

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(100);

      const isAudio = fileData.type.includes('audio') || fileData.name.endsWith('.wav') || fileData.name.endsWith('.mp3');
      const isImage = fileData.type.includes('image') || fileData.name.endsWith('.jpg') || fileData.name.endsWith('.png');
      const isSpreadsheet = fileData.name.endsWith('.csv') || fileData.name.endsWith('.xlsx');

      const assignedVectorCode = fileData.vectorCode || (isAudio ? 'VEC-01' : isImage ? 'VEC-02' : isSpreadsheet ? 'VEC-04' : 'VEC-03');
      const assignedDisciplineId = fileData.disciplineId || (isAudio ? 'vec-01' : isImage ? 'vec-02' : isSpreadsheet ? 'vec-04' : 'vec-03');
      const assignedRisk = fileData.riskScore ?? (Math.floor(78 + Math.random() * 18));
      const assignedVerdict = fileData.verdict || (assignedRisk > 75 ? 'CRITICAL_FRAUD' : 'SUSPICIOUS');
      const assignedHallmark = fileData.hallmark || (
        isAudio
          ? 'Neural vocoder pitch invariance (ElevenLabs profile) and 8.2 kHz sharp cutoff detected.'
          : isImage
          ? 'Diffusion inpainting boundary seam divergence & asymmetric corneal lighting disparity.'
          : isSpreadsheet
          ? 'Cross-field arithmetic inconsistency: ₹75,000 variance gap between gross deductions and net.'
          : 'Error Level Analysis (ELA) resave noise density delta (4.8x) & font kerning mismatch.'
      );
      const assignedSha = fileData.sha256 || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const scanResult = {
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        dataUrl: fileData.dataUrl,
        verdict: assignedVerdict,
        riskScore: assignedRisk,
        failureHallmark: assignedHallmark,
        vectorCode: assignedVectorCode,
        sha256: assignedSha,
        latencyMs: Math.floor(280 + Math.random() * 140),
      };

      setUploadedFile(scanResult);
      setActiveVectorId(assignedDisciplineId);

      if (assignedVerdict === 'CRITICAL_FRAUD' || assignedVerdict === 'SUSPICIOUS') {
        showToast(`AI FORENSIC SCAN COMPLETE: "${fileData.name}" identified as ${assignedVerdict} (${assignedRisk}% Risk). Report ready for Monitor escalation.`, 'rose');
      } else {
        showToast(`AI FORENSIC SCAN COMPLETE: "${fileData.name}" passed all biometric/arithmetic bounds. Clean original verified.`, 'success');
      }
    }, 850);
  };

  const handleNativeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // Immediately calculate client-side SHA-256 root hash using crypto.subtle.digest
    let calculatedSha = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      calculatedSha = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      calculatedSha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleProcessFileUpload({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream',
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        sha256: calculatedSha,
      });
    };
    reader.readAsDataURL(file);
  };

  // 1. Analyst dispatches report to Monitor Queue
  const handleSendReportToMonitor = () => {
    const fileToReport = uploadedFile || {
      name: activeDiscipline.assetTitle,
      vectorCode: activeDiscipline.code,
      riskScore: activeDiscipline.riskScore,
      failureHallmark: activeDiscipline.hallmarkDetail,
      sha256: activeDiscipline.sha256,
    };

    const newSub: AnalystSubmission = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      vectorCode: fileToReport.vectorCode,
      targetName: fileToReport.name,
      submittedBy: `${operatorName} (Analyst)`,
      timestamp: 'Just now',
      aiRiskScore: fileToReport.riskScore,
      analystVerdict: fileToReport.riskScore > 75 ? 'CONFIRM_FRAUD' : 'FLAG_SUSPICIOUS',
      confidenceScore: 0.98,
      notes: fileToReport.failureHallmark,
      qaStatus: 'PENDING_REVIEW',
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setLastEscalatedSub(newSub);
    showToast(`REPORT DISPATCHED: Case ${newSub.id} sent to Monitor Queue for supervisory QA review!`, 'warn');
  };

  // 2. Monitor verifies fraud and intimates Director
  const handleMonitorVerifyAndIntimateDirector = (sub: AnalystSubmission) => {
    const newIntimation: DirectorIntimation = {
      id: `INT-${Math.floor(100 + Math.random() * 900)}`,
      submissionId: sub.id,
      vectorCode: sub.vectorCode,
      fileName: sub.targetName,
      fileType: sub.vectorCode,
      riskScore: sub.aiRiskScore,
      analystName: sub.submittedBy,
      monitorName: `${operatorName} (Monitor)`,
      analystNotes: sub.notes,
      monitorNotes: 'Supervisory verification complete: Fraud signature confirmed. Escalated to Executive Director for clearance/quarantine order.',
      intimationTimestamp: 'Just now',
      status: 'PENDING_DIRECTOR',
      sha256: activeDiscipline.sha256,
    };

    setIntimations((prev) => [newIntimation, ...prev]);
    setLastIntimation(newIntimation);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, qaStatus: 'ESCALATED_TO_DIRECTOR' } : s))
    );
    showToast(`MONITOR VERIFIED: Intimation notice sent to Executive Director for case ${sub.id}!`, 'rose');
  };

  // 2b. Monitor clears mistake / false positive
  const handleMonitorClearMistake = (subId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, qaStatus: 'OVERRIDDEN' } : s))
    );
    showToast(`MISTAKE CLEARED: Monitor designated Case ${subId} as false positive. Released to core banking.`, 'success');
  };

  // 3a. Director clears mistake
  const handleDirectorClearMistake = (intimationId: string) => {
    setIntimations((prev) =>
      prev.map((item) =>
        item.id === intimationId ? { ...item, status: 'CLEARED_MISTAKE' } : item
      )
    );
    showToast(`MISTAKE CLEARED BY DIRECTOR: Case pardon issued. Transaction released to core banking ledger.`, 'success');
  };

  // 3b. Director authorizes permanent quarantine
  const handleDirectorAuthorizeQuarantine = (intimationId: string) => {
    setIntimations((prev) =>
      prev.map((item) =>
        item.id === intimationId ? { ...item, status: 'QUARANTINE_AUTHORIZED' } : item
      )
    );
    showToast(`QUARANTINE AUTHORIZED: Director confirmed permanent enclave freeze. Added ₹75 Lakhs to Capital Protected!`, 'rose');
  };

  // Director Action: Queue Rebalance
  const handleRebalanceQueues = () => {
    setIsRebalanceActive(true);
    setTimeout(() => {
      setIsRebalanceActive(false);
      showToast('WORKFORCE REBALANCED: 38 pending items redistributed across 4 active Analyst pods.', 'success');
    }, 1400);
  };

  // Director Action: Toggle Lockdown
  const handleToggleLockdown = () => {
    setIsGatewayLocked((prev) => !prev);
    setIsLockdownModalOpen(false);
    if (!isGatewayLocked) {
      showToast('EMERGENCY LOCKDOWN ACTIVATED: All gateway webhooks suspended. HSM enclave in zero-transit mode.', 'rose');
    } else {
      showToast('LOCKDOWN CLEARED: TrustGate multimodal API ingestion pipelines resumed.', 'success');
    }
  };

  // Director Action: Download Audit Certificate
  const handleDownloadCert = () => {
    const certData = {
      project: 'TrustGate: Multimodal AI Fraud Gateway',
      certificationStandard: 'RBI / SEBI FinTech Regulatory Compliance ISO 27001-A.12',
      authorizedBy: `${operatorName} (Executive Director)`,
      enclaveStatus: isGatewayLocked ? 'EMERGENCY_LOCKDOWN' : 'OPERATIONAL_NOMINAL',
      triBandThresholds: {
        autoPassCutoff: `${autoPassThreshold}%`,
        autoRejectCutoff: `${autoRejectThreshold}%`,
        manualReviewBand: `${autoPassThreshold}% - ${autoRejectThreshold}%`,
      },
      capitalProtectedTotal: '₹14,80,00,000 INR ($1.78M USD)',
      fipsHardwareEnclave: 'FIPS 140-3 Level 3 HSM Enclave Active',
      timestampUtc: new Date().toISOString(),
      activeThreatVectors: THREAT_DISCIPLINES.map((d) => ({
        code: d.code,
        title: d.title,
        hallmark: d.hallmarkDetail,
        sha256: d.sha256,
      })),
    };

    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGate_RBI_SEBI_Regulatory_Certificate_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('REGULATORY CERTIFICATE EXPORTED: Cryptographic JSON audit package downloaded.', 'success');
  };

  // Filtered Rejected Documents
  const filteredRejectedDocs =
    rejectionFilter === 'ALL'
      ? rejectedDocs
      : rejectedDocs.filter((doc) => doc.vectorCode === rejectionFilter);

  // Dynamic Theme Colors based on Role
  const roleColor =
    activeRole === 'ANALYST'
      ? {
          primary: 'cyan',
          accent: '#06b6d4',
          bgBadge: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
          activeTab: 'bg-cyan-500 text-slate-950 font-bold',
          borderAccent: 'border-cyan-500/40',
        }
      : activeRole === 'MONITOR'
      ? {
          primary: 'amber',
          accent: '#f59e0b',
          bgBadge: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          activeTab: 'bg-amber-500 text-slate-950 font-bold',
          borderAccent: 'border-amber-500/40',
        }
      : {
          primary: 'rose',
          accent: '#f43f5e',
          bgBadge: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          activeTab: 'bg-rose-500 text-slate-950 font-bold',
          borderAccent: 'border-rose-500/40',
        };

  // --------------------------------------------------------------------------
  // AUTHENTICATION GATE: SHOW LOGIN INTERFACE FIRST
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        defaultRole={activeRole}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const pendingMonitorCount = submissions.filter((s) => s.qaStatus === 'PENDING_REVIEW').length;
  const pendingDirectorCount = intimations.filter((i) => i.status === 'PENDING_DIRECTOR').length;

  return (
    <div
      className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#020704] via-[#051c0f] via-[#072c18] to-[#010402] text-slate-100'
          : 'bg-gradient-to-b from-[#ffffff] via-[#f0faf4] via-[#bcf0d0] to-[#10b981]/25 text-slate-900'
      }`}
    >
      {/* Background Ambient Silky Emerald Radiant Aura from image.png */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] bg-gradient-to-b from-[#10b981]/25 via-[#22c55e]/20 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#22c55e]/15 via-[#059669]/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* EMERGENCY LOCKDOWN BANNER (If Active) */}
      {isGatewayLocked && (
        <div className="bg-rose-600/90 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold tracking-wider uppercase border-b border-rose-400 animate-pulse sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 animate-spin" />
            <span>DIRECTOR OVERRIDE: GLOBAL GATEWAY LOCKDOWN IN FORCE · ALL WEBHOOK TRAFFIC IS QUARANTINED</span>
          </div>
          <button
            onClick={() => setIsLockdownModalOpen(true)}
            className="px-3 py-1 bg-white text-rose-950 rounded-full font-black hover:bg-slate-100 transition-colors cursor-pointer"
          >
            DISENGAGE LOCKDOWN
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. GLOBAL TOP HEADER & ROLE SWITCHER                                 */}
      {/* ==================================================================== */}
      <header className="border-b border-emerald-950/60 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-40 transition-colors">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-black border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  TrustGate<span className="text-emerald-400">.</span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  FIPS 140-3
                </span>
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                  Multimodal Fraud Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Autonomous Forensic Attribution &amp; Multi-Tier Enforcement
              </p>
            </div>
          </div>

          {/* Hardware Device Mockup with Green LEDs (from image.png) */}
          <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
              <span>&lt;</span>
              <span>&gt;</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">TrustGate One</span>
          </div>

          {/* GLOBAL EXECUTIVE HIERARCHY SWITCHER (3 Distinct Tiers with Live Notification Counts) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
            {/* TIER 1: ANALYST */}
            <button
              onClick={() => handleSwitchRole('ANALYST')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeRole === 'ANALYST'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Analyst</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeRole === 'ANALYST' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                Tier 1
              </span>
            </button>

            {/* TIER 2: MONITOR */}
            <button
              onClick={() => handleSwitchRole('MONITOR')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeRole === 'MONITOR'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Monitor</span>
              {pendingMonitorCount > 0 ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-amber-400 text-slate-950 animate-pulse">
                  {pendingMonitorCount} QA
                </span>
              ) : (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeRole === 'MONITOR' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  Tier 2
                </span>
              )}
            </button>

            {/* TIER 3: DIRECTOR */}
            <button
              onClick={() => handleSwitchRole('DIRECTOR')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeRole === 'DIRECTOR'
                  ? 'bg-rose-500 text-slate-950 font-black shadow-md shadow-rose-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Director</span>
              {pendingDirectorCount > 0 ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-rose-500 text-white animate-pulse">
                  {pendingDirectorCount} Intimations
                </span>
              ) : (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeRole === 'DIRECTOR' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  Command
                </span>
              )}
            </button>
          </div>

          {/* Operator Profile Badge */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Enclave: Active (99.98% Uptime)</span>
            </div>

            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                {operatorName.charAt(0)}
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold text-white block truncate max-w-[120px]">{operatorName}</span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{operatorEmail}</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleColor.bgBadge}`}>
                {activeRole}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            {/* Sign Out Action Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer font-semibold shadow-xs"
              title="Sign out and return to Login Interface"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* TIER HERO SUB-BANNER */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 px-4 lg:px-8 py-2.5">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center space-x-3">
            <span className={`font-black uppercase tracking-wider text-[11px] ${
              activeRole === 'ANALYST' ? 'text-cyan-400' : activeRole === 'MONITOR' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              Active Interface: {activeRole === 'ANALYST' ? 'Operational Vector Inspection' : activeRole === 'MONITOR' ? 'Supervisory Audit & QA' : 'Executive Command & Policy Deck'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {activeRole === 'ANALYST'
                ? 'Triage live suspect evidence across the 6 fraud disciplines'
                : activeRole === 'MONITOR'
                ? 'Audit analyst submissions, resolve disputes, review rejected documents'
                : 'Control tri-band policy thresholds, lockdown webhooks, and workforce dispatch'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span>Mode: <strong>RBAC Level {activeRole === 'ANALYST' ? '1' : activeRole === 'MONITOR' ? '2' : '3'}</strong></span>
            <span>•</span>
            <span className="text-emerald-400">HSM Attestation Verified ✓</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DYNAMIC ROLE CONTAINER (ANIMATED WITH ANIME.JS)                      */}
      {/* ==================================================================== */}
      <main ref={roleContainerRef} className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6 space-y-8">

        {/* ================================================================== */}
        {/* TIER 1: ANALYST INTERFACE                                          */}
        {/* ================================================================== */}
        {activeRole === 'ANALYST' && (
          <div className="space-y-6">
            {/* MULTIMODAL EVIDENCE INGESTION & LIVE AI FRAUD SCANNER */}
            <div className="stagger-card bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Background radiant emerald aura matching image.png */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Active Ingestion Enclave
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      Upload Document, Photo, or Voice File
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Multimodal Forensic Ingestion &amp; Automated Identification
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload any suspected evidence file. TrustGate will autonomously identify fraud anomalies and generate forensic reports for Monitor review.
                  </p>
                </div>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleNativeFileChange}
                  accept=".pdf,.docx,.csv,.xlsx,.jpg,.jpeg,.png,.webp,.wav,.mp3,.m4a,.json,.txt"
                  className="hidden"
                />

                {/* Upload Action Buttons Group (Document, Photo, Voice) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Upload Photo / ID</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Upload Voice Audio</span>
                  </button>
                </div>
              </div>

              {/* Interactive Drop Area Banner */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Drag &amp; drop or click to ingest any suspect file
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Supports PDF, PNG, JPG, WAV, MP3, CSV, DOCX · Instant multi-vector neural triage
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300/80">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">.PDF</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">.JPG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">.WAV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">.PNG</span>
                </div>
              </div>

              {/* Category Filter Pills & 1-Click Sample Test Buttons */}
              <div className="pt-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Quick-Test Sample Evidence Ingestion:</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Click any preset to simulate instant multimodal forensic analysis</span>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {(['ALL', 'DOCUMENT', 'PHOTO', 'VOICE'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setUploadCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        uploadCategory === cat
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat === 'ALL'
                        ? 'All Evidence'
                        : cat === 'DOCUMENT'
                        ? '📄 Documents'
                        : cat === 'PHOTO'
                        ? '📷 Photos & KYC'
                        : '🎙️ Voice Clones'}
                    </button>
                  ))}
                </div>

                {/* Filtered Sample Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {SAMPLE_UPLOAD_PRESETS.filter((preset) => {
                    if (uploadCategory === 'ALL') return true;
                    if (uploadCategory === 'DOCUMENT') return preset.type.includes('Document') || preset.type.includes('PDF') || preset.type.includes('CSV') || preset.type.includes('Ledger');
                    if (uploadCategory === 'PHOTO') return preset.type.includes('Photo') || preset.type.includes('JPG') || preset.type.includes('PNG');
                    if (uploadCategory === 'VOICE') return preset.type.includes('Voice') || preset.type.includes('WAV');
                    return true;
                  }).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        handleProcessFileUpload({
                          name: preset.name,
                          size: preset.size,
                          type: preset.type,
                          vectorCode: preset.vectorCode,
                          disciplineId: preset.disciplineId,
                          riskScore: preset.riskScore,
                          verdict: preset.verdict,
                          hallmark: preset.hallmark,
                          sha256: preset.sha256,
                        })
                      }
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer text-xs ${
                        uploadedFile?.name === preset.name
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-900">
                          {preset.vectorCode}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                            preset.verdict === 'CRITICAL_FRAUD'
                              ? 'bg-rose-500/20 text-rose-300'
                              : preset.verdict === 'SUSPICIOUS'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {preset.riskScore}%
                        </span>
                      </div>
                      <span className="font-bold block truncate text-[11px] text-white">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{preset.tagline}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanning Progress Bar */}
              {isUploading && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/50 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Evidence File Across 6 Multimodal Disciplines...</span>
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Uploaded File Analysis Result Card */}
              {uploadedFile && !isUploading && (
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center border font-bold text-xs ${
                          uploadedFile.verdict === 'CRITICAL_FRAUD'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            : uploadedFile.verdict === 'SUSPICIOUS'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        {uploadedFile.riskScore}%
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-300">{uploadedFile.name}</span>
                          <span className="text-[10px] text-slate-500">({uploadedFile.size})</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              uploadedFile.verdict === 'CRITICAL_FRAUD'
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : uploadedFile.verdict === 'SUSPICIOUS'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {uploadedFile.verdict === 'CRITICAL_FRAUD'
                              ? '⚠️ CRITICAL FRAUD IDENTIFIED'
                              : uploadedFile.verdict === 'SUSPICIOUS'
                              ? '⚡ SUSPICIOUS ARITHMETIC GAP'
                              : '✓ AUTHENTIC ORIGINAL VERIFIED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assigned Vector: <strong>{uploadedFile.vectorCode}</strong> · Cryptographic SHA-256 Digest:{' '}
                          <code className="text-cyan-300/80">{uploadedFile.sha256.slice(0, 20)}...</code>
                        </p>
                      </div>
                    </div>

                    {/* Report to Monitor & Picture Anomaly Inspection Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          setPictureInspectionModal({
                            isOpen: true,
                            fileName: uploadedFile.name,
                            imageSrc: uploadedFile.dataUrl,
                            riskScore: uploadedFile.riskScore,
                            isAuthentic: uploadedFile.verdict === 'AUTHENTIC',
                          })
                        }
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                      >
                        <Globe className="w-3.5 h-3.5 text-purple-200" />
                        <span>Inspect Picture Anomaly &amp; Web Match</span>
                      </button>

                      {uploadedFile.verdict !== 'AUTHENTIC' ? (
                        <button
                          onClick={handleSendReportToMonitor}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                        >
                          <Send className="w-3.5 h-3.5 fill-current" />
                          <span>Send Escalation Report to Monitor Queue (Level 2 QA) →</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleVerifyClean}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Verified Clean / Route to Ledger</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Failure Hallmark Summary */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start space-x-2.5">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        uploadedFile.verdict === 'CRITICAL_FRAUD'
                          ? 'text-rose-400'
                          : uploadedFile.verdict === 'SUSPICIOUS'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-white block">Forensic Anomaly Findings:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{uploadedFile.failureHallmark}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Dispatched Confirmation */}
              {lastEscalatedSub && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                          Report Transmitted to Monitor
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                          {lastEscalatedSub.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        "{lastEscalatedSub.targetName}" has been routed to the supervisory queue for examination.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                    Dispatched ✓
                  </span>
                </div>
              )}
            </div>

            {/* A. 6-Discipline Vector Selector Bar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Select Active Threat Vector (6 Fraud Disciplines)</span>
                </span>
                <span className="text-[11px] text-slate-400">Click any discipline card for live Anime.js spring transition</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {THREAT_DISCIPLINES.map((discipline) => {
                  const isActive = activeVectorId === discipline.id;
                  return (
                    <button
                      key={discipline.id}
                      onClick={(e) => handleSelectVector(discipline.id, e)}
                      className={`stagger-card p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isActive
                          ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                          {discipline.code}
                        </span>
                        <span className={`text-[10px] font-black ${discipline.riskScore > 85 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {discipline.riskScore}% Risk
                        </span>
                      </div>
                      <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {discipline.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                        {discipline.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Selector Tabs: Adaptive Auto-Triage vs Web Posture vs Multimodal Signal HUD */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary Inspection Stage:</span>
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  (Auto-triages media format &amp; executes only relevant forensic criteria suite)
                </span>
              </div>
              <div className="flex flex-wrap items-center space-x-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setAnalystStageMode('web_grounding')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    analystStageMode === 'web_grounding'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Web Grounding Audit</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/40 text-white font-mono font-black ml-0.5">
                    GOOGLE SEARCH
                  </span>
                </button>
                <button
                  onClick={() => setAnalystStageMode('adaptive_triage')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    analystStageMode === 'adaptive_triage'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Auto-Triage &amp; Targeted Criteria</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/40 text-white font-mono font-black ml-0.5">
                    AUTO
                  </span>
                </button>
                <button
                  onClick={() => setAnalystStageMode('web_posture')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    analystStageMode === 'web_posture'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md shadow-purple-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Photo Anomaly &amp; Web Match</span>
                </button>
                <button
                  onClick={() => setAnalystStageMode('telemetry')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    analystStageMode === 'telemetry'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Laser Viewport &amp; HUD</span>
                </button>
              </div>
            </div>

            {/* Primary Inspection Stage: Web Grounding Audit vs Adaptive Triage vs Photo Anomaly & Web Posture Audit vs Multimodal Center Stage */}
            {analystStageMode === 'web_grounding' ? (
              <WebGroundingAuditSection
                activeFileName={uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle}
                activeVectorCode={uploadedFile ? uploadedFile.vectorCode : activeDiscipline.code}
                activeRiskScore={uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore}
                filePreviewUrl={uploadedFile?.dataUrl}
                onIntimateSupervisor={(summary) => {
                  handleAdaptiveEscalate({
                    targetName: uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle,
                    vectorCode: uploadedFile ? uploadedFile.vectorCode : activeDiscipline.code,
                    riskScore: uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore,
                    verdict: 'CONFIRM_FRAUD',
                    notes: summary,
                    auditResponse: { confidence_percentage: 98 } as any,
                  });
                }}
                onShowToast={showToast}
              />
            ) : analystStageMode === 'adaptive_triage' ? (
              <AdaptiveTriageWorkbench
                onEscalateToMonitor={handleAdaptiveEscalate}
                onShowToast={showToast}
                initialFileData={
                  uploadedFile
                    ? {
                        name: uploadedFile.name,
                        dataUrl: uploadedFile.dataUrl,
                        type: uploadedFile.type,
                      }
                    : null
                }
              />
            ) : analystStageMode === 'web_posture' ? (
              <div className="space-y-4">
                <PictureAnomalyAndWebPostureViewer
                  fileName={uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle}
                  imageSrc={uploadedFile?.dataUrl}
                  riskScore={uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore}
                  isAuthentic={uploadedFile ? uploadedFile.verdict === 'AUTHENTIC' : activeDiscipline.rawVerdict === 'AUTHENTIC'}
                  onSendToMonitor={handleOpenEscalation}
                  showEscalateButton={true}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* B. Multimodal Inspection Stage (60% / 7 cols) */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  {/* Viewport Top Header - Displays Active Recent File Submitted */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span>{uploadedFile ? uploadedFile.vectorCode : activeDiscipline.code} Active Asset</span>
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                            (uploadedFile?.verdict || activeDiscipline.rawVerdict) === 'CRITICAL_FRAUD'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : (uploadedFile?.verdict || activeDiscipline.rawVerdict) === 'SUSPICIOUS'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {uploadedFile ? `${uploadedFile.verdict} (${uploadedFile.riskScore}% RISK)` : activeDiscipline.rawVerdict}
                        </span>
                        {uploadedFile && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            RECENTLY SUBMITTED EVIDENCE
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-black text-white mt-0.5 truncate max-w-xl">
                        {uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {uploadedFile
                          ? `${uploadedFile.type} (${uploadedFile.size}) · Dynamic Autonomous Detective Triage · SHA-256: ${uploadedFile.sha256.slice(0, 20)}...`
                          : activeDiscipline.assetSubtitle}
                      </p>
                    </div>

                    {/* Viewport Controls */}
                    <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setInspectionMode('source')}
                        className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                          inspectionMode === 'source' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Original
                      </button>
                      <button
                        onClick={() => setInspectionMode('ela')}
                        className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                          inspectionMode === 'ela' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ELA Residual
                      </button>
                      <button
                        onClick={() => setInspectionMode('composite')}
                        className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                          inspectionMode === 'composite' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Composite
                      </button>
                      <button
                        onClick={() =>
                          setPictureInspectionModal({
                            isOpen: true,
                            fileName: uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle,
                            imageSrc: uploadedFile?.dataUrl,
                            riskScore: uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore,
                            isAuthentic: uploadedFile ? uploadedFile.verdict === 'AUTHENTIC' : activeDiscipline.rawVerdict === 'AUTHENTIC',
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 font-bold border border-purple-500/30 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Open Dual Deck Internet Posture & Anomaly Inspector"
                      >
                        <Globe className="w-3 h-3 text-purple-400" />
                        <span>Web Match</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Asset Canvas Viewport with Laser Scanner */}
                  <div className="relative mt-4 h-[380px] bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center group select-none">
                    {/* Grid Mesh Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

                    {/* Laser Scanner Line (Animated via Anime.js) */}
                    {isLaserScanning && (
                      <div
                        ref={laserScannerRef}
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] z-20 pointer-events-none"
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-cyan-400/20 blur-sm rounded-full" />
                      </div>
                    )}

                    {/* Asset Render based on uploaded file or active discipline */}
                    <div className="relative z-10 w-full max-w-md p-6 flex flex-col items-center text-center space-y-3">
                      {uploadedFile?.dataUrl ? (
                        <div className="relative max-h-[300px] max-w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center bg-slate-900/80 p-2">
                          <img
                            src={uploadedFile.dataUrl}
                            alt={uploadedFile.name}
                            className="max-h-[275px] w-auto object-contain rounded-xl shadow-lg"
                          />
                          {inspectionMode === 'ela' && (
                            <div className="absolute inset-0 bg-rose-500/30 mix-blend-color-dodge pointer-events-none rounded-xl" />
                          )}
                        </div>
                      ) : activeDiscipline.assetType === 'document' ? (
                        <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-left font-mono text-[11px] shadow-2xl relative">
                          <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between text-slate-400">
                            <span>HDFC BANK LTD · STATEMENT OF ACCOUNT</span>
                            <span className="text-cyan-400">OCT 2026</span>
                          </div>
                          <div className="space-y-1.5 text-slate-300">
                            <div className="flex justify-between">
                              <span>OPENING BALANCE (01-OCT):</span>
                              <span>₹2,10,000.00</span>
                            </div>
                            <div className="flex justify-between p-1 bg-rose-500/10 border border-rose-500/40 rounded text-rose-300">
                              <span>ALTERED INWARD CREDIT #04:</span>
                              <span className="font-bold">₹8,50,000.00 [FORGED]</span>
                            </div>
                            <div className="flex justify-between">
                              <span>WITHDRAWALS / DEBIT:</span>
                              <span>-₹2,20,000.00</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
                              <span>STATED CLOSING SUM:</span>
                              <span>₹14,20,000.00</span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {activeDiscipline.assetType === 'audio' && (
                        <div className="w-full space-y-3">
                          <div className="h-28 flex items-center justify-center space-x-1.5 px-4 bg-slate-900/60 rounded-xl border border-slate-800">
                            {[42, 68, 92, 74, 88, 98, 82, 65, 48, 92, 85, 40, 78, 94, 60, 45, 90, 84, 52, 70].map((h, i) => (
                              <div
                                key={i}
                                className={`w-2.5 rounded-full transition-all ${
                                  i > 10 && i < 16 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-cyan-500/80'
                                }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center justify-center space-x-2">
                            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>8.2 kHz Low-Pass Vocoder Phase Cutoff Discovered</span>
                          </div>
                        </div>
                      )}

                      {activeDiscipline.assetType === 'identity' && (
                        <div className="relative w-48 h-56 bg-slate-900 rounded-2xl border border-slate-700/80 overflow-hidden flex flex-col items-center justify-center p-3 shadow-2xl">
                          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-rose-500/60 flex items-center justify-center relative">
                            <User className="w-12 h-12 text-slate-400" />
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
                          </div>
                          <span className="text-xs font-bold text-white mt-3">SYNTHETIC IDENTITY</span>
                          <span className="text-[10px] text-rose-400">Diffusion Boundary Inpainting</span>
                        </div>
                      )}

                      {(activeDiscipline.assetType === 'ledger' || activeDiscipline.assetType === 'pretext' || activeDiscipline.assetType === 'graph') && (
                        <div className="w-full bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-left font-mono text-xs text-slate-300 space-y-2">
                          <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{activeDiscipline.tagline}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {activeDiscipline.hallmarkDetail}
                          </p>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-rose-300 font-bold">
                            Anomaly Flag: {activeDiscipline.anomalyCoordinates.label}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pulsing Red Anomaly Reticle (Anime.js Target) */}
                    <div
                      ref={reticleRef}
                      className="absolute z-30 pointer-events-none flex flex-col items-center"
                      style={{
                        left: `${activeDiscipline.anomalyCoordinates.x}%`,
                        top: `${activeDiscipline.anomalyCoordinates.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
                        <div className="w-6 h-6 rounded-full border-2 border-rose-400 bg-rose-500/20 shadow-[0_0_12px_#f43f5e] flex items-center justify-center absolute">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <span className="mt-2 px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 text-[10px] font-black border border-rose-700 shadow-md whitespace-nowrap">
                        {activeDiscipline.anomalyCoordinates.label}
                      </span>
                    </div>

                    {/* Toggle Laser Button */}
                    <button
                      onClick={() => setIsLaserScanning((prev) => !prev)}
                      className="absolute bottom-3 right-3 z-30 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLaserScanning ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>Laser: {isLaserScanning ? 'Active' : 'Paused'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* C. Forensic Telemetry HUD (40% / 5 cols) */}
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Forensic Telemetry HUD</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">RFC 8785 ATTESTED</span>
                  </div>

                  {/* Dual Animated Tickers: Risk Gauge & Inference Latency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Threat Probability
                      </span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span ref={riskCounterRef} className="text-3xl font-black text-rose-400 tracking-tight">
                          {activeDiscipline.riskScore}%
                        </span>
                        <span className="text-xs font-bold text-rose-500">CRITICAL</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-500"
                          style={{ width: `${activeDiscipline.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Inference Latency
                      </span>
                      <div className="flex items-baseline space-x-2 my-1">
                        <span ref={latencyCounterRef} className="text-3xl font-black text-cyan-400 tracking-tight">
                          {activeDiscipline.latencyMs}ms
                        </span>
                        <span className="text-xs font-bold text-emerald-400">P95</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Hardware Accel: Kyber-1024</span>
                    </div>
                  </div>

                  {/* Detailed Hallmark Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Forensic Attributions:
                    </span>
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {activeDiscipline.hallmarkDetail}
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Stamp */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>SHA-256 Attestation Digest:</span>
                      <button
                        onClick={() => {
                          const sha = uploadedFile ? uploadedFile.sha256 : activeDiscipline.sha256;
                          navigator.clipboard.writeText(sha);
                          showToast('COPIED SHA-256 DIGEST TO CLIPBOARD');
                        }}
                        className="hover:text-cyan-400 flex items-center space-x-1 cursor-pointer font-bold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-cyan-300/80 break-all leading-tight">
                      {uploadedFile ? uploadedFile.sha256 : activeDiscipline.sha256}
                    </p>
                  </div>

                  {/* AUTONOMOUS DETECTIVE: WEB GROUNDING & REVERSE SEARCH CARD */}
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Internet Provenance &amp; Web Match</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        97.4% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Reverse web search discovered identical posture &amp; collar gradient on Unsplash (Source #UNS-8910). Perpetrator spliced synthetic face on public internet photo.
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                        Query: "corporate executive crossed-arms suit portrait"
                      </span>
                      <button
                        onClick={() =>
                          setPictureInspectionModal({
                            isOpen: true,
                            fileName: uploadedFile ? uploadedFile.name : activeDiscipline.assetTitle,
                            imageSrc: uploadedFile?.dataUrl,
                            riskScore: uploadedFile ? uploadedFile.riskScore : activeDiscipline.riskScore,
                            isAuthentic: uploadedFile ? uploadedFile.verdict === 'AUTHENTIC' : activeDiscipline.rawVerdict === 'AUTHENTIC',
                          })
                        }
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                      >
                        Inspect Dual Deck →
                      </button>
                    </div>
                  </div>

                  {/* AUTONOMOUS DETECTIVE: METADATA & SOFTWARE FOOTPRINT */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Autonomous Provenance Footprint:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">TOOL SIGNATURE:</span>
                        <span className="text-rose-400 font-bold">Adobe Photoshop CC / Canva</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">C2PA PROVENANCE:</span>
                        <span className="text-amber-400 font-bold">TAMPERED / STRIPPED</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">CHRONOLOGY:</span>
                        <span className="text-rose-400 font-bold">Inverted (-14 Days)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block">DYNAMIC SCORE:</span>
                        <span className="text-cyan-400 font-bold">+50 Pose, +30 Kerning</span>
                      </div>
                    </div>
                  </div>

                  {/* ANALYST DECISION ACTION BAR */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleVerifyClean}
                      className="w-full sm:w-1/2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verify as Clean / Original</span>
                    </button>

                    <button
                      onClick={handleOpenEscalation}
                      className="w-full sm:w-1/2 px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                    >
                      <Send className="w-4 h-4 fill-current" />
                      <span>Submit Escalation Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* ================================================================== */}
        {/* TIER 2: MONITOR INTERFACE (SUPERVISORY AUDIT & QA)                 */}
        {/* ================================================================== */}
        {activeRole === 'MONITOR' && (
          <div className="space-y-6">
            {/* Team Performance Scorecard Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stagger-card p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cases Cleared / Hour</span>
                <span className="text-3xl font-black text-amber-400 block mt-1">42.6</span>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">+12% vs Pod Baseline</span>
              </div>

              <div className="stagger-card p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Disagreement Rate</span>
                <span className="text-3xl font-black text-white block mt-1">4.2%</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Threshold &lt; 5.0% Standard</span>
              </div>

              <div className="stagger-card p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Review Latency</span>
                <span className="text-3xl font-black text-amber-400 block mt-1">1.8 mins</span>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">SLA Target &lt; 3.0 mins</span>
              </div>

              <div className="stagger-card p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Audit QA Index</span>
                <span className="text-3xl font-black text-emerald-400 block mt-1">98.4%</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">FIPS Attested Quality</span>
              </div>
            </div>

            {/* If an Analyst has escalated a new case or lastEscalatedSub exists, showcase the Spotlight Banner */}
            {lastEscalatedSub && lastEscalatedSub.qaStatus === 'PENDING_REVIEW' && (
              <div className="stagger-card p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        ⚡ Action Required: Incoming Escalation from Analyst
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-amber-200 border border-amber-500/40">
                        {lastEscalatedSub.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Target: <strong className="text-white">{lastEscalatedSub.targetName}</strong> ({lastEscalatedSub.vectorCode}) · Analyst reported {lastEscalatedSub.aiRiskScore}% risk. Verify fraud and intimate Director, or clear mistake.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() =>
                      setPictureInspectionModal({
                        isOpen: true,
                        fileName: lastEscalatedSub.targetName,
                        riskScore: lastEscalatedSub.aiRiskScore,
                        imageSrc: uploadedFile?.name === lastEscalatedSub.targetName ? uploadedFile.dataUrl : undefined,
                      })
                    }
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95 shadow-md shadow-purple-600/20"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-200" />
                    <span>Inspect Anomaly &amp; Web Posture</span>
                  </button>
                  <button
                    onClick={() => handleMonitorVerifyAndIntimateDirector(lastEscalatedSub)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Send Report to Director →</span>
                  </button>
                  <button
                    onClick={() => handleMonitorClearMistake(lastEscalatedSub.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                  >
                    <span>Clear Mistake (Pass)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation when Report is Dispatched to Director */}
            {lastIntimation && (
              <div className="stagger-card p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-lg animate-in fade-in duration-300">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        Report Sent to Director
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-700">
                        {lastIntimation.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Supervisor examination complete for "{lastIntimation.fileName}". Audit report submitted to Executive Director desk.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                  Reported ✓
                </span>
              </div>
            )}

            {/* Submissions & QA Audit Table */}
            <div className="stagger-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Analyst Escalations & QA Review Table</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Side-by-side verification: Raw AI model prediction vs. Analyst human findings.
                  </p>
                </div>

                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {submissions.filter((s) => s.qaStatus === 'PENDING_REVIEW').length} Pending Supervisor Actions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">Case ID</th>
                      <th className="pb-3 px-3">Target Evidence</th>
                      <th className="pb-3 px-3">Analyst / Time</th>
                      <th className="pb-3 px-3">Raw AI vs Analyst Verdict</th>
                      <th className="pb-3 px-3">Forensic Notes</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Supervisor Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-amber-300">{sub.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{sub.targetName}</span>
                          <span className="text-[10px] text-slate-400">{sub.vectorCode}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-white block">{sub.submittedBy}</span>
                          <span className="text-[10px] text-slate-500">{sub.timestamp}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-rose-400 font-bold">AI: {sub.aiRiskScore}%</span>
                            <span className="text-slate-600">→</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-bold border border-rose-500/30 text-[10px]">
                              {sub.analystVerdict}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs text-slate-300 leading-snug truncate" title={sub.notes}>
                          {sub.notes}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              sub.qaStatus === 'PENDING_REVIEW'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                : sub.qaStatus === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : sub.qaStatus === 'OVERRIDDEN'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {sub.qaStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sub.qaStatus === 'PENDING_REVIEW' ? (
                            <div className="inline-flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  setPictureInspectionModal({
                                    isOpen: true,
                                    fileName: sub.targetName,
                                    riskScore: sub.aiRiskScore,
                                    imageSrc: uploadedFile?.name === sub.targetName ? uploadedFile.dataUrl : undefined,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold transition-all cursor-pointer text-xs flex items-center space-x-1 border border-slate-700"
                                title="Inspect where anomalies were discovered and review internet web posture match"
                              >
                                <Globe className="w-3 h-3 text-cyan-400" />
                                <span>Inspect Web Match</span>
                              </button>
                              <button
                                onClick={() => handleMonitorVerifyAndIntimateDirector(sub)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold transition-all cursor-pointer text-xs shadow-md shadow-rose-600/30 flex items-center space-x-1"
                                title="Examine evidence and submit report to Executive Director"
                              >
                                <span>Send Report to Director →</span>
                              </button>
                              <button
                                onClick={() => handleMonitorClearMistake(sub.id)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer text-xs flex items-center space-x-1"
                                title="Clear false positive / operator mistake and release to banking"
                              >
                                <span>Clear Mistake (Override Pass)</span>
                              </button>
                            </div>
                          ) : sub.qaStatus === 'ESCALATED_TO_DIRECTOR' ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-extrabold text-[10px]">
                              Reported to Director ✓
                            </span>
                          ) : sub.qaStatus === 'OVERRIDDEN' ? (
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px]">
                              Mistake Cleared (Passed) ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold">Action Logged ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* The "Rejected Documents & Tests Vault" */}
            <div className="stagger-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <FileX className="w-4 h-4 text-rose-400" />
                    <span>The &ldquo;Rejected Documents &amp; Tests Vault&rdquo;</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive ledger of failed items across the 6 disciplines with exact threshold deltas.
                  </p>
                </div>

                {/* Filterable Bar by 6 Disciplines */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs overflow-x-auto">
                  {['ALL', 'VEC-01', 'VEC-02', 'VEC-03', 'VEC-04', 'VEC-06'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setRejectionFilter(code)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px] ${
                        rejectionFilter === code ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">Document Fingerprint</th>
                      <th className="pb-3 px-3">Vector</th>
                      <th className="pb-3 px-3">Rejected Timestamp</th>
                      <th className="pb-3 px-3">Specific Failure Reason</th>
                      <th className="pb-3 px-3">Threshold Delta</th>
                      <th className="pb-3 px-3">Vault Status</th>
                      <th className="pb-3 px-3 text-right">Supervisory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRejectedDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{doc.fileName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{doc.shaFingerprint}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] font-bold">
                            {doc.vectorCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{doc.rejectedAt}</td>
                        <td className="py-3 px-3 text-rose-300 font-medium">{doc.failureReason}</td>
                        <td className="py-3 px-3 text-amber-400 font-bold">{doc.thresholdDelta}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              doc.status === 'QUARANTINED'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleVaultStatus(doc.id)}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
                          >
                            {doc.status === 'QUARANTINED' ? 'Force Override' : 'Re-Quarantine'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TIER 3: DIRECTOR INTERFACE (EXECUTIVE COMMAND & POLICY)             */}
        {/* ================================================================== */}
        {activeRole === 'DIRECTOR' && (
          <div className="space-y-6">
            {/* EXECUTIVE INTIMATIONS & MISTAKE CLEARANCE DESK (DIRECTOR COMMAND) */}
            <div className="stagger-card bg-slate-900/95 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Tier 3 Executive Command
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Intimations from Level 2 Monitors
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-1">
                    Executive Intimations &amp; Case Clearance Desk
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review escalated fraud intimations submitted by Monitors. Issue executive clearance to resolve mistakes / false alarms, or authorize permanent enclave quarantine.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/30">
                    {intimations.filter((i) => i.status === 'PENDING_DIRECTOR').length} Awaiting Executive Command
                  </span>
                </div>
              </div>

              {/* Intimations List */}
              <div className="space-y-3">
                {intimations.map((intimation) => (
                  <div
                    key={intimation.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      intimation.status === 'PENDING_DIRECTOR'
                        ? 'bg-slate-950/90 border-rose-500/40 shadow-lg'
                        : intimation.status === 'CLEARED_MISTAKE'
                        ? 'bg-slate-950/60 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-rose-400">{intimation.id}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs font-bold text-white">{intimation.fileName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold">
                            {intimation.vectorCode}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                            {intimation.riskScore}% AI Risk
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                          <span>Origin: <strong>{intimation.analystName}</strong></span>
                          <span>•</span>
                          <span>Verified by: <strong className="text-amber-400">{intimation.monitorName}</strong></span>
                          <span>•</span>
                          <span>Received: {intimation.intimationTimestamp}</span>
                        </div>
                      </div>

                      {/* Status & Executive Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            setPictureInspectionModal({
                              isOpen: true,
                              fileName: intimation.fileName,
                              riskScore: intimation.riskScore,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
                          title="Inspect where anomalies were discovered and review internet posture matches"
                        >
                          <Globe className="w-3.5 h-3.5 text-purple-200" />
                          <span>Inspect Web Posture Evidence</span>
                        </button>

                        {intimation.status === 'PENDING_DIRECTOR' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDirectorClearMistake(intimation.id)}
                              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
                              title="Clear mistake, dismiss false positive, and release transaction"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                              <span>Clear Mistake (Grant Pardon)</span>
                            </button>
                            <button
                              onClick={() => handleDirectorAuthorizeQuarantine(intimation.id)}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
                              title="Authorize permanent enclave quarantine and sanction"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Authorize Permanent Quarantine</span>
                            </button>
                          </div>
                        ) : intimation.status === 'CLEARED_MISTAKE' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Mistake Cleared · Pardon Granted · Released to Core Banking</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black flex items-center space-x-1.5">
                            <Lock className="w-4 h-4 text-rose-400" />
                            <span>Permanent Enclave Quarantine Authorized ✓</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Forensic Lineage Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          1. Analyst Findings ({intimation.analystName}):
                        </span>
                        <p className="text-slate-300 leading-snug">{intimation.analystNotes}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                          2. Supervisor Audit Verification ({intimation.monitorName}):
                        </span>
                        <p className="text-slate-300 leading-snug">{intimation.monitorNotes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Exposure & Capital Protected KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stagger-card p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Capital Protected
                </span>
                <span className="text-3xl font-black text-rose-400 block mt-1 tracking-tight">
                  ₹14.8 Crores
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                  $1.78M USD Autonomous Shield
                </span>
              </div>

              <div className="stagger-card p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Fraud Velocity
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-3xl font-black text-white">+18%</span>
                  <span className="text-xs font-bold text-rose-400">SPIKE</span>
                </div>
                <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                  Synthetic KYC &amp; Ghost IDs Surging
                </span>
              </div>

              <div className="stagger-card p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enclave Attested Uptime
                </span>
                <span className="text-3xl font-black text-emerald-400 block mt-1">99.98%</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                  FIPS 140-3 Hardware Level 3
                </span>
              </div>

              <div className="stagger-card p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Blocked Infiltrations
                </span>
                <span className="text-3xl font-black text-rose-400 block mt-1">14,289</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                  Zero False-Negatives Logged
                </span>
              </div>
            </div>

            {/* Vector Attack Distribution Bar */}
            <div className="stagger-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">6-Discipline Attack Volume Distribution</h3>
                  <p className="text-xs text-slate-400">Real-time incident concentration across active threat vectors.</p>
                </div>
                <span className="text-xs font-mono text-cyan-400">Total Samples: 42,910</span>
              </div>

              {/* Segmented Distribution Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                <div style={{ width: '31%' }} className="bg-rose-500" title="VEC-02 Synthetic KYC (31%)" />
                <div style={{ width: '24%' }} className="bg-cyan-500" title="VEC-03 Document Tampering (24%)" />
                <div style={{ width: '18%' }} className="bg-purple-500" title="VEC-01 Voice Clones (18%)" />
                <div style={{ width: '14%' }} className="bg-amber-500" title="VEC-04 Financial Ledger (14%)" />
                <div style={{ width: '8%' }} className="bg-emerald-500" title="VEC-05 AI Pretexting (8%)" />
                <div style={{ width: '5%' }} className="bg-blue-500" title="VEC-06 Wash Trading (5%)" />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span>KYC (31%)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /><span>Tampering (24%)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span>Voice (18%)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Ledger (14%)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Pretexting (8%)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span>Wash Trading (5%)</span></span>
              </div>
            </div>

            {/* Live Tri-Band Policy Sliders & Command Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Tri-Band Policy Slider Console (7 cols) */}
              <div className="lg:col-span-7 stagger-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-rose-400" />
                      <span>Live Tri-Band Policy Threshold Controller</span>
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">ENGINE ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly control automated release vs manual operator escalation cutoffs in real time.
                  </p>
                </div>

                {/* Visual Tri-Band Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400">AUTO-PASS: &lt; {autoPassThreshold}%</span>
                    <span className="text-amber-400">OPERATOR TRIAGE: {autoPassThreshold}% - {autoRejectThreshold}%</span>
                    <span className="text-rose-400">AUTO-REJECT: &gt; {autoRejectThreshold}%</span>
                  </div>

                  <div className="w-full h-5 rounded-xl overflow-hidden flex bg-slate-950 p-1 border border-slate-800">
                    <div
                      style={{ width: `${autoPassThreshold}%` }}
                      className="bg-emerald-500/80 h-full rounded-l-lg transition-all"
                    />
                    <div
                      style={{ width: `${autoRejectThreshold - autoPassThreshold}%` }}
                      className="bg-amber-500/80 h-full transition-all"
                    />
                    <div
                      style={{ width: `${100 - autoRejectThreshold}%` }}
                      className="bg-rose-500/80 h-full rounded-r-lg transition-all"
                    />
                  </div>
                </div>

                {/* Interactive Sliders */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300">Auto-Pass Cutoff (Clean Release Threshold):</span>
                      <span className="font-mono font-bold text-emerald-400">{autoPassThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={autoPassThreshold}
                      onChange={(e) => setAutoPassThreshold(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Documents with risk under {autoPassThreshold}% automatically route to core banking.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300">Auto-Reject Cutoff (Quarantine Threshold):</span>
                      <span className="font-mono font-bold text-rose-400">{autoRejectThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      value={autoRejectThreshold}
                      onChange={(e) => setAutoRejectThreshold(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Payloads with risk over {autoRejectThreshold}% are instantly quarantined in HSM sandbox.
                    </span>
                  </div>
                </div>
              </div>

              {/* Command Actions & Emergency Controls (5 cols) */}
              <div className="lg:col-span-5 stagger-card bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Executive Command &amp; Controls</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Binding directives transmitted across all Analyst &amp; Monitor stations.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Rebalance Case Queues */}
                  <button
                    onClick={handleRebalanceQueues}
                    disabled={isRebalanceActive}
                    className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-white group-hover:text-amber-300">
                          {isRebalanceActive ? 'Rebalancing Queue Algorithms...' : 'Rebalance Case Queues'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      Redistribute unassigned queue items across active Level 1 Analyst stations.
                    </p>
                  </button>

                  {/* Regulatory Audit Certificate Export */}
                  <button
                    onClick={handleDownloadCert}
                    className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-white group-hover:text-emerald-300">
                          Export Regulatory Audit Certificate
                        </span>
                      </div>
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      Generate signed tamper-proof JSON/PDF package for RBI &amp; SEBI inspection.
                    </p>
                  </button>

                  {/* Global Gateway Lockdown Button */}
                  <button
                    onClick={() => setIsLockdownModalOpen(true)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isGatewayLocked
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-900/60 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span className="font-black text-xs">
                          {isGatewayLocked ? 'DISENGAGE EMERGENCY LOCKDOWN' : 'TRIGGER GLOBAL GATEWAY LOCKDOWN'}
                        </span>
                      </div>
                      <Lock className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      {isGatewayLocked
                        ? 'Click to lift freeze and resume normal API routing.'
                        : 'Freezes all inbound API webhooks and halts core banking dispatches immediately.'}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODALS & OVERLAYS                                                    */}
      {/* ==================================================================== */}

      {/* MODAL 1: SUBMIT ESCALATION REPORT (Analyst Tier) */}
      {isEscalationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl shadow-cyan-950/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Submit Escalation Report to Monitor</h3>
              </div>
              <button
                onClick={() => setIsEscalationModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEscalation} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block">Target Asset:</span>
                <span className="font-bold text-white block">{activeDiscipline.assetTitle}</span>
                <span className="text-cyan-400 font-mono text-[11px]">{activeDiscipline.code} · Risk Score: {activeDiscipline.riskScore}%</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Analyst Technical Observations:</label>
                <textarea
                  rows={4}
                  required
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Detail exact findings, DCT quantization anomalies, or math deltas..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEscalationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Confirm &amp; Push to Monitor Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM LOCKDOWN (Director Tier) */}
      {isLockdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-600 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-rose-950/50">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
              <div>
                <h3 className="text-base font-black text-white">
                  {isGatewayLocked ? 'Disengage Gateway Lockdown' : 'CONFIRM EXECUTIVE GATEWAY LOCKDOWN'}
                </h3>
                <span className="text-xs text-rose-400 font-bold">EXECUTIVE DIRECTOR LEVEL 3 PRIVILEGE</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isGatewayLocked
                ? 'Lifting the freeze will restore inbound API webhooks and permit verified transaction releases to core banking.'
                : 'Activating lockdown will immediately freeze all inbound webhooks, place active queue batches into HSM quarantine, and sound audio-visual alerts across operational stations.'}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsLockdownModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleLockdown}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {isGatewayLocked ? 'Disengage Lockdown' : 'ACTIVATE GLOBAL LOCKDOWN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PICTURE ANOMALY PINPOINT & WEB POSTURE PROVENANCE AUDIT */}
      {pictureInspectionModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Picture Anomaly &amp; Internet Posture Provenance Audit
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pictureInspectionModal.fileName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPictureInspectionModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Close ✕
              </button>
            </div>

            <PictureAnomalyAndWebPostureViewer
              fileName={pictureInspectionModal.fileName}
              imageSrc={pictureInspectionModal.imageSrc}
              riskScore={pictureInspectionModal.riskScore}
              isAuthentic={pictureInspectionModal.isAuthentic}
            />
          </div>
        </div>
      )}

      {/* 3 SIGNATURE TIER SUMMARY CARDS (Matching image.png: 10 kWh, 5 kWh, 0 kWh) */}
      <footer className="max-w-[1800px] mx-auto px-4 lg:px-8 py-10 border-t border-emerald-950/60 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 10 kWh · Daylight Mint */}
          <div
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDark ? 'bg-[#0a1c12]/80 border-emerald-900/60 text-slate-300' : 'bg-white/90 border-emerald-200 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-emerald-400 mb-3">
              <Zap className="w-5 h-5 text-[#10b981]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#10b981]">10 kWh · ELA ENGINE</span>
            </div>
            <h4 className={`text-xl font-black mb-1.5 ${isDark ? 'text-white' : 'text-[#021a0f]'}`}>
              Catching tampering is easy.
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discrete cosine transform noise residuals isolate altered currency amounts, modified stamps, and font raster discrepancies without manual tuning.
            </p>
          </div>

          {/* Card 2: 5 kWh · Twilight Dusk Teal */}
          <div
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDark ? 'bg-gradient-to-b from-[#142938] via-[#10202e] to-[#0c1822] text-white border-slate-700/80 shadow-xl' : 'bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] text-slate-900 border-sky-300'
            }`}
          >
            <div className="flex items-center space-x-2 text-cyan-300 mb-3">
              <Battery className="w-5 h-5 text-cyan-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">5 kWh · ARITHMETIC</span>
            </div>
            <h4 className="text-xl font-black mb-1.5">
              Using it smartly?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Autonomous cross-audits verify gross pay minus deductions against stated net sums. Any variance delta triggers immediate automated review.
            </p>
          </div>

          {/* Card 3: 0 kWh · Obsidian Enclave */}
          <div
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDark ? 'bg-[#040806] border-slate-800 text-slate-400 shadow-xl' : 'bg-slate-900 text-slate-300 border-slate-800 shadow-xl'
            }`}
          >
            <div className="flex items-center space-x-2 text-slate-500 mb-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">0 kWh · ENCLAVE</span>
            </div>
            <h4 className="text-xl font-black mb-1.5 text-white">
              Not so much.
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              TrustGate stays awake instead. It watches inbound streams all day, quarantines fraudulent webhooks, and intimates supervisors for clearance.
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION NOTIFICATION TOAST */}
      {actionNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-3 border ${
              actionNotification.type === 'rose'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500'
                : actionNotification.type === 'warn'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="max-w-md">{actionNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
