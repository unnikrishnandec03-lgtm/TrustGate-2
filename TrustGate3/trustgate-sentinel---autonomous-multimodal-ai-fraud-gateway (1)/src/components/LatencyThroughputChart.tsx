import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { HistoricalScan } from '../types/forensic';
import { Zap, Activity } from 'lucide-react';

interface LatencyThroughputChartProps {
  currentLatency: number;
  history: HistoricalScan[];
}

export const LatencyThroughputChart: React.FC<LatencyThroughputChartProps> = ({
  currentLatency,
  history,
}) => {
  const latencyCounterRef = useRef<HTMLSpanElement>(null);
  const throughputCounterRef = useRef<HTMLSpanElement>(null);

  // Extract latencies (latest at end)
  const latencies = history.slice(-12).map((h) => h.latencyMs);
  if (latencies.length === 0) latencies.push(currentLatency);

  const maxLatency = Math.max(...latencies, 800);
  const minLatency = Math.min(...latencies, 200);
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const p95Latency = Math.round(
    [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] || currentLatency
  );

  const chartW = 320;
  const chartH = 75;
  const padX = 10;
  const padY = 10;

  // Build SVG sparkline path
  const points = latencies.map((val, idx) => {
    const x = padX + (idx / (latencies.length - 1 || 1)) * (chartW - padX * 2);
    const normalized = (val - minLatency) / (maxLatency - minLatency || 1);
    const y = chartH - padY - normalized * (chartH - padY * 2);
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || chartW} ${chartH} L ${points[0]?.x || 0} ${chartH} Z`;

  useEffect(() => {
    const animInstances: anime.AnimeInstance[] = [];

    if (latencyCounterRef.current) {
      const anim1 = anime({
        targets: latencyCounterRef.current,
        innerHTML: [0, currentLatency],
        round: 1,
        duration: 900,
        easing: 'easeOutExpo',
      });
      animInstances.push(anim1);
    }

    if (throughputCounterRef.current) {
      const anim2 = anime({
        targets: throughputCounterRef.current,
        innerHTML: [120, 248],
        round: 1,
        duration: 1200,
        easing: 'easeOutQuad',
      });
      animInstances.push(anim2);
    }

    return () => {
      animInstances.forEach((a) => {
        try {
          a.pause();
        } catch {
          // ignore
        }
      });
    };
  }, [currentLatency]);

  return (
    <div className="flex flex-col font-sans">
      {/* Header telemetry metrics */}
      <div className="flex items-center justify-between pb-3 border-b border-white/60 mb-2">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              Inference Telemetry
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              P95: {p95Latency}ms
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span
              ref={latencyCounterRef}
              className="text-2xl font-extrabold text-slate-950 font-sans tracking-tight"
            >
              {currentLatency}
            </span>
            <span className="text-xs text-slate-500 font-medium">ms response</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Throughput
          </span>
          <div className="flex items-baseline space-x-1 justify-end mt-0.5">
            <span
              ref={throughputCounterRef}
              className="text-xl font-extrabold text-slate-900 font-sans tracking-tight"
            >
              248
            </span>
            <span className="text-xs text-slate-500 font-medium">ops/s</span>
          </div>
        </div>
      </div>

      {/* Area chart SVG */}
      <div className="w-full relative h-[75px] overflow-hidden rounded-2xl bg-white/60 border border-white/80 shadow-inner">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="area-grad-light" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1={chartH / 2}
            x2={chartW}
            y2={chartH / 2}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#area-grad-light)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Data point dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 4 : 2}
              fill={i === points.length - 1 ? '#0f172a' : '#94a3b8'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Live scanning pulse dot */}
        <div className="absolute right-3 top-2 flex items-center space-x-1.5 bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-[9px] font-bold text-slate-700">LIVE PIPELINE</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2 px-1">
        <span>Min: {minLatency}ms</span>
        <span>Avg: {avgLatency}ms</span>
        <span>Max: {maxLatency}ms</span>
      </div>
    </div>
  );
};
