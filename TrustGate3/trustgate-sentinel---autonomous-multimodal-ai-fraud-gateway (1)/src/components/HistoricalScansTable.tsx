import React from 'react';
import { HistoricalScan } from '../types/forensic';
import { Activity, ArrowUpRight } from 'lucide-react';

interface HistoricalScansTableProps {
  scans: HistoricalScan[];
  onSelectScan: (scan: HistoricalScan) => void;
  selectedScanId?: string;
}

export const HistoricalScansTable: React.FC<HistoricalScansTableProps> = ({
  scans,
  onSelectScan,
  selectedScanId,
}) => {
  const getVerdictStyle = (v: HistoricalScan['verdict']) => {
    switch (v) {
      case 'AUTHENTIC':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'SUSPICIOUS':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CRITICAL_FRAUD':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="flex flex-col font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Gateway Triage Stream
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Live Ingest & Mempool Audits</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-700 bg-white/80 border border-white/90 px-2.5 py-0.5 rounded-full shadow-xs">
          {scans.length} INGESTED EVENTS
        </span>
      </div>

      <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-2xl border border-white/80 bg-white/50 backdrop-blur-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-white/80 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Scan ID</th>
              <th className="py-2 px-3">Target Asset</th>
              <th className="py-2 px-3">Vector</th>
              <th className="py-2 px-3">Risk</th>
              <th className="py-2 px-3">Verdict</th>
              <th className="py-2 px-3">Latency</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/40">
            {scans.map((scan) => {
              const isSelected = selectedScanId === scan.id;
              return (
                <tr
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className={`hover:bg-white/80 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white font-medium shadow-xs' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {scan.timestamp}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap text-[11px]">
                    {scan.id}
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-medium truncate max-w-[180px] text-[11px]">
                    {scan.targetName}
                  </td>
                  <td className="py-2 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                    {scan.vector.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2 px-3 font-bold whitespace-nowrap text-[11px]">
                    <span
                      className={
                        scan.riskScore > 70
                          ? 'text-rose-600'
                          : scan.riskScore > 30
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }
                    >
                      {scan.riskScore}%
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getVerdictStyle(
                        scan.verdict
                      )}`}
                    >
                      {scan.verdict}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {scan.latencyMs}ms
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectScan(scan);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-medium inline-flex items-center space-x-1 text-[10px] shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
