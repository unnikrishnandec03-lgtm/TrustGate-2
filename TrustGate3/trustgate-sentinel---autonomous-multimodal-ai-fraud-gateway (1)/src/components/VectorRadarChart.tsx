import React, { useId, useState } from 'react';
import { ThreatVector } from '../types/forensic';
import { Shield } from 'lucide-react';

interface VectorRadarChartProps {
  vectorScores: Record<ThreatVector, number>;
  activeVector?: ThreatVector;
  onSelectVector?: (vector: ThreatVector) => void;
  size?: number;
}

interface VectorConfig {
  key: ThreatVector;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
}

const VECTOR_CONFIGS: VectorConfig[] = [
  { key: 'VOICE_DEEPFAKE', label: '1. Voice Clones & Audio', shortLabel: 'Voice Clones', icon: '🎙️', color: '#0ea5e9' },
  { key: 'SYNTHETIC_KYC', label: '2. Synthetic KYC Identities', shortLabel: 'Synthetic KYC', icon: '🪪', color: '#6366f1' },
  { key: 'DOCUMENT_TAMPERING', label: '3. Document Integrity (ELA)', shortLabel: 'Doc Integrity', icon: '📄', color: '#f43f5e' },
  { key: 'TRANSACTION_FRAUD', label: '4. Transaction Collusion', shortLabel: 'Tx Collusion', icon: '⛓️', color: '#f59e0b' },
  { key: 'SOCIAL_ENGINEERING', label: '5. Phishing / Pretexting', shortLabel: 'Pretexting', icon: '⚡', color: '#ec4899' },
  { key: 'CYBER_RECON', label: '6. Fake Storefronts / Recon', shortLabel: 'Recon & Store', icon: '🌐', color: '#14b8a6' },
];

export const VectorRadarChart: React.FC<VectorRadarChartProps> = ({
  vectorScores,
  activeVector,
  onSelectVector,
  size = 280,
}) => {
  const [hoveredVector, setHoveredVector] = useState<ThreatVector | null>(null);
  const filterId = useId();

  const center = size / 2;
  const radius = size * 0.35;
  const numAxes = VECTOR_CONFIGS.length;

  // Compute coordinate for given axis and value (0-100)
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Polygon points
  const points = VECTOR_CONFIGS.map((config, index) => {
    const val = vectorScores[config.key] ?? 10;
    const { x, y } = getCoordinates(index, Math.max(8, val));
    return `${x},${y}`;
  }).join(' ');

  // Concentric rings (25%, 50%, 75%, 100%)
  const rings = [25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center font-sans w-full">
      {/* Title */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-white/60 mb-1">
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center">
            <Shield className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            Attack Surface Radar
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-white/80 border border-white/90 px-2 py-0.5 rounded-full">
          6 VECTORS
        </span>
      </div>

      <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <radialGradient id={`radar-grad-${filterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.12" />
            </radialGradient>
          </defs>

          {/* Web grid rings */}
          {rings.map((ringVal) => {
            const ringPoints = VECTOR_CONFIGS.map((_, i) => {
              const { x, y } = getCoordinates(i, ringVal);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={ringVal}>
                <polygon
                  points={ringPoints}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray={ringVal === 100 ? undefined : '3 3'}
                />
                <text
                  x={center}
                  y={center - (ringVal / 100) * radius - 2}
                  fontSize="8"
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {ringVal}%
                </text>
              </g>
            );
          })}

          {/* Radial Axis Spokes */}
          {VECTOR_CONFIGS.map((config, index) => {
            const { x, y } = getCoordinates(index, 100);
            const isHighlighted = hoveredVector === config.key || activeVector === config.key;

            return (
              <line
                key={config.key}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={isHighlighted ? '#0f172a' : '#e2e8f0'}
                strokeWidth={isHighlighted ? '1.5' : '1'}
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Threat Radar Polygon Area */}
          <polygon
            points={points}
            fill={`url(#radar-grad-${filterId})`}
            stroke="#0f172a"
            strokeWidth="2"
            className="transition-all duration-500 ease-out"
          />

          {/* Data Points on vertices */}
          {VECTOR_CONFIGS.map((config, index) => {
            const score = vectorScores[config.key] ?? 0;
            const { x, y } = getCoordinates(index, Math.max(8, score));
            const isHovered = hoveredVector === config.key;

            return (
              <g
                key={config.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredVector(config.key)}
                onMouseLeave={() => setHoveredVector(null)}
                onClick={() => onSelectVector?.(config.key)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={score > 70 ? '#f43f5e' : score > 30 ? '#f59e0b' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200 shadow-sm"
                />
              </g>
            );
          })}

          {/* Axis Labels outside radar */}
          {VECTOR_CONFIGS.map((config, index) => {
            const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
            const labelDistance = radius + 20;
            const lx = center + labelDistance * Math.cos(angle);
            const ly = center + labelDistance * Math.sin(angle);
            const isHovered = hoveredVector === config.key || activeVector === config.key;

            return (
              <text
                key={config.key}
                x={lx}
                y={ly + 3}
                fontSize="9"
                fontWeight={isHovered ? 'bold' : '600'}
                fill={isHovered ? '#0f172a' : '#64748b'}
                textAnchor={
                  Math.abs(Math.cos(angle)) < 0.2
                    ? 'middle'
                    : Math.cos(angle) > 0
                    ? 'start'
                    : 'end'
                }
                fontFamily="sans-serif"
                className="cursor-pointer select-none transition-colors duration-200"
                onMouseEnter={() => setHoveredVector(config.key)}
                onMouseLeave={() => setHoveredVector(null)}
                onClick={() => onSelectVector?.(config.key)}
              >
                {config.shortLabel} ({vectorScores[config.key] ?? 0}%)
              </text>
            );
          })}
        </svg>
      </div>

      {/* Vector Score Quick Chips */}
      <div className="grid grid-cols-3 gap-1.5 w-full mt-1 text-[10px]">
        {VECTOR_CONFIGS.map((cfg) => {
          const val = vectorScores[cfg.key] ?? 0;
          const isHigh = val > 70;
          const isMed = val > 30 && val <= 70;
          const badgeClass = isHigh
            ? 'text-rose-700 bg-rose-50 border-rose-200'
            : isMed
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-emerald-700 bg-emerald-50 border-emerald-200';

          return (
            <button
              key={cfg.key}
              onClick={() => onSelectVector?.(cfg.key)}
              onMouseEnter={() => setHoveredVector(cfg.key)}
              onMouseLeave={() => setHoveredVector(null)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-xl border transition-all text-left shadow-xs cursor-pointer ${badgeClass} ${
                activeVector === cfg.key ? 'ring-2 ring-slate-900 font-bold bg-white' : 'hover:bg-white'
              }`}
            >
              <span className="truncate mr-1 text-slate-700 font-medium">{cfg.shortLabel}</span>
              <span className="font-bold">{val}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
