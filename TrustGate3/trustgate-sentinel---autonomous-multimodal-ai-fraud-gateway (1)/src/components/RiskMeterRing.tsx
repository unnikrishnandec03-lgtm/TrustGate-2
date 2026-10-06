import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Verdict } from '../types/forensic';

interface RiskMeterRingProps {
  score: number;
  verdict: Verdict;
  confidence: number;
  size?: number;
}

export const RiskMeterRing: React.FC<RiskMeterRingProps> = ({
  score,
  verdict,
  confidence,
  size = 180,
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const confidenceRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  // Dynamic color selection
  const getColor = (s: number) => {
    if (s <= 30) return { stroke: '#059669', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (s <= 70) return { stroke: '#d97706', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { stroke: '#e11d48', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800 border-rose-200' };
  };

  const { stroke, text, badge } = getColor(score);

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const animInstances: anime.AnimeInstance[] = [];

    // Animate counter
    if (counterRef.current) {
      const anim1 = anime({
        targets: counterRef.current,
        innerHTML: [0, score],
        round: 1,
        duration: 1100,
        easing: 'easeOutExpo',
      });
      animInstances.push(anim1);
    }

    // Animate confidence
    if (confidenceRef.current) {
      const anim2 = anime({
        targets: confidenceRef.current,
        innerHTML: [0, Math.round(confidence * 100)],
        round: 1,
        duration: 900,
        easing: 'easeOutExpo',
      });
      animInstances.push(anim2);
    }

    // Animate circle ring fill
    if (ringRef.current) {
      const anim3 = anime({
        targets: ringRef.current,
        strokeDashoffset: [circumference, strokeDashoffset],
        duration: 1200,
        easing: 'easeOutQuart',
      });
      animInstances.push(anim3);
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
  }, [score, confidence, strokeDashoffset, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-3 relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Subtle outer tech ticks */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 7}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(226, 232, 240, 0.9)"
            strokeWidth="9"
          />
          <circle
            ref={ringRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center telemetry */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] tracking-wider uppercase text-slate-400 font-semibold">
            Overall Risk
          </span>
          <div className="flex items-baseline space-x-0.5">
            <span
              ref={counterRef}
              className={`text-4xl font-extrabold tracking-tight ${text}`}
            >
              {score}
            </span>
            <span className={`text-base font-bold ${text}`}>%</span>
          </div>
          <span
            className={`mt-0.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${badge}`}
          >
            {verdict.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Sub metrics */}
      <div className="mt-2.5 flex items-center justify-between w-full max-w-[200px] text-xs text-slate-600 px-3 py-1 bg-white/80 rounded-full border border-white/90 shadow-xs">
        <span className="font-medium text-[11px]">Attribution Conf:</span>
        <span className="font-bold text-slate-900">
          <span ref={confidenceRef}>{Math.round(confidence * 100)}</span>%
        </span>
      </div>
    </div>
  );
};
