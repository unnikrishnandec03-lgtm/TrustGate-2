import React from 'react';
import { PresetScenario } from '../types/forensic';
import { ArrowRight, ShieldAlert } from 'lucide-react';

interface TransactionGraphViewerProps {
  preset: PresetScenario;
}

export const TransactionGraphViewer: React.FC<TransactionGraphViewerProps> = ({ preset }) => {
  const mesh = preset.transactionMesh;
  if (!mesh) return null;

  return (
    <div className="rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_16px_48px_rgba(15,30,60,0.06)] p-5 font-sans space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">
              Circular Wash-Trading & Liquidity Collusion Cycle Detected
            </span>
            <span className="text-xs text-slate-500 font-medium">Multi-Party Ledger Ring Analysis</span>
          </div>
        </div>
        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-xs">
          Cycle Retention: 98.1% (Principal Preserved)
        </span>
      </div>

      {/* Cycle hops list */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
        {mesh.nodes.map((node) => (
          <div
            key={node.id}
            className="p-3.5 bg-white/70 rounded-2xl border border-white/90 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{node.id}</span>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Risk: {node.risk}%
                </span>
              </div>
              <div className="text-slate-900 font-bold mt-1 text-xs truncate">
                {node.label}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">{node.role}</div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between font-semibold">
              <span>Next Hop:</span>
              <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white/60 border border-white/80 rounded-2xl text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="text-slate-600">
          Mempool Telemetry: <strong className="text-slate-900 font-bold">18 blocks (synthetic volume amplification)</strong>
        </div>
        <div className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
          Artificial Wash Volume: $4,800,000 USD
        </div>
      </div>
    </div>
  );
};
