import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  SlidersHorizontal,
  ChevronRight,
  Play,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Layers,
  Activity,
  Cpu,
  Download,
  CheckCircle,
  FileCode,
  Radio,
  FileSpreadsheet,
  Rotate3d,
  Sun,
  Moon,
  Columns,
  Maximize2,
  RefreshCw,
  LogOut,
  KeyRound,
  FileText,
} from 'lucide-react';
import { PresetScenario, HistoricalScan, ForensicHallmark } from '../types/forensic';
import { OperatorRole } from '../hooks/useFirebaseAuth';
import { DualViewCanvas } from './DualViewCanvas';
import { ForensicHallmarksDrawer } from './ForensicHallmarksDrawer';
import { HistoricalScansTable } from './HistoricalScansTable';
import { LatencyThroughputChart } from './LatencyThroughputChart';
import { VectorRadarChart } from './VectorRadarChart';
import { AudioSpectrogramViewer } from './AudioSpectrogramViewer';
import { TransactionGraphViewer } from './TransactionGraphViewer';

export type InterfaceTab = 'inspect' | 'audit' | 'stream' | 'enclave';

interface MobileForensicInterfaceProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activePreset: PresetScenario;
  presets: PresetScenario[];
  onSelectPreset: (id: string) => void;
  selectedHallmarkId: string | null;
  onSelectHallmark: (id: string | null) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
  onUploadCustomFile: (file: File) => void;
  onQuarantine: () => void;
  onPassToCoreBanking: () => void;
  onDownloadCertificate: () => void;
  isQuarantined: boolean;
  historicalScans: HistoricalScan[];
  onSelectHistoricalScan: (scan: HistoricalScan) => void;
  currentUser: any;
  userRole: OperatorRole;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
  onOpenSplineModal: () => void;
  onOpenHealthMonitor: () => void;
  activeTab: InterfaceTab;
  onChangeTab: (tab: InterfaceTab) => void;
  isDualView?: boolean;
  onToggleDualView?: () => void;
}

export const MobileForensicInterface: React.FC<MobileForensicInterfaceProps> = ({
  theme,
  onToggleTheme,
  activePreset,
  presets,
  onSelectPreset,
  selectedHallmarkId,
  onSelectHallmark,
  isScanning,
  onTriggerScan,
  onUploadCustomFile,
  onQuarantine,
  onPassToCoreBanking,
  onDownloadCertificate,
  isQuarantined,
  historicalScans,
  onSelectHistoricalScan,
  currentUser,
  userRole,
  onSignOut,
  onOpenAuthModal,
  onOpenSplineModal,
  onOpenHealthMonitor,
  activeTab,
  onChangeTab,
  isDualView = false,
  onToggleDualView,
}) => {
  const [currentTime, setCurrentTime] = useState('19:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  // Threat vector timeline items (mapped to M T W T F S S from image.png)
  const timelineVectors = [
    { code: 'M', num: '1', id: 'voice-deepfake-ceo', label: 'Audio', vector: 'VOICE_DEEPFAKE' },
    { code: 'T', num: '2', id: 'synthetic-kyc', label: 'KYC', vector: 'SYNTHETIC_KYC' },
    { code: 'W', num: '3', id: 'altered-statement', label: 'Doc ELA', vector: 'DOCUMENT_TAMPERING' },
    { code: 'T', num: '4', id: 'wash-trading-mesh', label: 'Tx Mesh', vector: 'TRANSACTION_FRAUD' },
    { code: 'F', num: '5', id: 'phishing-pretext', label: 'Phish', vector: 'SOCIAL_ENGINEERING' },
    { code: 'S', num: '6', id: 'fake-storefront', label: 'Recon', vector: 'CYBER_RECON' },
    { code: 'S', num: '7', id: 'clean-payslip', label: 'Clean', vector: 'DOCUMENT_TAMPERING' },
  ];

  const currentTimelineIndex = timelineVectors.findIndex(
    (item) => item.id === activePreset.id || item.vector === activePreset.category
  );

  return (
    <div
      className={`w-full max-w-[440px] rounded-[52px] p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 shadow-[0_28px_80px_rgba(10,20,40,0.3)] border ${
        isDark
          ? 'bg-gradient-to-b from-[#0a1128] via-[#101f42] to-[#1c2d5a] text-slate-100 border-white/20'
          : 'bg-gradient-to-b from-[#6b91a7] via-[#9bbccf] to-[#eef4f8] text-slate-800 border-white/50'
      }`}
    >
      {/* 1. TOP STATUS BAR (Time, Center Punch Hole Camera, Wifi, Battery) */}
      <div className="flex items-center justify-between text-xs text-white/90 font-medium px-2 pt-1 select-none">
        <span className="font-semibold tracking-tight">{currentTime}</span>
        {/* Center Punch-Hole Camera Cutout (from image.png) */}
        <div className="w-4 h-4 rounded-full bg-slate-950 mx-auto -mt-1 shadow-inner border border-white/10 hidden sm:block" />
        <div className="flex items-center space-x-2">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 2. HEADER MASTHEAD: Date, Progress Ring & Tune Controls */}
      <div className="flex items-start justify-between px-1 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Today
          </h1>
          <p className="text-sm font-medium text-white/80">
            Wednesday, Oct 5
          </p>
        </div>

        {/* Right side: Circular Progress Gauge (from right phone in image.png) & Theme Switcher */}
        <div className="flex items-center space-x-2">
          {/* Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                className="stroke-white/20"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                className={isDark ? 'stroke-cyan-400' : 'stroke-white'}
                strokeWidth="2.5"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * (activePreset.riskScore || 35)) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-white leading-none">
                {activePreset.riskScore}%
              </span>
              <span className="text-[6px] text-white/70 uppercase leading-none mt-0.5">
                Risk
              </span>
            </div>
          </div>

          {/* Theme & Controls Button */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-2xl bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            title={isDark ? 'Switch to Light Oceanic Theme' : 'Switch to Dark Midnight Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* 3. OVERALL PROGRESS INDICATOR PILL (from image.png) */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white shadow-sm select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span className="font-medium text-white/90">
            {activeTab === 'inspect'
              ? 'Pixel ELA & Subpixel Inspection'
              : activeTab === 'audit'
              ? 'Arithmetic & EXIF Reconciliation'
              : activeTab === 'stream'
              ? 'Real-Time Gateway Triage Stream'
              : 'FIPS 140-3 Cryptographic Enclave'}
          </span>
        </div>
        <span className="font-bold text-white">99.98%</span>
      </div>

      {/* 4. MAIN HERO FOCUS CARD ("Today's focus" - from image.png) */}
      <div className="rounded-[36px] bg-white text-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-300">
        {/* Card Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Today's focus
            </span>
            <span
              className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                activePreset.riskScore > 70
                  ? 'bg-rose-100 text-rose-700'
                  : activePreset.riskScore > 30
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {activePreset.payload.verdict}
            </span>
          </div>

          {/* YouTube/Red badge or Operator pill (from image.png) */}
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              {activePreset.fileDetails.fileSize}
            </span>
          </div>
        </div>

        {/* Card Title & Body */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {activeTab === 'inspect'
              ? activePreset.fileDetails.fileName
              : activeTab === 'audit'
              ? 'Forensic Attribution & Arithmetic Audit'
              : activeTab === 'stream'
              ? 'Gateway Ingest Stream & Latency'
              : 'FIPS 140-3 Hardware Enclave 3D Viewport'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {activeTab === 'inspect'
              ? activePreset.payload.forensic_hallmarks[0]?.finding_detail ||
                'Multimodal tampering analysis with discrete cosine transform ELA compression residuals.'
              : activeTab === 'audit'
              ? 'Itemized gross-to-net pay verification, arithmetic discrepancy gap, and software metadata signatures.'
              : activeTab === 'stream'
              ? 'Real-time event mempool stream, P95 processing latency distribution, and attack surface radar.'
              : 'Isolated hardware cryptographic boundary with zero-trust key attestation and WebGL acceleration.'}
          </p>
        </div>

        {/* TAB CONTENT INSIDE HERO FOCUS CARD */}
        <div className="pt-1">
          {/* TAB 1: INSPECTION CANVAS VIEW */}
          {activeTab === 'inspect' && (
            <div className="space-y-3">
              {/* Responsive Embedded Canvas */}
              <div className="h-[260px] rounded-2xl overflow-hidden border border-slate-100 relative shadow-inner">
                <DualViewCanvas
                  preset={activePreset}
                  selectedHallmarkId={selectedHallmarkId}
                  onSelectHallmark={onSelectHallmark}
                  isScanning={isScanning}
                  onTriggerScan={onTriggerScan}
                  onUploadCustomFile={onUploadCustomFile}
                />
              </div>

              {/* Contextual Specialized Viewer (Voice Spectrogram or Transaction Mesh) */}
              {activePreset.category === 'VOICE_DEEPFAKE' && (
                <div className="scale-95 origin-top -mt-2">
                  <AudioSpectrogramViewer preset={activePreset} />
                </div>
              )}
              {activePreset.category === 'TRANSACTION_FRAUD' && (
                <div className="scale-95 origin-top -mt-2">
                  <TransactionGraphViewer preset={activePreset} />
                </div>
              )}

              {/* Primary Action Button (Obsidian Pill Button from image.png) */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onQuarantine}
                  disabled={isQuarantined}
                  className={`rounded-full px-5 py-3.5 flex items-center space-x-2.5 font-bold text-xs tracking-tight transition-all cursor-pointer shadow-lg active:scale-95 ${
                    isQuarantined
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-slate-950 hover:bg-slate-850 text-white shadow-slate-950/25'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>
                    {isQuarantined ? 'Quarantined & Locked ✓' : 'Quarantine Entity'}
                  </span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activePreset.latencyMs}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT & HALLMARKS VIEW */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                {/* Arithmetic Status Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">Arithmetic Reconciliation</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activePreset.payload.arithmetic_reconciliation.status === 'PASSED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : activePreset.payload.arithmetic_reconciliation.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {activePreset.payload.arithmetic_reconciliation.status}
                    </span>
                  </div>
                  {activePreset.payload.arithmetic_reconciliation.discrepancy_delta !== null && (
                    <div className="mt-1 text-slate-700 font-mono text-[11px]">
                      Discrepancy: Δ {activePreset.payload.arithmetic_reconciliation.currency}{' '}
                      {activePreset.payload.arithmetic_reconciliation.discrepancy_delta.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Hallmarks List */}
                {activePreset.payload.forensic_hallmarks.map((h) => (
                  <div
                    key={h.hallmark_id}
                    onClick={() => onSelectHallmark(h.hallmark_id)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-150 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.hallmark_id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {h.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1">{h.title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{h.finding_detail}</p>
                  </div>
                ))}
              </div>

              {/* Primary Action Button (Obsidian Pill) */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onDownloadCertificate}
                  className="bg-slate-950 hover:bg-slate-850 active:scale-95 text-white rounded-full px-5 py-3.5 flex items-center space-x-2.5 shadow-lg shadow-slate-950/20 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                    <Download className="w-2.5 h-2.5" />
                  </div>
                  <span>Download Signed Cert (JSON)</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STREAM & TELEMETRY VIEW */}
          {activeTab === 'stream' && (
            <div className="space-y-3">
              <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
                <HistoricalScansTable
                  scans={historicalScans}
                  selectedScanId={activePreset.id}
                  onSelectScan={onSelectHistoricalScan}
                />
                <LatencyThroughputChart
                  currentLatency={activePreset.latencyMs}
                  history={historicalScans}
                />
              </div>

              {/* Primary Action Button (Obsidian Pill) */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onOpenHealthMonitor}
                  className="bg-slate-950 hover:bg-slate-850 active:scale-95 text-white rounded-full px-5 py-3.5 flex items-center space-x-2.5 shadow-lg shadow-slate-950/20 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                    <Activity className="w-2.5 h-2.5" />
                  </div>
                  <span>Cluster Health Telemetry</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3D ENCLAVE VIEW */}
          {activeTab === 'enclave' && (
            <div className="space-y-3">
              <div className="h-[240px] rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
                <Rotate3d className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
                <span className="text-xs font-bold text-slate-100">
                  FIPS 140-3 Hardware Cryptographic Enclave
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Click below to open full interactive 3D WebGL viewport
                </span>
                <div className="mt-3 flex items-center space-x-2 text-[10px] bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-mono">ENCLAVE ARMED</span>
                </div>
              </div>

              {/* Primary Action Button (Obsidian Pill) */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onOpenSplineModal}
                  className="bg-slate-950 hover:bg-slate-850 active:scale-95 text-white rounded-full px-5 py-3.5 flex items-center space-x-2.5 shadow-lg shadow-slate-950/20 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                    <Rotate3d className="w-2.5 h-2.5" />
                  </div>
                  <span>Launch 3D Hardware Enclave ↗</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Level 3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. "NEXT UP" CAPSULE ROW (from image.png) */}
      <button
        onClick={() => {
          if (activeTab === 'inspect') onChangeTab('audit');
          else if (activeTab === 'audit') onChangeTab('stream');
          else if (activeTab === 'stream') onChangeTab('enclave');
          else onChangeTab('inspect');
        }}
        className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-xs font-medium text-white flex items-center justify-between transition-all cursor-pointer active:scale-98 select-none"
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="text-white/70 text-[11px]">Next Up</span>
          <span className="font-semibold text-white truncate">
            {activeTab === 'inspect'
              ? 'Forensic Hallmarks & Arithmetic Ledger Audit'
              : activeTab === 'audit'
              ? 'Real-Time Gateway Triage Stream'
              : activeTab === 'stream'
              ? 'FIPS 140-3 3D Hardware Enclave'
              : 'Multimodal ELA & Document Inspection'}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
      </button>

      {/* 6. "THIS WEEK" TIMELINE STRIP (from image.png: M T W T F S S / 2 3 4 5 6 7 8) */}
      <div className="rounded-[30px] bg-white/20 backdrop-blur-xl border border-white/30 p-4 space-y-2.5 select-none">
        <div className="flex items-center justify-between text-xs px-1 text-white">
          <span className="font-bold tracking-tight">Threat Vectors</span>
          <span className="text-white/75 text-[11px] font-medium">Aug 2-8</span>
        </div>

        {/* Horizontal Day/Vector Selector with elevated active capsule */}
        <div className="grid grid-cols-7 gap-1">
          {timelineVectors.map((item, idx) => {
            const isActive =
              activePreset.id === item.id ||
              (activePreset.category === item.vector && idx === currentTimelineIndex);

            return (
              <button
                key={item.id}
                onClick={() => onSelectPreset(item.id)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg shadow-black/10 scale-105 font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
                title={`${item.label} (${item.vector})`}
              >
                <span className="text-[10px] font-bold uppercase mb-0.5 opacity-75">
                  {item.code}
                </span>
                <span className="text-xs font-extrabold leading-tight">
                  {item.num}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. FLOATING BOTTOM PILL & HOME INDICATOR (from image.png: "I want to become...") */}
      <div className="pt-1 flex flex-col items-center space-y-2 select-none">
        {/* Floating pill navigation */}
        <div className="flex items-center p-1 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg text-xs font-semibold text-white">
          <button
            onClick={() => onChangeTab('inspect')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'inspect'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-white/85 hover:text-white'
            }`}
          >
            Inspect
          </button>

          <button
            onClick={() => onChangeTab('audit')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-white/85 hover:text-white'
            }`}
          >
            Audit
          </button>

          <button
            onClick={() => onChangeTab('stream')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-white/85 hover:text-white'
            }`}
          >
            Stream
          </button>

          <button
            onClick={() => onChangeTab('enclave')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'enclave'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-white/85 hover:text-white'
            }`}
          >
            3D Enclave
          </button>
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-white/50 rounded-full mx-auto" />
      </div>
    </div>
  );
};
