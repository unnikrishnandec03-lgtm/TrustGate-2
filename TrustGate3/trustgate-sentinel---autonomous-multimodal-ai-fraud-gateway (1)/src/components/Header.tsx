import React from 'react';
import { User } from 'firebase/auth';
import {
  Activity,
  Terminal,
  Shield,
  Fingerprint,
  Cpu,
  Layers,
  FileCheck,
  AlertTriangle,
  Flame,
  LogIn,
  LogOut,
  Database,
  KeyRound,
} from 'lucide-react';
import { PresetScenario, ThreatVector } from '../types/forensic';
import { OperatorRole } from '../hooks/useFirebaseAuth';

export interface ForensicDiscipline {
  id: string;
  code: string;
  name: string;
  tagline: string;
  targetPresetId: string;
  vector: ThreatVector;
}

export const FORENSIC_DISCIPLINES: ForensicDiscipline[] = [
  {
    id: 'disc-1',
    code: 'VEC-01',
    name: 'Voice & Audio Deepfakes',
    tagline: 'Acoustic spectral harmonics & vocoder phase jitter',
    targetPresetId: 'voice-clone-deepfake',
    vector: 'VOICE_DEEPFAKE',
  },
  {
    id: 'disc-2',
    code: 'VEC-02',
    name: 'Synthetic KYC & Ghost Identities',
    tagline: 'Diffusion inpainting seams & corneal specularity',
    targetPresetId: 'synthetic-kyc',
    vector: 'SYNTHETIC_KYC',
  },
  {
    id: 'disc-3',
    code: 'VEC-03',
    name: 'Document Forgery & Tampering',
    tagline: 'Pixel ELA compression residual & typography deltas',
    targetPresetId: 'clean-payslip',
    vector: 'DOCUMENT_TAMPERING',
  },
  {
    id: 'disc-4',
    code: 'VEC-04',
    name: 'Financial Ledger Discrepancies',
    tagline: 'Gross - Deductions != Net Pay arithmetic audit',
    targetPresetId: 'altered-statement',
    vector: 'DOCUMENT_TAMPERING',
  },
  {
    id: 'disc-5',
    code: 'VEC-05',
    name: 'Social Engineering & Pretexting',
    tagline: 'Autonomous pretexting velocity & urgency vectors',
    targetPresetId: 'social-engineering-trap',
    vector: 'SOCIAL_ENGINEERING',
  },
  {
    id: 'disc-6',
    code: 'VEC-06',
    name: 'Autonomous Sybil & Wash Trading',
    tagline: 'Circular liquidity flow & wallet collusion rings',
    targetPresetId: 'wash-trading-cycle',
    vector: 'TRANSACTION_FRAUD',
  },
];

interface HeaderProps {
  presets: PresetScenario[];
  activePreset: PresetScenario;
  onSelectPreset: (presetId: string) => void;
  isScanning: boolean;
  systemUptime?: string;
  onTriggerScan: () => void;
  currentUser?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  firestoreConnected?: boolean;
  onOpenSplineEnclave?: () => void;
  onOpenHealthMonitor?: () => void;
  onOpenAuthModal?: () => void;
  userRole?: OperatorRole;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePreset,
  onSelectPreset,
  isScanning,
  systemUptime = '99.98%',
  onTriggerScan,
  currentUser,
  onSignIn,
  onSignOut,
  firestoreConnected = true,
  onOpenSplineEnclave,
  onOpenHealthMonitor,
  onOpenAuthModal,
  userRole = 'ADMIN',
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const currentDiscipline =
    FORENSIC_DISCIPLINES.find((d) => d.targetPresetId === activePreset.id) ||
    FORENSIC_DISCIPLINES.find((d) => d.vector === activePreset.category) ||
    FORENSIC_DISCIPLINES[2];

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-2xl transition-colors duration-300 shadow-sm ${
        isDark
          ? 'bg-slate-950/85 border-slate-800/80 text-slate-100'
          : 'bg-white/80 border-white/60 text-slate-800'
      }`}
    >
      {/* Top Telemetry Masthead */}
      <div className="px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-y-2">
        {/* Left: Brand Identity & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-b from-[#1b221d] to-[#040806] border border-emerald-500/30 text-white flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-[#10b981]" />
          </div>
          <div>
            <div className={`font-bold tracking-tight text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>TrustGate</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-xs ${
                  isDark
                    ? 'text-[#10b981] bg-[#0b1710] border-emerald-900/60'
                    : 'text-slate-600 bg-white/80 border-slate-200'
                }`}
              >
                FIPS 140-3
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Autonomous Multimodal AI Fraud Gateway
            </p>
          </div>
        </div>

        {/* Right: Technical Controls & Operator Pill */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Theme Toggle (Light / Dark Mode) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 px-3 rounded-full border shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                isDark
                  ? 'bg-[#0e2017] hover:bg-[#142c20] text-emerald-300 border-emerald-800/60'
                  : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              <span className="font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          {/* Global Health Monitor Trigger Pill */}
          <button
            onClick={onOpenHealthMonitor}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer font-semibold border ${
              isDark
                ? 'bg-[#0a1910] hover:bg-[#0f2418] border-emerald-900/60 text-slate-200'
                : 'bg-white/80 hover:bg-white border-white/90 text-slate-700'
            }`}
            title="Open Global Health Monitor Side Panel"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Health {systemUptime}</span>
          </button>

          {/* 3D Hardware Enclave Trigger Pill */}
          <button
            onClick={onOpenSplineEnclave}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full shadow-xs transition-all cursor-pointer font-semibold border ${
              isDark
                ? 'bg-[#0a1910] hover:bg-[#0f2418] border-emerald-900/60 text-slate-200'
                : 'bg-white/80 hover:bg-white border-white/90 text-slate-700'
            }`}
            title="Open Interactive 3D Spline Hardware Enclave"
          >
            <Cpu className="w-3.5 h-3.5 text-[#10b981]" />
            <span>3D Enclave ↗</span>
          </button>

          {/* Operator Profile Card / Auth Pill */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5">
              <div
                className={`flex items-center space-x-2 px-3 py-1 border rounded-full shadow-xs ${
                  isDark ? 'bg-[#0b1710] border-emerald-900/60' : 'bg-white/90 border-white/90'
                }`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Operator'}
                    className="w-5 h-5 rounded-full border border-slate-200"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#052e16] text-[#22c55e] flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase() || 'OP'}
                  </span>
                )}
                <span className={`text-xs font-semibold truncate max-w-[130px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#052e16] text-[#22c55e] rounded-full border border-emerald-500/30">
                  Authorized
                </span>
              </div>

              <button
                onClick={onSignOut}
                className="p-1.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Sign out and return to Gateway"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal || onSignIn}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold bg-[#052e16] hover:bg-[#07401f] text-white rounded-full shadow-md transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Login & Authorize</span>
            </button>
          )}
        </div>
      </div>

      {/* Vector Selector Ribbon */}
      <div
        className={`px-4 lg:px-6 py-2 border-t flex items-center justify-between overflow-x-auto gap-4 scrollbar-none transition-colors ${
          isDark
            ? 'bg-[#050e08]/90 border-slate-800/80 text-slate-200'
            : 'bg-white/45 border-white/40 text-slate-700'
        }`}
      >
        <div className="flex items-center space-x-1.5 min-w-max">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Threat Vector:</span>
          </span>

          {FORENSIC_DISCIPLINES.map((discipline) => {
            const isActive =
              activePreset.id === discipline.targetPresetId ||
              (activePreset.category === discipline.vector &&
                discipline.id === currentDiscipline.id);

            return (
              <button
                key={discipline.id}
                onClick={() => onSelectPreset(discipline.targetPresetId)}
                className={`py-1.5 px-3 rounded-2xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-[#10b981] text-[#041c11] font-bold shadow-md shadow-[#10b981]/20 scale-102'
                      : 'bg-[#052e16] text-white shadow-md shadow-emerald-950/20 font-bold scale-102'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`text-[10px] font-semibold ${isActive ? (isDark ? 'text-[#041c11]' : 'text-emerald-300') : 'text-slate-400'}`}>
                  {discipline.code}
                </span>
                <span className="whitespace-nowrap">
                  {discipline.name}
                </span>
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ml-1 inline-block ${isDark ? 'bg-[#041c11]' : 'bg-[#22c55e]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Preset Quick Triggers */}
        <div className={`flex items-center space-x-1.5 min-w-max pl-4 border-l ${isDark ? 'border-slate-800' : 'border-white/60'}`}>
          <span className="text-[11px] font-medium text-slate-400">
            Presets:
          </span>

          <button
            onClick={() => onSelectPreset('clean-payslip')}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              activePreset.id === 'clean-payslip'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/80 text-slate-600 border-white/80 hover:bg-white'
            }`}
          >
            Clean Payslip
          </button>

          <button
            onClick={() => onSelectPreset('altered-statement')}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              activePreset.id === 'altered-statement'
                ? 'bg-slate-950 text-white border-slate-950 font-semibold shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/80 text-slate-600 border-white/80 hover:bg-white'
            }`}
          >
            Altered Ledger
          </button>

          <button
            onClick={() => onSelectPreset('synthetic-kyc')}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              activePreset.id === 'synthetic-kyc'
                ? 'bg-slate-950 text-white border-slate-950 font-semibold shadow-xs'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white/80 text-slate-600 border-white/80 hover:bg-white'
            }`}
          >
            Synthetic KYC
          </button>
        </div>
      </div>
    </header>
  );
};
