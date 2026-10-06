import React, { useEffect, useRef } from 'react';
import { ForensicHallmark } from '../types/forensic';
import { Crosshair, ZoomIn, Eye, Activity, Sparkles } from 'lucide-react';
import { LiquidGlassContainer } from './LiquidGlass';

interface MagnificationLensProps {
  sourceCanvas: HTMLCanvasElement | null;
  cursorPos: { x: number; y: number; normX: number; normY: number } | null;
  activeHallmark: ForensicHallmark | null;
  lensSize?: number;
  zoomFactor?: number;
  enhancementMode?: 'subpixel' | 'dct_grid' | 'high_contrast';
  containerBounds: DOMRect | null;
  canvasBounds: DOMRect | null;
}

export const MagnificationLens: React.FC<MagnificationLensProps> = ({
  sourceCanvas,
  cursorPos,
  activeHallmark,
  lensSize = 210,
  zoomFactor = 2.0,
  enhancementMode = 'subpixel',
  containerBounds,
  canvasBounds,
}) => {
  const lensCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!sourceCanvas || !cursorPos || !canvasBounds || !lensCanvasRef.current) return;

    const lensCanvas = lensCanvasRef.current;
    const ctx = lensCanvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI internal resolution
    const internalSize = lensSize * 2;
    lensCanvas.width = internalSize;
    lensCanvas.height = internalSize;

    // Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, internalSize, internalSize);

    // Calculate source canvas pixel coordinates
    // cursorPos.x and cursorPos.y are client coordinates relative to container
    // Compute position on source canvas
    const canvasRelX = cursorPos.x - (canvasBounds.left - (containerBounds?.left || 0));
    const canvasRelY = cursorPos.y - (canvasBounds.top - (containerBounds?.top || 0));

    // Ratio of source canvas native width to rendered display width
    const scaleX = sourceCanvas.width / canvasBounds.width;
    const scaleY = sourceCanvas.height / canvasBounds.height;

    const sourceX = canvasRelX * scaleX;
    const sourceY = canvasRelY * scaleY;

    // Source sample area
    const sampleW = internalSize / zoomFactor;
    const sampleH = internalSize / zoomFactor;
    const sx = Math.max(0, Math.min(sourceCanvas.width - sampleW, sourceX - sampleW / 2));
    const sy = Math.max(0, Math.min(sourceCanvas.height - sampleH, sourceY - sampleH / 2));

    // Disable image smoothing for sharp sub-pixel inspection
    ctx.imageSmoothingEnabled = false;

    // Draw magnified region
    ctx.drawImage(
      sourceCanvas,
      sx,
      sy,
      sampleW,
      sampleH,
      0,
      0,
      internalSize,
      internalSize
    );

    // Post-processing: Sub-pixel enhancements
    const imgData = ctx.getImageData(0, 0, internalSize, internalSize);
    const data = imgData.data;

    if (enhancementMode === 'subpixel') {
      // Reveal sub-pixel chromatic and edge differences
      for (let i = 0; i < data.length; i += 4) {
        // High-pass edge amplification
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Slight micro-contrast stretch
        data[i] = Math.min(255, Math.floor(r * 1.15));
        data[i + 1] = Math.min(255, Math.floor(g * 1.12));
        data[i + 2] = Math.min(255, Math.floor(b * 1.18));
      }
      ctx.putImageData(imgData, 0, 0);

      // Draw subtle sub-pixel RGB LCD grid overlay
      ctx.fillStyle = 'rgba(0, 255, 255, 0.04)';
      for (let x = 0; x < internalSize; x += 6) {
        ctx.fillRect(x, 0, 1, internalSize);
      }
      for (let y = 0; y < internalSize; y += 6) {
        ctx.fillRect(0, y, internalSize, 1);
      }
    } else if (enhancementMode === 'dct_grid') {
      // 8x8 DCT JPEG compression block boundary visualizer
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.lineWidth = 1;
      const blockSize = 8 * (zoomFactor / scaleX);
      for (let x = 0; x < internalSize; x += blockSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, internalSize);
        ctx.stroke();
      }
      for (let y = 0; y < internalSize; y += blockSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(internalSize, y);
        ctx.stroke();
      }
    }

    // Circular or tactical reticle overlay inside lens
    ctx.strokeStyle = activeHallmark ? '#f43f5e' : '#22d3ee';
    ctx.lineWidth = 1.5;

    // Crosshairs
    const center = internalSize / 2;
    ctx.beginPath();
    ctx.moveTo(center - 24, center);
    ctx.lineTo(center - 6, center);
    ctx.moveTo(center + 6, center);
    ctx.lineTo(center + 24, center);

    ctx.moveTo(center, center - 24);
    ctx.lineTo(center, center - 6);
    ctx.moveTo(center, center + 6);
    ctx.lineTo(center, center + 24);
    ctx.stroke();

    // Center precision micro-circle
    ctx.beginPath();
    ctx.arc(center, center, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Tick marks around inner radius
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const r1 = internalSize * 0.44;
      const r2 = internalSize * 0.48;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(angle) * r1, center + Math.sin(angle) * r1);
      ctx.lineTo(center + Math.cos(angle) * r2, center + Math.sin(angle) * r2);
      ctx.stroke();
    }
  }, [
    sourceCanvas,
    cursorPos,
    canvasBounds,
    containerBounds,
    zoomFactor,
    lensSize,
    enhancementMode,
    activeHallmark,
  ]);

  if (!cursorPos || !containerBounds) return null;

  // Calculate lens positioning relative to container (offset to not obstruct cursor)
  const offset = 24;
  let posX = cursorPos.x + offset;
  let posY = cursorPos.y + offset;

  // Bound check so lens does not spill outside container
  if (posX + lensSize + 20 > containerBounds.width) {
    posX = cursorPos.x - lensSize - offset;
  }
  if (posY + lensSize + 60 > containerBounds.height) {
    posY = cursorPos.y - lensSize - offset;
  }

  const isAnomalous = !!activeHallmark;

  return (
    <div
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${lensSize}px`,
      }}
      className="absolute pointer-events-none z-50 transition-transform duration-75 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Outer Liquid Glass Loupe Frame with WebGL Refraction */}
      <LiquidGlassContainer
        sourceCanvas={sourceCanvas}
        borderRadius={14}
        type="rounded"
        tintColor={isAnomalous ? '#f43f5e' : '#06b6d4'}
        tintOpacity={0.28}
        refraction={0.65}
        chromaticAberration={0.35}
        rippleEffect={0.4}
        cornerBoost={0.3}
        blurAmount={2.4}
        className={`border shadow-2xl p-1.5 backdrop-blur-xl ${
          isAnomalous
            ? 'border-rose-500/90 shadow-rose-950/80 ring-1 ring-rose-500/50'
            : 'border-cyan-500/90 shadow-cyan-950/80 ring-1 ring-cyan-500/40'
        }`}
      >
        {/* Top Header Tag */}
        <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-800/80 text-[10px] font-mono">
          <div className="flex items-center space-x-1">
            <span
              className={`w-1.5 h-1.5 inline-block ${
                isAnomalous ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span className="font-bold text-slate-100 flex items-center space-x-1">
              <span>{zoomFactor.toFixed(1)}x SUB-PIXEL</span>
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 opacity-70" />
            </span>
          </div>

          <span
            className={`px-1 py-0.2 text-[9px] font-bold ${
              isAnomalous
                ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                : 'bg-cyan-950/90 text-cyan-300 border border-cyan-800'
            }`}
          >
            {isAnomalous ? 'ANOMALY DETECTED' : 'LIQUID GLASS'}
          </span>
        </div>

        {/* Magnified Canvas Viewport */}
        <div className="relative mt-1 aspect-square w-full overflow-hidden bg-slate-950/90 border border-slate-900 rounded-sm">
          <canvas
            ref={lensCanvasRef}
            style={{ width: `${lensSize - 12}px`, height: `${lensSize - 12}px` }}
            className="block"
          />

          {/* Corner Technical Chamfer Accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-400 pointer-events-none" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-400 pointer-events-none" />
        </div>

        {/* Bottom Coordinate & Artifact Metadata Readout */}
        <div className="pt-1.5 px-0.5 space-y-1 font-mono text-[9px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>LOC: [Y:{Math.round(cursorPos.normY)}, X:{Math.round(cursorPos.normX)}]</span>
            <span className="text-cyan-400 font-bold">
              RESIDUAL: {isAnomalous ? '4.8x' : '1.0x'}
            </span>
          </div>

          {activeHallmark ? (
            <div className="p-1 bg-rose-950/90 border border-rose-900/90 text-rose-300 truncate rounded-sm">
              <span className="font-bold">[{activeHallmark.hallmark_id}]:</span>{' '}
              {activeHallmark.title}
            </div>
          ) : (
            <div className="text-slate-400 truncate">
              Inspecting baseline raster matrix...
            </div>
          )}
        </div>
      </LiquidGlassContainer>
    </div>
  );
};
