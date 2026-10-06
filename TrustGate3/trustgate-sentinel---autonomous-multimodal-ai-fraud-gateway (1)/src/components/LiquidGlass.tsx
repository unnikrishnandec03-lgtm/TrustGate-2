import React, { useEffect, useRef, useState } from 'react';
import { LiquidGlassEngine, LiquidGlassOptions } from '../lib/liquidGlass';

export interface LiquidGlassProps extends LiquidGlassOptions {
  children?: React.ReactNode;
  className?: string;
  sourceCanvas?: HTMLCanvasElement | null;
  interactive?: boolean;
}

export const LiquidGlassContainer: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  sourceCanvas = null,
  borderRadius = 16,
  type = 'rounded',
  tintOpacity = 0.2,
  tintColor = '#06b6d4',
  blurAmount = 2.0,
  refraction = 0.6,
  chromaticAberration = 0.35,
  rippleEffect = 0.4,
  cornerBoost = 0.25,
  edgeIntensity = 0.3,
  rimIntensity = 0.7,
  baseIntensity = 0.2,
  warp = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LiquidGlassEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new LiquidGlassEngine(canvasRef.current, {
      borderRadius,
      type,
      tintOpacity,
      tintColor,
      blurAmount,
      refraction,
      chromaticAberration,
      rippleEffect,
      cornerBoost,
      edgeIntensity,
      rimIntensity,
      baseIntensity,
      warp,
    });
    engineRef.current = engine;

    const updateDimensions = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(Math.floor(rect.width * dpr), 10);
      const h = Math.max(Math.floor(rect.height * dpr), 10);

      engine.resize(w, h);
      engine.render(sourceCanvas);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [
    borderRadius,
    type,
    tintOpacity,
    tintColor,
    blurAmount,
    refraction,
    chromaticAberration,
    rippleEffect,
    cornerBoost,
    edgeIntensity,
    rimIntensity,
    baseIntensity,
    warp,
    sourceCanvas,
  ]);

  // Re-render when sourceCanvas changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.render(sourceCanvas);
    }
  }, [sourceCanvas]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius:
          type === 'circle' ? '9999px' : type === 'pill' ? '9999px' : `${borderRadius}px`,
      }}
    >
      {/* WebGL Liquid Glass Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
        style={{
          borderRadius:
            type === 'circle' ? '9999px' : type === 'pill' ? '9999px' : `${borderRadius}px`,
        }}
      />

      {/* Content Layer with Backdrop Filter Enhancement */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
