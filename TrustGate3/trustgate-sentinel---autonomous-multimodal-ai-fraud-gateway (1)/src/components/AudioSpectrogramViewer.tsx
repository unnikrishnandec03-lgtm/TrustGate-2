import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertOctagon, Radio } from 'lucide-react';
import { PresetScenario } from '../types/forensic';

interface AudioSpectrogramViewerProps {
  preset: PresetScenario;
}

export const AudioSpectrogramViewer: React.FC<AudioSpectrogramViewerProps> = ({ preset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= 8.4) {
            setIsPlaying(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const timePercent = (playbackTime / 8.4) * 100;

  return (
    <div className="rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_16px_48px_rgba(15,30,60,0.06)] p-5 font-sans space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">
              Acoustic Vocoder & Phase Jitter Spectrogram
            </span>
            <span className="text-xs text-slate-500 font-medium">Neural Voice Deepfake Artifact Inspector</span>
          </div>
        </div>
        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-xs">
          Synthetic Jitter: 0.88 (Critical)
        </span>
      </div>

      {/* Simulated Live Audio Spectrum Bars */}
      <div className="relative h-28 bg-white/60 rounded-2xl border border-white/80 p-3 flex items-end justify-between overflow-hidden shadow-inner">
        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-950 z-20 shadow-md"
          style={{ left: `${timePercent}%` }}
        />

        {/* 8.2 kHz brickwall cutoff marker */}
        <div className="absolute top-6 left-0 right-0 border-b border-dashed border-rose-400/80 z-10 flex justify-between px-3 text-[10px] font-bold text-rose-600">
          <span>8,200 Hz Brickwall High-Frequency Cutoff (ElevenLabs Neural Artifact)</span>
          <span className="bg-rose-100 px-1.5 py-0.2 rounded">CUTOFF LINE</span>
        </div>

        {/* Frequency bars */}
        {Array.from({ length: 48 }).map((_, i) => {
          const height = Math.min(
            85,
            Math.max(
              12,
              Math.sin(i * 0.4 + playbackTime * 3) * 35 +
                Math.cos(i * 0.2) * 25 +
                (isPlaying ? Math.random() * 20 : 15)
            )
          );
          const isAboveCutoff = i > 38;

          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isAboveCutoff
                  ? 'bg-rose-400/60'
                  : height > 60
                  ? 'bg-slate-900'
                  : 'bg-slate-400'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Audio Playback Controls */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-slate-950 hover:bg-slate-850 text-white rounded-full flex items-center justify-center font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <span className="font-semibold text-slate-800">
            {playbackTime.toFixed(1)}s / 8.4s
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">File: {preset.fileDetails.fileName}</span>
        </div>

        <div className="flex items-center space-x-1.5 text-rose-600 font-semibold text-xs bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Biological Inhalations: 0 detected (Expected: 3-4)</span>
        </div>
      </div>
    </div>
  );
};
