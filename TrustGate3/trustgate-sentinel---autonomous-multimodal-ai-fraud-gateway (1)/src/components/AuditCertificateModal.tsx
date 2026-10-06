import React, { useState } from 'react';
import { TrustGatePayload } from '../types/forensic';
import {
  X,
  Copy,
  Check,
  Download,
  Shield,
  Award,
} from 'lucide-react';

interface AuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: TrustGatePayload;
  fileName: string;
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  isOpen,
  onClose,
  payload,
  fileName,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'certificate' | 'rawJson'>('certificate');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGate_Tamper_Certificate_${payload.threat_vector}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPass = payload.verdict === 'AUTHENTIC';
  const isCritical = payload.verdict === 'CRITICAL_FRAUD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 font-sans select-none text-slate-800">
      <div className="bg-white/95 backdrop-blur-3xl border border-white/90 rounded-[36px] w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl shadow-slate-900/15 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 bg-white/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official TrustGate Tamper Attestation
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cryptographically Signed Verification Protocol • RFC 8785 Canon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Subtabs (Segmented control) */}
        <div className="p-3 bg-white/40 border-b border-white/50">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl text-xs font-semibold max-w-md">
            <button
              onClick={() => setActiveTab('certificate')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'certificate'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tamper Certificate (Formatted)
            </button>
            <button
              onClick={() => setActiveTab('rawJson')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                activeTab === 'rawJson'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Strict JSON Output Schema
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'certificate' ? (
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-5 text-xs text-slate-800 relative overflow-hidden shadow-sm">
              {/* Certificate watermark */}
              <div className="absolute right-6 bottom-6 opacity-4 pointer-events-none">
                <Award className="w-64 h-64 text-slate-950" />
              </div>

              {/* Certificate Header Stamp */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    TRUSTGATE SENTINEL FORENSIC CERTIFICATE
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">
                    #TG-{payload.metadata_fingerprint.sha256?.slice(0, 10).toUpperCase()}-2026
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Target Resource: <strong className="text-slate-800 font-semibold">{fileName}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full border uppercase ${
                      isPass
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isCritical
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    VERDICT: {payload.verdict}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">
                    Risk Index: <strong className="text-slate-800">{payload.overall_risk_score}%</strong> | Conf: {Math.round(payload.confidence_score * 100)}%
                  </div>
                </div>
              </div>

              {/* Core Attribution Findings */}
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Attribution Findings & Hallmarks ({payload.forensic_hallmarks.length})
                </div>
                <div className="space-y-2">
                  {payload.forensic_hallmarks.map((h) => (
                    <div
                      key={h.hallmark_id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-xs"
                    >
                      <div className="flex justify-between text-slate-900 font-bold">
                        <span>
                          [{h.hallmark_id}] {h.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700'
                              : h.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {h.severity}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 leading-relaxed">{h.finding_detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Ledger Summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Arithmetic Reconciliation</span>
                  <span
                    className={`font-bold mt-1 block ${
                      payload.arithmetic_reconciliation.status === 'PASSED'
                        ? 'text-emerald-700'
                        : payload.arithmetic_reconciliation.status === 'FAILED'
                        ? 'text-rose-700'
                        : 'text-slate-600'
                    }`}
                  >
                    Status: {payload.arithmetic_reconciliation.status}
                  </span>
                  {payload.arithmetic_reconciliation.discrepancy_delta !== null && (
                    <span className="text-slate-600 block mt-0.5 font-mono">
                      Delta Variance: {payload.arithmetic_reconciliation.currency}{' '}
                      {payload.arithmetic_reconciliation.discrepancy_delta?.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Metadata Software Signature</span>
                  <span className="text-slate-900 font-bold mt-1 block truncate">
                    {payload.metadata_fingerprint.software_signature}
                  </span>
                  <span className="text-slate-500 block mt-0.5 truncate font-mono text-[10px]">
                    SHA256: {payload.metadata_fingerprint.sha256}
                  </span>
                </div>
              </div>

              {/* Sign-off banner */}
              <div className="pt-2 text-[11px] text-slate-500 flex justify-between items-center border-t border-slate-100">
                <span>Certification Gate: FIPS 140-3 Hardware Enclave</span>
                <span className="font-semibold text-slate-800">Action: {payload.enforcement_action}</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-cyan-300 rounded-3xl text-xs leading-relaxed overflow-x-auto selection:bg-cyan-500/30 font-mono shadow-inner">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/60 bg-white/70">
          <div className="text-xs text-slate-500 font-medium">
            Schema Compliance: Strict TrustGate Sentinel JSON 1.0
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-full border border-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-850 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed JSON Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
