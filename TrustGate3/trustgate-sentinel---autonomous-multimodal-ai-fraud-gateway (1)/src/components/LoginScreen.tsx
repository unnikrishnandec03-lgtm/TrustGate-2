import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  ArrowRight,
  User,
  Eye,
  Sliders,
  Phone,
  Mail,
  Zap,
  Battery,
  Play,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  KeyRound,
  FileCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { UserRole } from '../App';

export interface LoginScreenProps {
  onLogin: (name: string, mobileNumber: string, gmail: string, role: UserRole) => void;
  defaultRole?: UserRole;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  defaultRole = 'ANALYST',
  isDark = true,
  onToggleTheme,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState('Elena Rostova');
  const [mobileNumber, setMobileNumber] = useState('+1 (555) 234-5678');
  const [gmail, setGmail] = useState('elena.rostova@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset selection
  const handleSelectPreset = (role: UserRole, name: string, phone: string, email: string) => {
    setSelectedRole(role);
    setFullName(name);
    setMobileNumber(phone);
    setGmail(email);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter the operator full name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMessage('Please enter the mobile phone number.');
      return;
    }
    if (!gmail.trim() || !gmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / corporate email address.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      onLogin(fullName.trim(), mobileNumber.trim(), gmail.trim(), selectedRole);
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div
      className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950 ${
        isDark
          ? 'bg-gradient-to-b from-[#020704] via-[#051c0f] via-[#072c18] to-[#010402] text-slate-100'
          : 'bg-gradient-to-b from-[#ffffff] via-[#f0faf4] via-[#bcf0d0] to-[#10b981]/25 text-slate-900'
      }`}
    >
      {/* Silky Emerald Radiant Aura matching image.png */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] rounded-full blur-[140px] pointer-events-none -z-10 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-[#10b981]/25 via-[#22c55e]/20 to-transparent'
            : 'bg-gradient-to-b from-[#4ade80]/35 via-[#22c55e]/30 to-transparent'
        }`}
      />
      <div
        className={`absolute top-[420px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-500 ${
          isDark ? 'bg-[#22c55e]/15' : 'bg-[#10b981]/25'
        }`}
      />

      {/* TOP MASTHEAD / NAVIGATION (Matching image.png: "Meet TrustGate." + Metadata Table + Device Pill) */}
      <header className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Title: "Meet TrustGate." */}
          <div>
            <span
              className={`text-2xl sm:text-3xl font-light block tracking-tight ${
                isDark ? 'text-emerald-400/80' : 'text-slate-400'
              }`}
            >
              Meet
            </span>
            <h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter -mt-1 ${
                isDark ? 'text-white' : 'text-[#021a0f]'
              }`}
            >
              TrustGate<span className="text-[#10b981]">.</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Autonomous Multimodal AI Fraud Gateway · Zero-Trust RBAC Portal
            </p>
          </div>

          {/* Right: Meta Information Table & Device Silhouette (from image.png) + Theme Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 self-start lg:self-center">
            {/* Metadata Table */}
            <div
              className={`grid grid-cols-4 gap-5 text-left border-r pr-5 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Brand</span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#052014]'}`}>TrustGate</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Year</span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#052014]'}`}>2026</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Type</span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#052014]'}`}>Zero-Trust AI</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Standard</span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#052014]'}`}>FIPS 140-3</span>
              </div>
            </div>

            {/* Black Hardware Device Mockup with Green Glowing LED Array (from image.png) */}
            <div className="w-48 h-13 rounded-2xl bg-gradient-to-b from-[#181d24] via-[#0f1318] to-[#080a0c] border border-slate-800 shadow-2xl p-2.5 flex items-center justify-between px-3.5">
              <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                <span>&lt;</span>
                <span>&gt;</span>
              </div>
              {/* Green Glowing LED Status Array */}
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
              </div>
            </div>

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#0e2017] hover:bg-[#142c20] text-emerald-300 border-emerald-800/60'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                }`}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            )}
          </div>
        </div>

        {/* Pull Quote & Tag Pills from image.png */}
        <div
          className={`mt-6 pt-5 border-t flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
            isDark ? 'border-slate-800/80' : 'border-slate-200/80'
          }`}
        >
          <div className="max-w-xl">
            <p className={`text-lg sm:text-xl leading-snug font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              &ldquo;<strong className={isDark ? 'text-white' : 'text-[#021a0f]'}>Most forensic security apps</strong> are built for cryptographers. <strong className={isDark ? 'text-white' : 'text-[#021a0f]'}>This one</strong> had to work for frontline enterprise and banking officers.&rdquo;
            </p>
            <div className="flex items-center space-x-3 mt-3">
              <div className="w-9 h-9 rounded-full bg-[#052e16] text-[#22c55e] flex items-center justify-center font-bold text-xs border border-emerald-400/40 shadow-sm">
                SH
              </div>
              <div>
                <span className={`font-bold text-xs block ${isDark ? 'text-white' : 'text-[#052014]'}`}>
                  Stan Hristov
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Creative &amp; Security Director
                </span>
              </div>
            </div>
          </div>

          {/* Pill Tags (from image.png) */}
          <div className="flex flex-wrap items-center gap-2 max-w-md lg:justify-end">
            {['ZERO-TRUST', 'PIXEL ELA', 'ARITHMETIC AUDIT', 'FIPS 140-3', 'DCT DEEPFAKE', 'KYBER-1024'].map((tag) => (
              <span
                key={tag}
                className={`px-3.5 py-1 rounded-full border text-[11px] font-semibold shadow-xs transition-colors ${
                  isDark
                    ? 'bg-[#0a1b12]/80 border-emerald-900/60 text-emerald-300'
                    : 'bg-white/90 border-slate-200 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* CENTERPIECE: Floating Hardware Squircle with Glowing Green Diamond Emblem (from image.png) */}
      <section className="relative max-w-7xl mx-auto px-6 py-4 flex flex-col items-center">
        {/* Device Label Pill */}
        <div
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs shadow-sm backdrop-blur-md mb-4 border ${
            isDark
              ? 'bg-[#0d1f15]/80 border-emerald-800/60 text-emerald-300'
              : 'bg-white/80 border-slate-200 text-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <span>Main Enclave Hardware — <strong>TrustGate One</strong></span>
        </div>

        {/* Center Black Squircle with Glowing Green Geometric Emblem (Exact Match to image.png) */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-[40px] bg-gradient-to-b from-[#1b221d] via-[#0c120e] to-[#040806] border-2 border-emerald-500/30 shadow-[0_24px_60px_rgba(4,46,22,0.5)] flex items-center justify-center relative group">
          {/* Glowing Green Geometric Logo from image.png */}
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="w-12 h-12 bg-[#22c55e] rounded-xl rotate-45 shadow-[0_0_35px_#22c55e] flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#15803d] to-[#86efac] opacity-90" />
              {/* Inner geometric cutout */}
              <div className="w-6 h-6 bg-[#0c120e] rounded-md rotate-45 z-10 -ml-1.5 -mt-1.5" />
            </div>
          </div>
          {/* Ambient rim glow */}
          <div className="absolute -inset-1 rounded-[44px] bg-gradient-to-r from-emerald-500/10 via-emerald-400/20 to-transparent blur-md -z-10 pointer-events-none" />
        </div>
      </section>

      {/* MAIN AUTHENTICATION CONTAINER */}
      <main className="max-w-4xl mx-auto px-6 py-4 relative z-10">
        <div
          className={`backdrop-blur-2xl rounded-[32px] shadow-2xl p-6 sm:p-10 border transition-all ${
            isDark
              ? 'bg-[#07170e]/95 border-emerald-900/60 shadow-[0_24px_70px_rgba(0,0,0,0.7)]'
              : 'bg-white/95 border-emerald-100 shadow-[0_24px_70px_rgba(5,32,20,0.08)]'
          }`}
        >
          {/* ================================================================ */}
          {/* 1. HIERARCHY SELECTOR (Analyst, Monitor, Director)               */}
          {/* ================================================================ */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <label className="text-xs font-black uppercase tracking-wider flex items-center space-x-2 text-emerald-400">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>1. Select Organizational Hierarchy Level</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Current selection: <strong className={selectedRole === 'ANALYST' ? 'text-cyan-400' : selectedRole === 'MONITOR' ? 'text-amber-400' : 'text-rose-400'}>{selectedRole}</strong>
              </span>
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* TIER 1: ANALYST */}
              <button
                type="button"
                onClick={() => setSelectedRole('ANALYST')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedRole === 'ANALYST'
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      Tier 1 · Operational
                    </span>
                    <User className={`w-4 h-4 ${selectedRole === 'ANALYST' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-base font-black ${selectedRole === 'ANALYST' ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Analyst
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Inspect 6 fraud disciplines (Voice, Synthetic KYC, ELA, Ledger, Pretexting, Sybil). Upload any fraud file &amp; escalate reports.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold">
                  <span className="text-cyan-400">Triage &amp; Escalation</span>
                  {selectedRole === 'ANALYST' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>

              {/* TIER 2: MONITOR */}
              <button
                type="button"
                onClick={() => setSelectedRole('MONITOR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedRole === 'MONITOR'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Tier 2 · Supervisory
                    </span>
                    <Eye className={`w-4 h-4 ${selectedRole === 'MONITOR' ? 'text-amber-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-base font-black ${selectedRole === 'MONITOR' ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Monitor
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Audit Analyst escalated submissions, verify fraud, intimate the Director for clearance/quarantine, and override mistakes.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold">
                  <span className="text-amber-400">Verify &amp; Intimate Director</span>
                  {selectedRole === 'MONITOR' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </button>

              {/* TIER 3: DIRECTOR */}
              <button
                type="button"
                onClick={() => setSelectedRole('DIRECTOR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  selectedRole === 'DIRECTOR'
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/30'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Tier 3 · Command
                    </span>
                    <Sliders className={`w-4 h-4 ${selectedRole === 'DIRECTOR' ? 'text-rose-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-base font-black ${selectedRole === 'DIRECTOR' ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    Director
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Highest command: Clear mistakes/pardons on Monitor intimations, authorize permanent enclave quarantine, lockdown &amp; audit certs.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold">
                  <span className="text-rose-400">Clear Mistakes &amp; Quarantine</span>
                  {selectedRole === 'DIRECTOR' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </div>
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 2. QUICK DEMO PRESETS                                            */}
          {/* ================================================================ */}
          <div className="mb-6 p-4 rounded-2xl border bg-slate-950/40 border-emerald-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>1-Click Hierarchy Pre-fills:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPreset(
                      'ANALYST',
                      'Elena Rostova (Analyst)',
                      '+1 (555) 234-5678',
                      'elena.rostova@gmail.com'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedRole === 'ANALYST' && fullName.includes('Elena')
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900 text-cyan-300 border-cyan-500/30 hover:bg-slate-800'
                  }`}
                >
                  Analyst · Elena
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPreset(
                      'MONITOR',
                      'Stan Hristov (Monitor)',
                      '+1 (555) 382-9014',
                      'stan.hristov@gmail.com'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedRole === 'MONITOR' && fullName.includes('Stan')
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                  }`}
                >
                  Monitor · Stan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPreset(
                      'DIRECTOR',
                      'Dr. Aris Thorne (Director)',
                      '+1 (555) 891-4402',
                      'aris.thorne@trustgate.ai'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedRole === 'DIRECTOR' && fullName.includes('Aris')
                      ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-500/30'
                      : 'bg-slate-900 text-rose-300 border-rose-500/30 hover:bg-slate-800'
                  }`}
                >
                  Director · Dr. Aris
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. CREDENTIAL FORM (Name, Phone, Gmail)                          */}
          {/* ================================================================ */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Field 1: Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Operator Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full px-4 py-3 rounded-2xl font-medium text-sm focus:outline-none transition-all border ${
                    isDark
                      ? 'bg-slate-950 border-emerald-900/60 text-white placeholder-slate-600 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile Phone Number</span>
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className={`w-full px-4 py-3 rounded-2xl font-medium text-sm focus:outline-none transition-all border ${
                    isDark
                      ? 'bg-slate-950 border-emerald-900/60 text-white placeholder-slate-600 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Field 3: Gmail */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gmail / Google Account</span>
                </label>
                <input
                  type="email"
                  required
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  placeholder="elena.rostova@gmail.com"
                  className={`w-full px-4 py-3 rounded-2xl font-medium text-sm focus:outline-none transition-all border ${
                    isDark
                      ? 'bg-slate-950 border-emerald-900/60 text-white placeholder-slate-600 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-tight shadow-xl transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-60 active:scale-98 ${
                  selectedRole === 'ANALYST'
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                    : selectedRole === 'MONITOR'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/30'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>
                  {isSubmitting
                    ? 'Verifying Cryptographic Credentials...'
                    : `Authenticate as ${selectedRole} & Enter TrustGate Gateway`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* 3 SIGNATURE TIER SUMMARY CARDS (Matching image.png: 10 kWh, 5 kWh, 0 kWh) */}
      <footer className="max-w-7xl mx-auto px-6 lg:px-12 py-10 border-t border-emerald-900/40 mt-6">
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
    </div>
  );
};
