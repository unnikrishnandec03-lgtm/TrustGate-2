import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  ArrowRight,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Zap,
  Battery,
  Sliders,
  Play,
  Rotate3d,
  Activity,
  Download,
  FileSpreadsheet,
  FileCode,
  LogOut,
  Layers,
  KeyRound,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { PresetScenario, HistoricalScan, ForensicHallmark } from '../types/forensic';
import { OperatorRole, OperatorProfile } from '../hooks/useFirebaseAuth';
import { DualViewCanvas } from './DualViewCanvas';
import { ForensicHallmarksDrawer } from './ForensicHallmarksDrawer';
import { HistoricalScansTable } from './HistoricalScansTable';
import { LatencyThroughputChart } from './LatencyThroughputChart';
import { VectorRadarChart } from './VectorRadarChart';
import { AudioSpectrogramViewer } from './AudioSpectrogramViewer';
import { TransactionGraphViewer } from './TransactionGraphViewer';

interface WebForensicWorkspaceProps {
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
  operatorProfile: OperatorProfile;
  userRole: OperatorRole;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
  onOpenSplineModal: () => void;
  onOpenHealthMonitor: () => void;
  systemUptime?: string;
  connectedToFirestore?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const WebForensicWorkspace: React.FC<WebForensicWorkspaceProps> = ({
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
  operatorProfile,
  userRole,
  onSignOut,
  onOpenAuthModal,
  onOpenSplineModal,
  onOpenHealthMonitor,
  systemUptime = '99.98%',
  connectedToFirestore = true,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen font-sans relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#030805] via-[#05140b] to-[#020503] text-slate-100 selection:bg-[#10b981] selection:text-[#041c11]'
          : 'bg-gradient-to-b from-[#ffffff] via-[#f1faf4] to-[#dbf3e4] text-slate-800 selection:bg-[#052e16] selection:text-white'
      }`}
    >
      {/* Silky Emerald Radiant Aura from image.png */}
      <div
        className={`absolute top-[120px] left-1/2 -translate-x-1/2 w-[1400px] h-[750px] rounded-full filter blur-[140px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-[#10b981]/20 via-[#052e16]/30 to-transparent'
            : 'bg-gradient-to-b from-[#4ade80]/30 via-[#22c55e]/25 to-transparent'
        }`}
      />
      <div
        className={`absolute top-[480px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full filter blur-[100px] pointer-events-none -z-10 transition-opacity duration-300 ${
          isDark ? 'bg-[#22c55e]/15' : 'bg-[#10b981]/20'
        }`}
      />

      {/* TOP WEB HEADER / MASTHEAD: TrustGate Minimalist Header */}
      <header
        className={`border-b backdrop-blur-2xl sticky top-0 z-40 transition-colors duration-300 shadow-xs ${
          isDark ? 'border-slate-800/80 bg-[#07130c]/85' : 'border-slate-200/80 bg-white/80'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Identity & Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#1b221d] to-[#040806] border border-emerald-500/30 flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 bg-[#22c55e] rounded-md rotate-45 shadow-[0_0_12px_#22c55e] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#0c120e] rounded-xs rotate-45 -ml-0.5 -mt-0.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl lg:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#021a0f]'}`}>
                  TrustGate<span className="text-[#10b981]">.</span>
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                    isDark
                      ? 'bg-[#0b1710] border-emerald-900/60 text-[#10b981]'
                      : 'bg-white/90 border-slate-200 text-slate-700'
                  }`}
                >
                  FIPS 140-3
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-none mt-0.5">
                Autonomous Multimodal AI Fraud Gateway
              </p>
            </div>
          </div>

          {/* Center: Operator Identity Badge (Name, Mobile, Gmail cleanly without level spec) */}
          <div
            className={`flex items-center space-x-3 border rounded-full px-4 py-1.5 shadow-xs transition-colors backdrop-blur-xl ${
              isDark
                ? 'bg-[#0b1710] border-emerald-900/60 text-white'
                : 'bg-white/90 border-slate-200/90 text-slate-900'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#052e16] text-[#22c55e] flex items-center justify-center font-bold text-xs shadow-xs border border-emerald-500/30">
              {operatorProfile.fullName?.charAt(0) || 'O'}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-bold flex items-center space-x-2">
                <span>{operatorProfile.fullName}</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-[#10b981] border border-emerald-500/30">
                  Authorized
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-2 mt-0.5">
                <span>{operatorProfile.email}</span>
                <span>•</span>
                <span>{operatorProfile.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Right Action Triggers: Theme Toggle, Health, Enclave, Sign Out */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle (Light / Dark Mode) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`px-3 py-1.5 rounded-full border shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold backdrop-blur-xl ${
                  isDark
                    ? 'bg-[#0e2017] hover:bg-[#142c20] text-emerald-300 border-emerald-800/60'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            )}

            {/* Global Health Monitor */}
            <button
              onClick={onOpenHealthMonitor}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs transition-all cursor-pointer backdrop-blur-xl ${
                isDark
                  ? 'bg-[#0a1910] hover:bg-[#0f2418] border-emerald-900/60 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Health {systemUptime}</span>
            </button>

            {/* 3D Spline Enclave */}
            <button
              onClick={onOpenSplineModal}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs transition-all cursor-pointer backdrop-blur-xl ${
                isDark
                  ? 'bg-[#0a1910] hover:bg-[#0f2418] border-emerald-900/60 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5 text-[#10b981]" />
              <span>3D Enclave ↗</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="p-2 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Sign Out to Login Gateway"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Threat Vector Ribbon Selector */}
        <div
          className={`border-t px-6 lg:px-12 py-2 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none transition-colors ${
            isDark ? 'border-slate-800/80 bg-[#050e08]/90' : 'border-slate-100 bg-white/50'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-max">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Target Vector:</span>
            </span>

            {presets.map((p) => {
              const isActive = activePreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-[#10b981] text-[#041c11] shadow-md font-bold scale-[1.02]'
                        : 'bg-[#052e16] text-white shadow-md font-bold scale-[1.02]'
                      : isDark
                      ? 'bg-[#0a1710] text-slate-300 hover:text-white border border-emerald-900/50'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium">{p.fileDetails.fileName}</span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#041c11]' : 'bg-[#22c55e]'}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 min-w-max text-xs text-slate-400 font-medium pl-4 border-l border-slate-700/40">
            <span>Latency: <strong className={isDark ? 'text-white' : 'text-[#052014]'}>{activePreset.latencyMs}ms</strong></span>
            <span>•</span>
            <span>
              Risk Score:{' '}
              <strong className={activePreset.riskScore > 70 ? 'text-rose-500' : 'text-[#10b981]'}>
                {activePreset.riskScore}%
              </strong>
            </span>
          </div>
        </div>
      </header>

      {/* MAIN FULL-WIDTH WEB WORKSPACE (Minimalistic, Organized Web Architecture) */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* HERO SHOWCASE: PRIMARY INSPECTION CANVAS (65% / 35% Full Web Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PRIMARY INSPECTION WORKSPACE (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Top Showcase Banner with Centerpiece Hardware Emblem Accent from image.png */}
            <div
              className={`p-6 rounded-[32px] border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors backdrop-blur-2xl ${
                isDark
                  ? 'bg-[#09150e]/90 border-emerald-900/50 shadow-black/40 text-white'
                  : 'bg-white/90 border-slate-200 shadow-slate-900/5 text-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-[#10b981] border border-emerald-500/30">
                    Live Document Forensic Stream
                  </span>
                  <span
                    className={`px-3 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                      activePreset.riskScore > 70
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : activePreset.riskScore > 30
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {activePreset.payload.verdict}
                  </span>
                </div>
                <h2 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#021a0f]'}`}>
                  {activePreset.fileDetails.fileName}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activePreset.payload.forensic_hallmarks[0]?.finding_detail ||
                    'Real-time Discrete Cosine Transform ELA compression residuals, font kerning anomalies, and bounding box inspection.'}
                </p>
              </div>

              {/* Glowing Squircle Icon Accent from image.png */}
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1b221d] via-[#0c120e] to-[#040806] border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/20">
                  <div className="w-6 h-6 bg-[#22c55e] rounded-md rotate-45 shadow-[0_0_15px_#22c55e] flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#0c120e] rounded-xs rotate-45 -ml-0.5 -mt-0.5" />
                  </div>
                </div>

                <button
                  onClick={onTriggerScan}
                  disabled={isScanning}
                  className={`px-4 py-2.5 rounded-full font-bold text-xs tracking-tight shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-60 active:scale-95 ${
                    isDark
                      ? 'bg-[#10b981] hover:bg-[#22c55e] text-[#041c11] shadow-[#10b981]/20'
                      : 'bg-[#052e16] hover:bg-[#07401f] text-white shadow-[#052e16]/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan Pass'}</span>
                </button>
              </div>
            </div>

            {/* DualView Canvas Component */}
            <div className="min-h-[540px]">
              <DualViewCanvas
                preset={activePreset}
                selectedHallmarkId={selectedHallmarkId}
                onSelectHallmark={onSelectHallmark}
                isScanning={isScanning}
                onTriggerScan={onTriggerScan}
                onUploadCustomFile={onUploadCustomFile}
              />
            </div>

            {/* Contextual Specialized Viewers for Non-Standard Modalities */}
            {activePreset.category === 'VOICE_DEEPFAKE' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AudioSpectrogramViewer preset={activePreset} />
              </div>
            )}
            {activePreset.category === 'TRANSACTION_FRAUD' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <TransactionGraphViewer preset={activePreset} />
              </div>
            )}
          </div>

          {/* 35% FORENSIC HALLMARKS & TRIAGE PROTOCOL COLUMN (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <ForensicHallmarksDrawer
              payload={activePreset.payload}
              selectedHallmarkId={selectedHallmarkId}
              onSelectHallmark={onSelectHallmark}
              onDownloadCertificate={onDownloadCertificate}
              onQuarantine={onQuarantine}
              onPassToCoreBanking={onPassToCoreBanking}
              onViewRawJson={onDownloadCertificate}
              quarantined={isQuarantined}
            />
          </div>
        </div>

        {/* 3 SIGNATURE BOTTOM COLUMNS (Matching image.png Structure) */}
        <div className="pt-8 border-t border-slate-400/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-widest block">
                Autonomous Verification Architecture
              </span>
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#021a0f]'}`}>
                Enterprise Triage & Telemetry Rails
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Standard RFC 8785 JSON Canon</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Daylight Mint (10 kWh) */}
            <div
              className={`p-6 rounded-[32px] border shadow-md flex flex-col justify-between space-y-4 transition-colors backdrop-blur-xl ${
                isDark
                  ? 'bg-[#09150e]/90 border-emerald-900/50 text-white'
                  : 'bg-white border-slate-200/90 text-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#10b981] flex items-center justify-center border border-emerald-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#10b981] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    10 kWh · ELA ENGINE
                  </span>
                </div>
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#021a0f]'}`}>
                  Catching tampering is easy.
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discrete cosine transform noise residuals isolate altered currency amounts, modified stamps, and font raster discrepancies without manual tuning.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs">
                <span className="text-slate-400">Hallmarks Found:</span>
                <span className="font-extrabold text-[#10b981]">{activePreset.payload.forensic_hallmarks.length} Discrepancies</span>
              </div>
            </div>

            {/* Column 2: Twilight Dusk Blue (5 kWh) */}
            <div className="p-6 rounded-[32px] bg-gradient-to-b from-[#142938] via-[#10202e] to-[#0c1822] text-white border border-slate-700 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center border border-blue-400/30">
                    <Battery className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    5 kWh · ARITHMETIC
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Using it smartly?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tricker variances are audited automatically. Gross pay minus itemized deductions is balanced against stated sums to zero-variance tolerance.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Reconciliation:</span>
                <span className="font-extrabold text-cyan-400">
                  {activePreset.payload.arithmetic_reconciliation.status}
                </span>
              </div>
            </div>

            {/* Column 3: Deep Night Obsidian (0 kWh) */}
            <div className="p-6 rounded-[32px] bg-gradient-to-b from-[#09110d] via-[#050a07] to-[#020403] text-white border border-slate-800 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    0 kWh · QUARANTINE
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Autonomous quarantine.
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TrustGate stays awake. It isolates tampered payloads with cryptographic signatures and issues FIPS 140-3 certs before releasing to core banking.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Enforcement:</span>
                <span className="font-extrabold text-emerald-400">
                  {isQuarantined ? 'QUARANTINED ✓' : activePreset.payload.enforcement_action}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ANALYTICAL DECK (3-Column Telemetry Deck) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Live Historical Ingest Stream */}
          <div
            className={`lg:col-span-5 rounded-[32px] border p-5 shadow-sm transition-colors backdrop-blur-xl ${
              isDark ? 'bg-[#09150e]/90 border-emerald-900/50' : 'bg-white border-slate-200/90'
            }`}
          >
            <HistoricalScansTable
              scans={historicalScans}
              selectedScanId={activePreset.id}
              onSelectScan={onSelectHistoricalScan}
            />
          </div>

          {/* Real-Time Processing Latency & P99 Distribution */}
          <div
            className={`lg:col-span-4 rounded-[32px] border p-5 shadow-sm transition-colors backdrop-blur-xl ${
              isDark ? 'bg-[#09150e]/90 border-emerald-900/50' : 'bg-white border-slate-200/90'
            }`}
          >
            <LatencyThroughputChart
              currentLatency={activePreset.latencyMs}
              history={historicalScans}
            />
          </div>

          {/* Multimodal Attack Surface Radar */}
          <div
            className={`lg:col-span-3 rounded-[32px] border p-5 shadow-sm transition-colors backdrop-blur-xl ${
              isDark ? 'bg-[#09150e]/90 border-emerald-900/50' : 'bg-white border-slate-200/90'
            }`}
          >
            <VectorRadarChart vectorScores={activePreset.vectorScores} />
          </div>
        </div>
      </main>
    </div>
  );
};
