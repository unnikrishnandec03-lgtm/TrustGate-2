import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import anime from 'animejs';
import { Rotate3d, X, Shield, Cpu } from 'lucide-react';
import { PresetScenario } from '../types/forensic';

interface SplineEnclaveViewerProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: PresetScenario;
}

export const SplineEnclaveViewer: React.FC<SplineEnclaveViewerProps> = ({
  isOpen,
  onClose,
  activePreset,
}) => {
  const [splineLoading, setSplineLoading] = useState(true);
  const riskNumRef = useRef<HTMLSpanElement>(null);
  const latencyNumRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (riskNumRef.current) {
        anime({
          targets: riskNumRef.current,
          innerHTML: [0, activePreset.riskScore],
          round: 1,
          duration: 800,
          easing: 'easeOutExpo',
        });
      }

      if (latencyNumRef.current) {
        anime({
          targets: latencyNumRef.current,
          innerHTML: [0, activePreset.latencyMs],
          round: 1,
          duration: 900,
          easing: 'easeOutExpo',
        });
      }
    }
  }, [isOpen, activePreset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-sans select-none text-slate-800">
      <div className="bg-white/95 backdrop-blur-3xl border border-white/90 rounded-[36px] max-w-6xl w-full h-[90vh] max-h-[820px] flex flex-col shadow-2xl shadow-slate-900/15 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/60 bg-white/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
              <Rotate3d className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                FIPS 140-3 LEVEL 3 • 3D HARDWARE ENCLAVE
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-xs">
                  SPLINE RUNTIME
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Active Threat Vector: <strong className="text-slate-800 font-semibold">{activePreset.category}</strong> • Latency: {activePreset.latencyMs}ms
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>ISOLATION SHIELD ARMED</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              title="Close 3D Viewport"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport & Telemetry Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Spline 3D Scene Viewport */}
          <div className="lg:col-span-8 relative bg-slate-950 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
            {splineLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-20 font-mono text-xs text-cyan-400 space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>STREAMING SPLINE 3D ENCLAVE ASSETS...</span>
              </div>
            )}

            <div className="w-full h-full">
              <Spline
                scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                onLoad={() => setSplineLoading(false)}
              />
            </div>

            {/* Viewport Overlay Controls */}
            <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-700 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white flex items-center space-x-2 pointer-events-none shadow-md">
              <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click & Drag to Rotate Enclave</span>
            </div>

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1 pointer-events-none">
              <span>HARDWARE CRYPTOGRAPHIC BOUNDARY</span>
              <span>WEBGL ACCELERATED • 60 FPS</span>
            </div>
          </div>

          {/* Right: Enclave Metrics Panel */}
          <div className="lg:col-span-4 p-6 bg-slate-50/70 flex flex-col justify-between space-y-4 overflow-y-auto">
            {/* Risk Probability Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                COMPOSITE THREAT PROBABILITY
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  ref={riskNumRef}
                  className={`text-5xl font-extrabold tracking-tight ${
                    activePreset.riskScore > 70
                      ? 'text-rose-600'
                      : activePreset.riskScore > 30
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {activePreset.riskScore}
                </span>
                <span className="text-xl font-bold text-slate-400">%</span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${
                    activePreset.riskScore > 70
                      ? 'bg-rose-500'
                      : activePreset.riskScore > 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${activePreset.riskScore}%` }}
                />
              </div>
            </div>

            {/* Target Details */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-xs space-y-3 shadow-sm">
              <div className="text-slate-500 pb-2 border-b border-slate-100 flex justify-between">
                <span>Inspected Target:</span>
                <span className="text-slate-900 font-bold truncate max-w-[150px]">
                  {activePreset.fileDetails.fileName}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Inference Latency:</span>
                <span className="text-slate-900 font-bold font-mono">
                  <span ref={latencyNumRef}>{activePreset.latencyMs}</span> ms
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hardware Disposition:</span>
                <span className="text-emerald-700 font-bold uppercase">
                  {activePreset.payload.enforcement_action}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="text-rose-600 font-bold block mb-0.5">
                  Critical Hallmark:
                </span>
                {activePreset.payload.forensic_hallmarks[0]?.title || 'Nominal integrity'}
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-600 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-900" />
                <span className="font-semibold text-slate-800">Zero-Trust Hardware Triage Rail</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Return to Canvas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
