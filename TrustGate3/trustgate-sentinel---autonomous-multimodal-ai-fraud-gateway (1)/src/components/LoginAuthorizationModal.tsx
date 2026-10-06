import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  X,
  AlertTriangle,
  Fingerprint,
  Cpu,
  UserCheck,
  LogOut,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { OperatorRole } from '../hooks/useFirebaseAuth';

interface LoginAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userRole: OperatorRole;
  onSignIn: (role?: OperatorRole) => Promise<User | null>;
  onSignOut: () => Promise<void>;
  onUpdateRole: (role: OperatorRole) => Promise<void>;
  firestoreConnected?: boolean;
}

export const LoginAuthorizationModal: React.FC<LoginAuthorizationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userRole,
  onSignIn,
  onSignOut,
  onUpdateRole,
  firestoreConnected = true,
}) => {
  const [selectedRole, setSelectedRole] = useState<OperatorRole>(userRole || 'ADMIN');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await onSignIn(selectedRole);
      setIsAuthenticating(false);
    } catch (err: any) {
      setIsAuthenticating(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Authentication popup was closed. Please try again.');
      } else {
        setAuthError(err?.message || 'Authentication error encountered.');
      }
    }
  };

  const handleRoleChange = async (newRole: OperatorRole) => {
    setSelectedRole(newRole);
    if (currentUser) {
      await onUpdateRole(newRole);
    }
  };

  const handleSignOutAndReset = async () => {
    try {
      await onSignOut();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-sans select-none text-slate-800">
      <div className="bg-white/90 backdrop-blur-3xl border border-white/90 rounded-[36px] max-w-xl w-full shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/60 bg-white/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Operator Clearance Gateway
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-xs">
                  FIPS 140-3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Zero-Trust Operator Authentication & Multimodal Authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            title="Close Authorization Gateway"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Authenticated State */}
          {currentUser ? (
            <div className="space-y-4">
              {/* Operator Badge Card */}
              <div className="p-4 bg-white/80 border border-white/90 rounded-2xl relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-50 border-b border-l border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center space-x-1.5 rounded-bl-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CLEARANCE ACTIVE</span>
                </div>

                <div className="flex items-start space-x-3.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Operator'}
                      className="w-12 h-12 rounded-2xl border border-slate-200 p-0.5 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {currentUser.email?.charAt(0).toUpperCase() || 'OP'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {currentUser.displayName || 'Security Operator'}
                    </h3>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5 font-mono">
                      <span>UID:</span>
                      <code className="text-slate-700 font-semibold">{currentUser.uid.slice(0, 16)}...</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clearance Level Grant */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Active Operator Clearance Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      role: 'OPERATOR' as OperatorRole,
                      label: 'Level 1: Investigator (Low)',
                      desc: 'Read-only telemetry & scan observation',
                    },
                    {
                      role: 'ANALYST' as OperatorRole,
                      label: 'Level 2: Officer (Medium)',
                      desc: 'Deep DCT forensic audit & certificate issuance',
                    },
                    {
                      role: 'ADMIN' as OperatorRole,
                      label: 'Level 3: Director (High)',
                      desc: 'Full quarantine & core banking triage authority',
                    },
                  ].map((item) => {
                    const isSelected = (userRole || selectedRole) === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => handleRoleChange(item.role)}
                        className={`p-3 text-left border rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-slate-900 text-slate-900 shadow-sm font-bold'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span>{item.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granted Authorization Privileges Matrix */}
              <div className="p-4 bg-white/70 border border-white/90 rounded-2xl space-y-2 text-xs shadow-xs">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 flex justify-between">
                  <span>Granted Protocol Capabilities</span>
                  <span className="text-emerald-600 font-bold">Verified</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Autonomous Multimodal Threat Triage (Audio, KYC, Ledger)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Zero-Trust Quarantine & Core Banking Commit Privilege</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>FIPS 140-3 HSM Cryptographic Hardware Certificate Attestation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-Time Cloud Firestore Audit Ledger Synchronization</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handleSignOutAndReset}
                  className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors rounded-full cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke Session</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 text-xs font-bold bg-slate-950 hover:bg-slate-850 active:scale-95 text-white transition-all rounded-full shadow-lg shadow-slate-950/20 cursor-pointer"
                >
                  <span>Return to Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated State: Sign In & Request Clearance */
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Operator Authentication & Authorization
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
                  Authenticate with authorized security credentials to unlock autonomous quarantine enforcement, forensic audit certification, and Firestore persistence.
                </p>
              </div>

              {/* Select Clearance Tier to Authorize */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Select Requested Clearance Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      role: 'ADMIN' as OperatorRole,
                      label: 'DIRECTOR (L3)',
                      desc: 'Full quarantine & core banking triage authority',
                    },
                    {
                      role: 'ANALYST' as OperatorRole,
                      label: 'OFFICER (L2)',
                      desc: 'Deep DCT forensic audit & certificate issuance',
                    },
                    {
                      role: 'OPERATOR' as OperatorRole,
                      label: 'INVESTIGATOR (L1)',
                      desc: 'Read-only telemetry & scan observation',
                    },
                  ].map((item) => {
                    const isSelected = selectedRole === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-2.5 text-left border rounded-xl transition-all ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span>{item.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight font-sans">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error notice */}
              {authError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Permissions Checklist to be Authorized */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800 flex justify-between">
                  <span>CAPABILITIES UNLOCKED WITH THIS CLEARANCE</span>
                  <span className="text-cyan-400">READY</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Zero-Trust Entity Quarantine & Core Banking Routing Actions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Cryptographically Signed JSON Audit Certificate Generation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Real-Time Cloud Firestore Multi-Device Incident Ledger</span>
                  </div>
                </div>
              </div>

              {/* Primary Google Sign-In Action */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleTriggerSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all rounded-xl shadow-lg shadow-cyan-950/80 disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>AUTHENTICATING OPERATOR IDENTITY...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>SIGN IN WITH GOOGLE & GRANT AUTHORIZATION</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-500 font-sans">
                  SSO via Google Identity Platform • Authenticated sessions are bound to Firestore security rules.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>FIRESTORE DATABASE:</span>
            <span className={firestoreConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {firestoreConnected ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-slate-500">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-BIT ENCLAVE ISOLATION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
