import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import anime from 'animejs';
import { ForensicHallmark, PresetScenario } from '../types/forensic';
import { renderDocumentToCanvas } from '../utils/documentRenderers';
import { generateELACanvasElement } from '../utils/elaGenerator';
import { MagnificationLens } from './MagnificationLens';
import { LiquidGlassContainer } from './LiquidGlass';
import {
  Scan,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  AlertTriangle,
  Upload,
  Binary,
  Target,
  FileSearch,
  Crosshair,
  Search,
  Sliders,
} from 'lucide-react';

interface DualViewCanvasProps {
  preset: PresetScenario;
  selectedHallmarkId: string | null;
  onSelectHallmark: (hallmarkId: string | null) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
  onUploadCustomFile?: (file: File) => void;
}

type ViewMode = 'original' | 'ela' | 'composite';

export const DualViewCanvas: React.FC<DualViewCanvasProps> = ({
  preset,
  selectedHallmarkId,
  onSelectHallmark,
  isScanning,
  onTriggerScan,
  onUploadCustomFile,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredHallmarkId, setHoveredHallmarkId] = useState<string | null>(null);
  const [elaImageDataUrl, setElaImageDataUrl] = useState<string | null>(null);
  const [isGeneratingEla, setIsGeneratingEla] = useState<boolean>(false);

  // High-Resolution Magnification Lens State
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);
  const [activeHoveredAnomaly, setActiveHoveredAnomaly] = useState<ForensicHallmark | null>(null);
  const [lensMode, setLensMode] = useState<'auto' | 'always' | 'off'>('auto');
  const [lensZoomFactor, setLensZoomFactor] = useState<number>(2.0);
  const [lensEnhancementMode, setLensEnhancementMode] = useState<'subpixel' | 'dct_grid' | 'high_contrast'>('subpixel');
  const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null);
  const [canvasBounds, setCanvasBounds] = useState<DOMRect | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const reticleRefs = useRef<Map<string, SVGGElement>>(new Map());
  const animeLaserRef = useRef<anime.AnimeInstance | null>(null);
  const animeReticlesRef = useRef<anime.AnimeInstance[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Render document to canvas on preset change
  const renderSource = useCallback(() => {
    if (!canvasRef.current) return;
    renderDocumentToCanvas(preset.id, canvasRef.current, selectedHallmarkId);
  }, [preset.id, selectedHallmarkId]);

  // Generate ELA when needed
  const computeELA = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsGeneratingEla(true);
    try {
      const res = await generateELACanvasElement(canvasRef.current, 22, 0.72);
      setElaImageDataUrl(res.dataUrl);
      elaCanvasRef.current = res.canvas;
    } catch (err) {
      console.error('ELA generation error:', err);
    } finally {
      setIsGeneratingEla(false);
    }
  }, []);

  useEffect(() => {
    renderSource();
    computeELA();
  }, [renderSource, computeELA]);

  // Anime.js Laser Scanning Pass
  useEffect(() => {
    if (animeLaserRef.current) {
      animeLaserRef.current.pause();
      animeLaserRef.current = null;
    }

    if (isScanning && laserRef.current && containerRef.current) {
      const containerHeight = containerRef.current.clientHeight || 480;

      animeLaserRef.current = anime({
        targets: laserRef.current,
        translateY: [0, containerHeight - 12],
        easing: 'easeInOutQuad',
        duration: 1500,
        direction: 'alternate',
        loop: true,
      });
    }

    return () => {
      if (animeLaserRef.current) {
        animeLaserRef.current.pause();
        animeLaserRef.current = null;
      }
    };
  }, [isScanning]);

  // Anime.js Tamper Coordinate Reticles
  useEffect(() => {
    animeReticlesRef.current.forEach((instance) => {
      try {
        instance.pause();
      } catch {
        // ignore
      }
    });
    animeReticlesRef.current = [];

    reticleRefs.current.forEach((el) => {
      if (!el) return;

      const anim = anime({
        targets: el,
        scale: [0.97, 1.04],
        opacity: [0.8, 1],
        easing: 'easeInOutSine',
        duration: 1300,
        direction: 'alternate',
        loop: true,
      });

      animeReticlesRef.current.push(anim);
    });

    return () => {
      animeReticlesRef.current.forEach((instance) => {
        try {
          instance.pause();
        } catch {
          // ignore
        }
      });
      animeReticlesRef.current = [];
    };
  }, [preset.payload.forensic_hallmarks, viewMode]);

  // Visual hallmarks with bounding boxes [ymin, xmin, ymax, xmax]
  const visualHallmarks = preset.payload.forensic_hallmarks.filter(
    (h): h is ForensicHallmark & { bounding_box_2d: [number, number, number, number] } =>
      h.bounding_box_2d !== null && Array.isArray(h.bounding_box_2d)
  );

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.2, Math.max(0.7, prev + delta)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustomFile) {
      onUploadCustomFile(file);
    }
  };

  // Mouse move tracking for high-resolution magnification lens
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canvasRef.current) return;
    const contRect = containerRef.current.getBoundingClientRect();
    const canRect = canvasRef.current.getBoundingClientRect();

    setContainerBounds(contRect);
    setCanvasBounds(canRect);

    const clientX = e.clientX - contRect.left;
    const clientY = e.clientY - contRect.top;

    // Check if cursor is on the canvas viewport
    const withinCanvas =
      e.clientX >= canRect.left &&
      e.clientX <= canRect.right &&
      e.clientY >= canRect.top &&
      e.clientY <= canRect.bottom;

    if (!withinCanvas) {
      setCursorPos(null);
      setActiveHoveredAnomaly(null);
      return;
    }

    // Normalized [0, 1000] coordinates on the canvas
    const normX = ((e.clientX - canRect.left) / canRect.width) * 1000;
    const normY = ((e.clientY - canRect.top) / canRect.height) * 1000;

    setCursorPos({ x: clientX, y: clientY, normX, normY });

    // Check if cursor is hovering over any marked anomaly bounding box
    const foundAnomaly = visualHallmarks.find((h) => {
      const [ymin, xmin, ymax, xmax] = h.bounding_box_2d;
      // Proximity margin of 25 units for seamless engagement
      return (
        normX >= xmin - 25 &&
        normX <= xmax + 25 &&
        normY >= ymin - 25 &&
        normY <= ymax + 25
      );
    });

    setActiveHoveredAnomaly(foundAnomaly || null);
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
    setActiveHoveredAnomaly(null);
  };

  // Active source canvas to feed the lens
  const activeLensCanvas =
    viewMode === 'ela' && elaCanvasRef.current ? elaCanvasRef.current : canvasRef.current;

  // Decide if magnification lens should be displayed
  const shouldRenderLens =
    (lensMode === 'always' || (lensMode === 'auto' && activeHoveredAnomaly !== null)) &&
    cursorPos !== null &&
    activeLensCanvas !== null;

  const cycleZoom = () => {
    setLensZoomFactor((prev) => {
      if (prev === 2.0) return 3.0;
      if (prev === 3.0) return 4.0;
      return 2.0;
    });
  };

  const toggleLensMode = () => {
    setLensMode((prev) => {
      if (prev === 'auto') return 'always';
      if (prev === 'always') return 'off';
      return 'auto';
    });
  };

  const toggleEnhancementMode = () => {
    setLensEnhancementMode((prev) => (prev === 'subpixel' ? 'dct_grid' : 'subpixel'));
  };

  return (
    <div className="flex flex-col h-full rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_16px_48px_rgba(15,30,60,0.06)] overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-xl border-b border-white/50 gap-3 text-xs">
        {/* Left: Mode Selection (Clean Segmented Control) */}
        <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original Source</span>
          </button>

          <button
            onClick={() => setViewMode('ela')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              viewMode === 'ela'
                ? 'bg-white text-rose-600 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-rose-500" />
            <span>Pixel ELA Heatmap</span>
          </button>

          <button
            onClick={() => setViewMode('composite')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              viewMode === 'composite'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Composite Overlay</span>
          </button>
        </div>

        {/* Center: Precision Loupe Controls Bar */}
        <div className="flex items-center space-x-1 bg-white/80 p-1 rounded-2xl border border-white/90 shadow-xs text-xs">
          {/* Loupe Mode Toggle */}
          <button
            onClick={toggleLensMode}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              lensMode === 'off'
                ? 'text-slate-400 hover:text-slate-600'
                : 'bg-slate-950 text-white font-bold shadow-xs'
            }`}
            title="Click to toggle Loupe: AUTO (triggers on anomalies) / ALWAYS ON / OFF"
          >
            <Search className="w-3.5 h-3.5" />
            <span>
              Lens: {lensMode === 'auto' ? 'Auto' : lensMode === 'always' ? 'On' : 'Off'}
            </span>
          </button>

          {/* Zoom Factor Selector */}
          <button
            onClick={cycleZoom}
            disabled={lensMode === 'off'}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            title="Cycle magnification factor"
          >
            <span className="font-semibold">{lensZoomFactor.toFixed(1)}x</span>
          </button>

          {/* Sub-Pixel Enhancement Mode Toggle */}
          <button
            onClick={toggleEnhancementMode}
            disabled={lensMode === 'off'}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            title="Toggle between Sub-pixel edge enhancement and 8x8 DCT grid visualizer"
          >
            <span>{lensEnhancementMode === 'subpixel' ? 'Subpixel' : 'DCT 8x8'}</span>
          </button>
        </div>

        {/* Right: Technical Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/80 border border-white/90 rounded-xl px-1.5 py-0.5 text-xs text-slate-600 shadow-xs">
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 min-w-[38px] text-center font-semibold text-[11px]">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-slate-900 transition-colors ml-1 border-l border-slate-200 cursor-pointer"
              title="Reset Zoom"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Trigger Scan Pass Button (Obsidian Pill) */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isScanning
                ? 'bg-slate-200 text-slate-500'
                : 'bg-slate-950 hover:bg-slate-850 text-white shadow-slate-950/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Pass'}</span>
          </button>
        </div>
      </div>

      {/* Upload file trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Forensic Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 min-h-[480px] overflow-hidden flex items-center justify-center p-4 bg-slate-950 select-none cursor-crosshair"
      >
        {/* Engineering Crosshair Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Laser Scanning Bar */}
        <div
          ref={laserRef}
          className={`absolute left-0 right-0 z-30 pointer-events-none transition-opacity duration-200 ${
            isScanning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ top: 0, height: '3px' }}
        >
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-laser shadow-[0_0_15px_#22d3ee]" />
          <div className="w-full h-10 bg-gradient-to-b from-cyan-400/20 to-transparent pointer-events-none" />
          <div className="absolute right-4 -top-6 px-2 py-0.5 bg-slate-950 border border-cyan-500 text-cyan-300 text-[10px] font-mono">
            PASS: DCT SCAN FREQ 48.2 kHz
          </div>
        </div>

        {/* Canvas & Overlay Wrapper */}
        <div
          className="relative transition-transform duration-200 origin-center max-w-full max-h-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Source Document Canvas */}
          <canvas
            ref={canvasRef}
            className={`border border-slate-800 shadow-2xl block max-h-[68vh] w-auto transition-opacity duration-300 ${
              viewMode === 'ela' ? 'opacity-0 absolute inset-0' : 'opacity-100'
            }`}
          />

          {/* ELA Heatmap Image Overlay */}
          {viewMode === 'ela' && elaImageDataUrl && (
            <img
              src={elaImageDataUrl}
              alt="Error Level Analysis Compression Heatmap"
              className="border border-rose-900 block max-h-[68vh] w-auto shadow-2xl"
            />
          )}

          {/* Composite Overlay Mode */}
          {viewMode === 'composite' && elaImageDataUrl && (
            <img
              src={elaImageDataUrl}
              alt="Composite ELA"
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
            />
          )}

          {/* Coordinate Reticles Layer (Normalized [0, 1000] scale) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="reticle-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {visualHallmarks.map((hallmark) => {
              const [ymin, xmin, ymax, xmax] = hallmark.bounding_box_2d;
              const boxW = xmax - xmin;
              const boxH = ymax - ymin;
              const isSelected = selectedHallmarkId === hallmark.hallmark_id;
              const isHovered = hoveredHallmarkId === hallmark.hallmark_id || activeHoveredAnomaly?.hallmark_id === hallmark.hallmark_id;
              const isCritical = hallmark.severity === 'CRITICAL';
              const strokeColor = isCritical ? '#f43f5e' : '#f59e0b';

              return (
                <g
                  key={hallmark.hallmark_id}
                  ref={(el) => {
                    if (el) reticleRefs.current.set(hallmark.hallmark_id, el);
                    else reticleRefs.current.delete(hallmark.hallmark_id);
                  }}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => onSelectHallmark(isSelected ? null : hallmark.hallmark_id)}
                  onMouseEnter={() => setHoveredHallmarkId(hallmark.hallmark_id)}
                  onMouseLeave={() => setHoveredHallmarkId(null)}
                >
                  {/* Bounding Box Frame */}
                  <rect
                    x={xmin}
                    y={ymin}
                    width={boxW}
                    height={boxH}
                    fill={isSelected || isHovered ? (isCritical ? 'rgba(244, 63, 94, 0.18)' : 'rgba(245, 158, 11, 0.18)') : 'transparent'}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isHovered ? 3.5 : 2}
                    strokeDasharray={isSelected ? undefined : '6 4'}
                    filter="url(#reticle-glow)"
                  />

                  {/* High-Precision Corner Brackets */}
                  <path
                    d={`M ${xmin - 4} ${ymin + 14} L ${xmin - 4} ${ymin - 4} L ${xmin + 14} ${ymin - 4}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M ${xmax + 4} ${ymin + 14} L ${xmax + 4} ${ymin - 4} L ${xmax - 14} ${ymin - 4}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M ${xmin - 4} ${ymax - 14} L ${xmin - 4} ${ymax + 4} L ${xmin + 14} ${ymax + 4}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M ${xmax + 4} ${ymax - 14} L ${xmax + 4} ${ymax + 4} L ${xmax - 14} ${ymax + 4}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />

                  {/* Pulsating Center Reticle */}
                  <circle
                    cx={xmin + boxW / 2}
                    cy={ymin + boxH / 2}
                    r={isSelected ? 12 : 8}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="reticle-pulsing"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Bounding Box Badges */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {visualHallmarks.map((hallmark) => {
              const [ymin, xmin, ymax, xmax] = hallmark.bounding_box_2d;
              const isSelected = selectedHallmarkId === hallmark.hallmark_id;
              const isHovered = hoveredHallmarkId === hallmark.hallmark_id || activeHoveredAnomaly?.hallmark_id === hallmark.hallmark_id;
              const isCritical = hallmark.severity === 'CRITICAL';

              const leftPct = (xmin / 1000) * 100;
              const topPct = (ymin / 1000) * 100;

              return (
                <div
                  key={hallmark.hallmark_id}
                  style={{
                    left: `${leftPct}%`,
                    top: `${Math.max(2, topPct - 5)}%`,
                  }}
                  className={`absolute pointer-events-auto transform -translate-y-full transition-all duration-150 ${
                    isSelected || isHovered ? 'scale-105 z-40' : 'z-20 opacity-95'
                  }`}
                >
                  <button
                    onClick={() => onSelectHallmark(isSelected ? null : hallmark.hallmark_id)}
                    className={`flex items-center space-x-1.5 px-2 py-0.5 text-[10px] font-mono font-bold border shadow-lg ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border-rose-500'
                        : 'bg-amber-950 text-amber-300 border-amber-500'
                    }`}
                  >
                    <Crosshair className="w-3 h-3 text-cyan-400" />
                    <span>[{hallmark.hallmark_id}]</span>
                    <span className="text-[9px] opacity-75">
                      {hallmark.category.slice(0, 4)}
                    </span>
                  </button>

                  {/* Expanded Technical Inspection Callout */}
                  {(isSelected || isHovered) && (
                    <div className="mt-1 w-64 p-2.5 bg-slate-950 border border-slate-700 shadow-2xl text-left text-xs font-mono">
                      <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="truncate pr-1">{hallmark.title}</span>
                        <span className={`text-[9px] px-1 font-bold ${
                          isCritical ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {hallmark.severity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                        {hallmark.finding_detail}
                      </div>
                      <div className="text-[9px] text-cyan-400 mt-2 flex justify-between border-t border-slate-800/80 pt-1">
                        <span>COORDS: [{ymin}, {xmin}, {ymax}, {xmax}]</span>
                        <span>CONF: {Math.round((hallmark.confidence || 0.95) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Resolution Magnification Lens Overlay */}
        {shouldRenderLens && (
          <MagnificationLens
            sourceCanvas={activeLensCanvas}
            cursorPos={cursorPos}
            activeHallmark={activeHoveredAnomaly}
            zoomFactor={lensZoomFactor}
            enhancementMode={lensEnhancementMode}
            containerBounds={containerBounds}
            canvasBounds={canvasBounds}
          />
        )}

        {/* ELA calculation indicator */}
        {isGeneratingEla && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-40">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>COMPUTING DCT NOISE RESIDUAL HEATMAP...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Forensic Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-300">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>RENDER VIEW: {viewMode.toUpperCase()}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>DETECTED HALLMARKS: <strong className="text-slate-200">{preset.payload.forensic_hallmarks.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-cyan-400 flex items-center space-x-1">
            <Search className="w-3 h-3" />
            <span>
              SUB-PIXEL LOUPE: {activeHoveredAnomaly ? `ENGAGED (${activeHoveredAnomaly.hallmark_id})` : lensMode.toUpperCase()}
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500">DIGEST:</span>
          <span className="text-slate-300 select-all font-mono text-[10px]">
            SHA256:{preset.payload.metadata_fingerprint.sha256?.slice(0, 20)}...
          </span>
        </div>
      </div>
    </div>
  );
};
