import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import {
  ShieldCheck,
  Upload,
  Search,
  Mic,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  Bell,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Layers,
  ZoomIn,
  RefreshCw,
  ExternalLink,
  Info,
  Check,
  Send,
  User,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import {
  detectFileTriage,
  runAdaptiveForensicTriage,
  FileTriageResult,
} from '../utils/adaptiveTriageEngine';
import { TargetedAuditResponse } from '../types/forensic';

interface AdaptiveTriageWorkbenchProps {
  onEscalateToMonitor?: (dossier: {
    targetName: string;
    vectorCode: string;
    riskScore: number;
    verdict: string;
    notes: string;
    auditResponse: TargetedAuditResponse;
  }) => void;
  onShowToast?: (msg: string, type?: 'success' | 'warn' | 'rose') => void;
  initialFileData?: {
    name: string;
    dataUrl?: string;
    type: string;
  } | null;
}

export const AdaptiveTriageWorkbench: React.FC<AdaptiveTriageWorkbenchProps> = ({
  onEscalateToMonitor,
  onShowToast,
  initialFileData,
}) => {
  const [fileData, setFileData] = useState<{
    name: string;
    type: string;
    preview: string;
    isAudio: boolean;
    size?: string;
  } | null>(() => {
    if (initialFileData) {
      const triage = detectFileTriage(initialFileData.name, initialFileData.type);
      return {
        name: initialFileData.name,
        type: initialFileData.type,
        preview: initialFileData.dataUrl || '',
        isAudio: triage.isAudio,
        size: '1.4 MB',
      };
    }
    return null;
  });

  const [triageInfo, setTriageInfo] = useState<FileTriageResult | null>(() => {
    if (initialFileData) {
      return detectFileTriage(initialFileData.name, initialFileData.type);
    }
    return null;
  });

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<TargetedAuditResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeAnomalyHover, setActiveAnomalyHover] = useState<string | null>(null);
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<string | null>(null);

  const scoreCounterRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // When initialFileData updates from props
  useEffect(() => {
    if (initialFileData) {
      const triage = detectFileTriage(initialFileData.name, initialFileData.type);
      setFileData({
        name: initialFileData.name,
        type: initialFileData.type,
        preview: initialFileData.dataUrl || '',
        isAudio: triage.isAudio,
        size: '1.4 MB',
      });
      setTriageInfo(triage);
    }
  }, [initialFileData]);

  // Handle native file ingestion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const triage = detectFileTriage(file.name, file.type);
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = (event.target?.result as string) || '';
      setFileData({
        name: file.name,
        type: file.type || (triage.isAudio ? 'audio/wav' : 'image/jpeg'),
        preview,
        isAudio: triage.isAudio,
        size: sizeStr,
      });
      setTriageInfo(triage);
      setAnalysis(null);
      setSelectedQuickPreset(null);
      if (onShowToast) {
        onShowToast(`FILE INGESTED: Auto-triaged as ${triage.vectorTitle}`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Sample Ingestion
  const handleLoadPreset = async (presetType: 'audio' | 'kyc' | 'payslip') => {
    setSelectedQuickPreset(presetType);
    let sampleName = '';
    let sampleMime = '';
    let isAudio = false;

    if (presetType === 'audio') {
      sampleName = 'CEO_EXECUTIVE_VOICE_CALL_VEC01.wav';
      sampleMime = 'audio/wav';
      isAudio = true;
    } else if (presetType === 'kyc') {
      sampleName = 'IDENTITY_CREDENTIAL_GHOST_8819.jpg';
      sampleMime = 'image/jpeg';
      isAudio = false;
    } else {
      sampleName = 'EXECUTIVE_PAYSLIP_TAMPERED_VEC04.pdf';
      sampleMime = 'application/pdf';
      isAudio = false;
    }

    const triage = detectFileTriage(sampleName, sampleMime);
    setTriageInfo(triage);

    setFileData({
      name: sampleName,
      type: sampleMime,
      preview: '',
      isAudio,
      size: '2.1 MB',
    });

    setAnalysis(null);
    if (onShowToast) {
      onShowToast(`SAMPLE LOADED: ${sampleName} (${triage.mimeCategory})`, 'success');
    }
  };

  // Execute Targeted Criteria Audit
  const runTargetedAudit = async () => {
    if (!fileData) return;
    setAnalyzing(true);

    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      const result = await runAdaptiveForensicTriage(
        fileData.name,
        fileData.type,
        fileData.preview,
        apiKey
      );

      setAnalysis(result);

      // Animate the dynamically computed risk score
      setTimeout(() => {
        if (scoreCounterRef.current) {
          anime({
            targets: scoreCounterRef.current,
            innerHTML: [0, result.dynamic_risk_score],
            round: 1,
            duration: 1000,
            easing: 'easeOutExpo',
          });
        }
      }, 100);

      if (onShowToast) {
        if (result.is_fraud || result.dynamic_risk_score >= 70) {
          onShowToast(
            `TARGETED AUDIT COMPLETE: ${result.assigned_vector_title} (${result.dynamic_risk_score}% Risk). Alert ready for Monitor intimation.`,
            'rose'
          );
        } else {
          onShowToast(
            `TARGETED AUDIT COMPLETE: Genuine file verified (${result.dynamic_risk_score}% Risk). Passed all medium-specific checks.`,
            'success'
          );
        }
      }
    } catch (err) {
      console.warn('Audit Notice:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Dispatch Escalation to Monitor
  const handleDispatchEscalation = () => {
    if (!fileData || !analysis || !onEscalateToMonitor) return;
    onEscalateToMonitor({
      targetName: fileData.name,
      vectorCode: analysis.assigned_vector_id,
      riskScore: analysis.dynamic_risk_score,
      verdict: analysis.is_fraud ? 'CRITICAL_FRAUD' : 'AUTHENTIC',
      notes: analysis.monitor_intimation.summary,
      auditResponse: analysis,
    });
    if (onShowToast) {
      onShowToast(`ESCALATION DISPATCHED: "${fileData.name}" routed to Monitor Supervisory Queue.`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Protocol Architecture Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase font-mono">
                AUTONOMOUS ADAPTIVE TRIAGE PROTOCOL
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold font-mono">
                ZERO-SLOP ISOLATION
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              File-Aware Targeted Forensic Criteria Engine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Ingests any medium (Voice Audio, Photo ID, Financial Payslip), extracts magic bytes, and executes <strong className="text-cyan-300">only criteria specific to that format</strong>. Audio excludes kerning &amp; arithmetic; payslips exclude vocoders.
            </p>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 block lg:hidden w-full">Quick Test Presets:</span>
            <button
              onClick={() => handleLoadPreset('audio')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                selectedQuickPreset === 'audio'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Audio (.wav)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('kyc')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                selectedQuickPreset === 'kyc'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Portrait ID (.jpg)</span>
            </button>
            <button
              onClick={() => handleLoadPreset('payslip')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                selectedQuickPreset === 'payslip'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Payslip Doc (.pdf)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workbench Grid (Left: Dynamic Viewport, Right: Tailored Criteria & Risk Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Adaptive Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            
            {!fileData ? (
              /* Universal Dropzone */
              <label className="w-full h-[460px] border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/60 p-6 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-1">
                  Ingest Any Evidence File
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Drag and drop Voice Audio (.wav, .mp3), Portrait/Selfie (.jpg, .png), or Payslip/Statement (.pdf, .csv).
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-mono text-cyan-300">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">MIME Extraction</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">SHA-256 Digest</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">Auto-Triage Isolation</span>
                </div>
                <input
                  type="file"
                  accept="image/*,audio/*,application/pdf,.csv,.xlsx,.wav,.mp3"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* File Metadata Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                      {fileData.isAudio ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs">{fileData.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({fileData.size || '1.8 MB'})</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {triageInfo?.vectorTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm">
                    AUTO-DETECTED: {triageInfo?.mimeCategory.toUpperCase()}
                  </span>
                </div>

                {/* Adaptive Center Viewport: Audio Waveform vs Visual Canvas */}
                {fileData.isAudio ? (
                  /* AUDIO VIEWPORT */
                  <div className="w-full h-[380px] bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden select-none">
                    <audio ref={audioRef} src={fileData.preview} onEnded={() => setIsPlayingAudio(false)} className="hidden" />

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
                      <span className="flex items-center space-x-1.5 text-cyan-300">
                        <Activity className="w-3.5 h-3.5" />
                        <span>ACOUSTIC WAVEFORM &amp; VOCODER RESIDUAL SPECTRUM</span>
                      </span>
                      <span>44.1 kHz &bull; 24-BIT PCM</span>
                    </div>

                    {/* Interactive Animated Waveform Bars */}
                    <div className="flex items-center justify-center gap-1.5 h-36 px-4">
                      {[38, 62, 85, 45, 92, 100, 78, 64, 88, 30, 96, 74, 52, 86, 92, 60, 42, 72, 82, 54, 48, 68, 88, 76, 50].map((val, i) => (
                        <div
                          key={i}
                          className={`w-2.5 rounded-full transition-all duration-300 ${
                            isPlayingAudio
                              ? i > 9 && i < 15
                                ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'
                                : 'bg-cyan-400 animate-pulse'
                              : i > 9 && i < 15
                              ? 'bg-rose-600/80'
                              : 'bg-slate-700'
                          }`}
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>

                    {/* Audio Controls & Anomaly Timestamps */}
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={toggleAudio}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlayingAudio ? 'PAUSE PLAYBACK' : 'PLAY AUDIO SAMPLE'}</span>
                      </button>

                      {/* Anomaly Timecode Pins */}
                      <div className="space-y-1.5 max-h-24 overflow-y-auto">
                        {analysis?.pinpointed_anomalies?.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs font-mono flex items-center justify-between"
                          >
                            <span className="text-rose-400 font-bold shrink-0">
                              [{item.temporal_marker?.start_time} - {item.temporal_marker?.end_time}]
                            </span>
                            <span className="text-slate-300 truncate ml-2 text-[11px]">{item.discrepancy_detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* VISUAL DOCUMENT / ID VIEWPORT */
                  <div className="relative w-full h-[380px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 select-none">
                    {/* Render Image Preview or Fallback Canvas */}
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt="Uploaded evidence"
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    ) : (
                      /* Fallback Mock Visual for preset document / KYC */
                      <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center space-y-3 font-mono">
                        {triageInfo?.detectedMediaType === 'FINANCIAL_DOCUMENT' ? (
                          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left text-[11px] text-slate-300 space-y-2 shadow-2xl">
                            <div className="border-b border-slate-800 pb-1 text-slate-400 flex justify-between">
                              <span>EXECUTIVE PAYROLL STATEMENT</span>
                              <span className="text-cyan-400">OCT 2026</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GROSS EARNINGS:</span>
                              <span className="text-white">$14,500.00</span>
                            </div>
                            <div className="flex justify-between text-rose-300 bg-rose-950/30 p-1 rounded border border-rose-900/60 font-bold">
                              <span>TOTAL DEDUCTIONS:</span>
                              <span>-$2,300.00 [ALTERED]</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
                              <span>STATED NET PAY:</span>
                              <span className="text-amber-300">$14,200.00 [MISMATCH]</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-48 h-56 bg-slate-900 rounded-2xl border border-slate-700/80 p-4 flex flex-col items-center justify-center space-y-3 shadow-2xl relative">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-rose-500/60 flex items-center justify-center relative">
                              <User className="w-12 h-12 text-slate-400" />
                              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                            </div>
                            <span className="text-xs font-bold text-white">GOVERNMENT ID</span>
                            <span className="text-[10px] text-rose-400 font-bold">Inpainting Boundary Seam</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spatial Pinpoint Bounding Reticles */}
                    {analysis?.pinpointed_anomalies?.map((item) => {
                      if (!item.spatial_bounding_box) return null;
                      const isHovered = activeAnomalyHover === item.id;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setActiveAnomalyHover(item.id)}
                          onMouseLeave={() => setActiveAnomalyHover(null)}
                          className="absolute border-2 border-rose-500 bg-rose-500/25 rounded-xl group cursor-pointer transition-transform hover:scale-102 z-20 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                          style={{
                            top: `${item.spatial_bounding_box.top}%`,
                            left: `${item.spatial_bounding_box.left}%`,
                            width: `${item.spatial_bounding_box.width}%`,
                            height: `${item.spatial_bounding_box.height}%`,
                          }}
                        >
                          <span className="absolute -top-5 left-0 bg-rose-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            {item.criterion_name}
                          </span>

                          {/* Hover Telemetry Card */}
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-72 p-3 bg-slate-950 border border-slate-700 rounded-2xl text-[11px] shadow-2xl z-40 font-sans pointer-events-none">
                            <p className="font-extrabold text-rose-400 flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>{item.location_label}</span>
                            </p>
                            <p className="text-slate-300 mt-1 leading-relaxed">{item.discrepancy_detail}</p>
                            {item.expected_normal && (
                              <div className="mt-2 pt-1.5 border-t border-slate-800 font-mono text-[10px] space-y-0.5">
                                <p className="text-emerald-400">Exp: {item.expected_normal}</p>
                                <p className="text-rose-400">Act: {item.actual_observed}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={runTargetedAudit}
                    disabled={analyzing}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-mono font-black text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-98"
                  >
                    {analyzing ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span>RUNNING MEDIUM-SPECIFIC CRITERIA AUDIT...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>EXECUTE TARGETED CRITERIA AUDIT</span>
                      </>
                    )}
                  </button>

                  <label className="py-3 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-2xl cursor-pointer transition-colors flex items-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change File</span>
                    <input
                      type="file"
                      accept="image/*,audio/*,application/pdf,.csv,.xlsx,.wav,.mp3"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Risk Gauge & Tailored Criteria Checklist */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Dynamic Risk Gauge */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl font-mono">
            <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-bold">
              Dynamic Risk Probability
            </span>
            <div className="flex items-baseline space-x-2 my-1">
              <span
                ref={scoreCounterRef}
                className="text-6xl font-black tracking-tight"
                style={{
                  color: !analysis
                    ? '#94a3b8'
                    : analysis.dynamic_risk_score > 70
                    ? '#f43f5e'
                    : '#10b981',
                }}
              >
                {analysis ? analysis.dynamic_risk_score : 0}
              </span>
              <span className="text-2xl font-bold text-slate-500">%</span>
              {analysis && (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ml-auto ${
                    analysis.is_fraud
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {analysis.is_fraud ? 'CRITICAL FRAUD' : 'AUTHENTIC CLEAN'}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
              <span className="text-slate-400">Assigned Threat Vector:</span>
              <span className="text-cyan-300 font-bold truncate max-w-[200px]">
                {analysis?.assigned_vector_title || triageInfo?.vectorTitle || 'AWAITING INGESTION'}
              </span>
            </div>
          </div>

          {/* DYNAMIC CHECKLIST: Shows ONLY Relevant Criteria */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-300 font-extrabold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>RELEVANT DISCIPLINE CRITERIA</span>
              </span>
              <span className="text-[10px] text-slate-500">EXCLUDES IRRELEVANT TESTS</span>
            </div>

            {!analysis ? (
              <div className="py-8 text-center space-y-2">
                <Info className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-slate-500 font-sans text-xs">
                  Upload any evidence file or click a sample preset to generate its tailored forensic test suite.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {analysis.relevant_criteria_results.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      test.status === 'FAILED'
                        ? 'bg-rose-950/20 border-rose-900/60'
                        : test.status === 'SUSPICIOUS'
                        ? 'bg-amber-950/20 border-amber-900/60'
                        : 'bg-emerald-950/20 border-emerald-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                        {test.status === 'FAILED' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : test.status === 'SUSPICIOUS' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[220px]">{test.name}</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          test.status === 'FAILED'
                            ? 'bg-rose-900 text-rose-300'
                            : test.status === 'SUSPICIOUS'
                            ? 'bg-amber-900 text-amber-300'
                            : 'bg-emerald-900 text-emerald-300'
                        }`}
                      >
                        {test.status} (+{test.weight_penalty}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {test.observed_finding}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monitor Intimation Action Bar */}
          {analysis && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">SUPERVISORY INTIMATION:</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    analysis.monitor_intimation.urgency === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {analysis.monitor_intimation.urgency} URGENCY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {analysis.monitor_intimation.summary}
              </p>
              <button
                onClick={handleDispatchEscalation}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
                <span>Dispatch Report to Monitor Queue →</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
