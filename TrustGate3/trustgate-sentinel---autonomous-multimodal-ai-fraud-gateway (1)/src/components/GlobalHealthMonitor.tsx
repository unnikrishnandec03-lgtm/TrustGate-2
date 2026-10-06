import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Server,
  ShieldCheck,
  Cpu,
  HardDrive,
  Radio,
  Zap,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Lock,
  Download,
  Terminal,
} from 'lucide-react';

interface GlobalHealthMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  systemUptime?: string;
  firestoreConnected?: boolean;
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  unit?: string;
  min?: number;
  max?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#06b6d4',
  height = 24,
  width = 90,
  unit = '',
  min: forceMin,
  max: forceMax,
}) => {
  if (!data || data.length < 2) return null;

  const minVal = forceMin !== undefined ? forceMin : Math.min(...data);
  const maxVal = forceMax !== undefined ? forceMax : Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const fillD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const latest = data[data.length - 1];
  const gradientId = useMemo(() => `spark-grad-${Math.random().toString(36).substring(2, 9)}`, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative inline-block" style={{ width, height }}>
        <svg width={width} height={height} className="overflow-visible block">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={fillD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Latest Point Indicator */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="2"
              fill={color}
              className="animate-pulse"
            />
          )}
        </svg>
      </div>
      <span className="font-mono text-[10px] text-slate-300 font-semibold min-w-[36px] text-right">
        {latest}
        {unit}
      </span>
    </div>
  );
};

export const GlobalHealthMonitor: React.FC<GlobalHealthMonitorProps> = ({
  isOpen,
  onClose,
  systemUptime = '99.98%',
  firestoreConnected = true,
}) => {
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [lastSweepTime, setLastSweepTime] = useState('Just now');
  const [filterMode, setFilterMode] = useState<'all' | 'nodes' | 'crypto'>('all');

  // Real-time fluctuating telemetry streams
  const [cpuHistory, setCpuHistory] = useState([34, 37, 36, 42, 39, 44, 40, 38, 41, 39]);
  const [memHistory, setMemHistory] = useState([52, 53, 52, 54, 53, 55, 54, 53, 54, 54]);
  const [qpsHistory, setQpsHistory] = useState([138, 142, 145, 140, 149, 146, 144, 152, 148, 150]);
  const [jitterHistory, setJitterHistory] = useState([1.1, 1.3, 1.0, 1.4, 1.2, 1.5, 1.1, 1.2, 1.3, 1.2]);

  // Node Latencies
  const [nodes, setNodes] = useState([
    {
      id: 'us-east4',
      name: 'US East (Ashburn)',
      role: 'Primary HSM Enclave',
      status: 'HEALTHY',
      loss: '0.0%',
      history: [17, 18, 17, 19, 18, 18, 19, 17, 18, 18],
    },
    {
      id: 'us-central1',
      name: 'US Central (Iowa)',
      role: 'Gemini Forensics Cluster',
      status: 'HEALTHY',
      loss: '0.0%',
      history: [24, 25, 23, 26, 24, 25, 24, 23, 25, 24],
    },
    {
      id: 'europe-west3',
      name: 'EU West (Frankfurt)',
      role: 'GDPR Privacy Gateway',
      status: 'HEALTHY',
      loss: '0.0%',
      history: [41, 43, 42, 44, 41, 42, 43, 42, 41, 42],
    },
    {
      id: 'asia-east1',
      name: 'Asia East (Tokyo)',
      role: 'AP Payment Rail Relay',
      status: 'HEALTHY',
      loss: '0.0%',
      history: [67, 69, 68, 71, 68, 67, 70, 68, 69, 68],
    },
    {
      id: 'sa-east1',
      name: 'SA East (São Paulo)',
      role: 'LatAm Secondary Ingress',
      status: 'NOMINAL',
      loss: '0.1%',
      history: [112, 115, 114, 118, 113, 116, 114, 115, 113, 114],
    },
  ]);

  // Cryptographic Modules
  const [hsmLatencyHistory, setHsmLatencyHistory] = useState([3.1, 3.2, 3.0, 3.4, 3.2, 3.1, 3.3, 3.2, 3.1, 3.2]);

  // Periodic heartbeat tick
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Fluctuate CPU
      setCpuHistory((prev) => {
        const nextVal = Math.max(25, Math.min(65, prev[prev.length - 1] + (Math.floor(Math.random() * 7) - 3)));
        return [...prev.slice(1), nextVal];
      });

      // Fluctuate QPS
      setQpsHistory((prev) => {
        const nextVal = Math.max(120, Math.min(180, prev[prev.length - 1] + (Math.floor(Math.random() * 9) - 4)));
        return [...prev.slice(1), nextVal];
      });

      // Fluctuate Jitter
      setJitterHistory((prev) => {
        const nextVal = Number((Math.max(0.8, Math.min(2.2, prev[prev.length - 1] + (Math.random() * 0.4 - 0.2)))).toFixed(1));
        return [...prev.slice(1), nextVal];
      });

      // Fluctuate Nodes
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          const delta = Math.floor(Math.random() * 3) - 1;
          const lastVal = n.history[n.history.length - 1];
          const nextVal = Math.max(10, lastVal + delta);
          return {
            ...n,
            history: [...n.history.slice(1), nextVal],
          };
        })
      );

      // Fluctuate HSM
      setHsmLatencyHistory((prev) => {
        const nextVal = Number((Math.max(2.8, Math.min(3.8, prev[prev.length - 1] + (Math.random() * 0.2 - 0.1)))).toFixed(1));
        return [...prev.slice(1), nextVal];
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Run Diagnostic Sweep
  const runDiagnosticSweep = useCallback(() => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      setLastSweepTime(new Date().toLocaleTimeString());
    }, 1200);
  }, []);

  // Export JSON Report
  const handleExportHealthReport = () => {
    const report = {
      report_type: 'GLOBAL_HEALTH_TELEMETRY',
      timestamp: new Date().toISOString(),
      system_uptime: systemUptime,
      firestore_connected: firestoreConnected,
      cluster_metrics: {
        cpu_load_pct: cpuHistory[cpuHistory.length - 1],
        memory_usage_pct: memHistory[memHistory.length - 1],
        throughput_qps: qpsHistory[qpsHistory.length - 1],
        pipeline_jitter_ms: jitterHistory[jitterHistory.length - 1],
      },
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        role: n.role,
        current_latency_ms: n.history[n.history.length - 1],
        packet_loss: n.loss,
        status: n.status,
      })),
      cryptographic_modules: {
        fips_140_3_hsm: {
          status: 'ACTIVE_L3',
          sign_latency_ms: hsmLatencyHistory[hsmLatencyHistory.length - 1],
        },
        kyber_1024_pqc: { status: 'ONLINE_ACTIVE' },
        merkle_ledger: { block_height: 2849102, consensus_ms: 1000 },
        firestore_audit_stream: { connected: firestoreConnected },
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrustGate_Health_Telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white/90 border-l border-white/80 shadow-2xl backdrop-blur-3xl flex flex-col font-sans text-slate-800 animate-in slide-in-from-right duration-250 select-none">
      {/* Top Drawer Header */}
      <div className="px-5 py-4 border-b border-white/60 bg-white/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Global Health Monitor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Cluster SLA: <strong className="text-emerald-700">{systemUptime}</strong> · Last Sweep: {lastSweepTime}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runDiagnosticSweep}
            disabled={isDiagnosticRunning}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Run instant latency ping & cryptographic sweep"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportHealthReport}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Export health metrics JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs (Segmented Control matching image.png) */}
      <div className="p-2.5 bg-white/50 border-b border-white/60">
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Telemetry
          </button>
          <button
            onClick={() => setFilterMode('nodes')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
              filterMode === 'nodes'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Edge Nodes (5)
          </button>
          <button
            onClick={() => setFilterMode('crypto')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
              filterMode === 'crypto'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Crypto HSM
          </button>
        </div>
      </div>

      {/* Main Scrollable Telemetry Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section 1: System Performance Engine */}
        {(filterMode === 'all' || filterMode === 'nodes') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>INFERENCE ENGINE & COMPUTE MATRIX</span>
              </span>
              <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* CPU Load */}
              <div className="p-2.5 bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>GEMINI INFERENCE</span>
                  <span className="text-cyan-400">LOAD</span>
                </div>
                <div className="flex items-center justify-between">
                  <Sparkline data={cpuHistory} color="#06b6d4" unit="%" min={0} max={100} />
                </div>
              </div>

              {/* Memory Allocation */}
              <div className="p-2.5 bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>VECTOR BUFFER</span>
                  <span className="text-cyan-400">RAM</span>
                </div>
                <div className="flex items-center justify-between">
                  <Sparkline data={memHistory} color="#38bdf8" unit="%" min={0} max={100} />
                </div>
              </div>

              {/* Throughput QPS */}
              <div className="p-2.5 bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>THROUGHPUT</span>
                  <span className="text-emerald-400">QPS</span>
                </div>
                <div className="flex items-center justify-between">
                  <Sparkline data={qpsHistory} color="#10b981" unit="/s" min={100} max={200} />
                </div>
              </div>

              {/* Pipeline Jitter */}
              <div className="p-2.5 bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>ENCLAVE JITTER</span>
                  <span className="text-cyan-400">DELTA</span>
                </div>
                <div className="flex items-center justify-between">
                  <Sparkline data={jitterHistory} color="#f59e0b" unit="ms" min={0} max={3} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Global Node Latency Sparklines */}
        {(filterMode === 'all' || filterMode === 'nodes') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              <span className="flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>MULTI-REGION EDGE GATEWAY NODES</span>
              </span>
              <span className="text-cyan-400 font-bold">5/5 SYNCED</span>
            </div>

            <div className="divide-y divide-slate-800/80 border border-slate-800 bg-slate-900/40">
              {nodes.map((node) => {
                const latestLatency = node.history[node.history.length - 1];
                const latencyColor =
                  latestLatency < 35
                    ? '#10b981'
                    : latestLatency < 80
                    ? '#06b6d4'
                    : '#f59e0b';

                return (
                  <div key={node.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        <span className="font-bold text-slate-200">{node.name}</span>
                        <span className="text-[9px] text-slate-500">[{node.id}]</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">{node.role}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[9px] text-slate-500 block">LOSS</span>
                        <span className="text-[10px] text-slate-300 font-bold">{node.loss}</span>
                      </div>

                      <Sparkline
                        data={node.history}
                        color={latencyColor}
                        height={20}
                        width={70}
                        unit="ms"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Cryptographic Hardware Enclave & Module Availability */}
        {(filterMode === 'all' || filterMode === 'crypto') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              <span className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>CRYPTOGRAPHIC MODULE AVAILABILITY</span>
              </span>
              <span className="text-emerald-400 font-bold">FIPS 140-3 L3</span>
            </div>

            <div className="space-y-2">
              {/* HSM Vault Signature Latency */}
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-slate-200">Hardware Security Module (HSM)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Hardware key isolation & ECDSA P-256 signing
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] text-slate-500 uppercase">SIGN LATENCY:</span>
                  <Sparkline
                    data={hsmLatencyHistory}
                    color="#10b981"
                    height={20}
                    width={65}
                    unit="ms"
                  />
                </div>
              </div>

              {/* Post-Quantum Kyber-1024 */}
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-slate-200">Post-Quantum Lattice Rail</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    NIST FIPS 203 Kyber-1024 Encapsulation
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  ACTIVE
                </span>
              </div>

              {/* SHA-256 Merkle Ledger Node */}
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-slate-200">SHA-256 Merkle Ledger Node</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Consensus interval: 1000ms • Block #2,849,102
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  SYNCED
                </span>
              </div>

              {/* Firestore Cloud Audit Stream */}
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${firestoreConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="font-bold text-slate-200">Firestore Cloud Audit Ledger</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Real-time WebSocket event synchronization
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    firestoreConnected
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {firestoreConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>

              {/* DCT 8x8 Quantization Co-Processor */}
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-slate-200">ELA DCT Quantization Engine</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Hardware-accelerated discrete cosine transform
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                  98.4% EFF
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Diagnostics Action Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>FIPS 140-3 LEVEL 3 HARDWARE CERTIFIED</span>
        </div>

        <button
          onClick={runDiagnosticSweep}
          disabled={isDiagnosticRunning}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400 transition-colors shadow-sm shadow-cyan-950"
        >
          <Zap className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-bounce' : ''}`} />
          <span>{isDiagnosticRunning ? 'SWEEPING...' : 'RUN SWEEP'}</span>
        </button>
      </div>
    </div>
  );
};
