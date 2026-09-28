import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Camera,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { InferenceResponse, BoundingBox, Remedy } from '../types';
import { TreatmentPlanModal } from '../components/treatment/TreatmentPlanModal';

export const ScanPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'upload' ? 'upload' : 'camera';

  const [mode, setMode] = useState<'camera' | 'upload'>(initialMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanning loop states
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isInFlight, setIsInFlight] = useState<boolean>(false);
  const [lastInferenceTime, setLastInferenceTime] = useState<number | null>(null);

  // Results
  const [currentResult, setCurrentResult] = useState<InferenceResponse | null>(null);
  const [frozenFrameDataUrl, setFrozenFrameDataUrl] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Video & Canvas DOM references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access failed', err);
      setCameraError(
        'Unable to access camera. Please verify camera permissions in your browser or switch to Photo Upload mode.'
      );
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Manage camera lifecycle based on active mode
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  // Flip camera between front and environment
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Perform single frame capture & inference request
  const captureAndInferFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isInFlight || !isScanning) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const canvas = canvasRef.current;
    // Standardize offscreen processing resolution to 640x480
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setIsInFlight(true);
    const startTime = Date.now();

    try {
      const res = await api.post<InferenceResponse>('/api/inference/frame', {
        mime_type: 'image/jpeg',
        encoding: 'base64',
        image_b64: dataUrl,
        capture_timestamp: new Date().toISOString(),
      });

      setCurrentResult(res.data);
      setFrozenFrameDataUrl(dataUrl);
      setIsSaved(false); // Reset saved state for new frame
      setSaveMessage(null);
      setLastInferenceTime(Date.now() - startTime);
    } catch (err: any) {
      console.warn('Frame inference cycle skipped or rate limited', err.response?.status);
    } finally {
      setIsInFlight(false);
    }
  }, [isInFlight, isScanning]);

  // 1.5s scanning loop with in-flight guard
  useEffect(() => {
    if (mode === 'camera' && cameraActive && isScanning) {
      scanIntervalRef.current = setInterval(captureAndInferFrame, 1500);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [mode, cameraActive, isScanning, captureAndInferFrame]);

  // Handle Manual File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!file.type.match(/image\/(jpeg|png)/)) {
      alert('Only JPEG and PNG foliage images are supported.');
      return;
    }

    setLastUploadedFile(file);
    setIsInFlight(true);
    setIsSaved(false);
    setSaveMessage(null);

    // Read for preview
    const reader = new FileReader();
    reader.onload = () => {
      setFrozenFrameDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    const startTime = Date.now();
    try {
      const res = await api.post<InferenceResponse>('/api/inference/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCurrentResult(res.data);
      setLastInferenceTime(Date.now() - startTime);
    } catch (err: any) {
      alert('Failed to analyze uploaded foliage image. ' + (err.response?.data?.detail || ''));
    } finally {
      setIsInFlight(false);
    }
  };

  // Explicitly Save Confirmed Diagnosis to History (POST /api/history)
  const handleSaveDiagnosis = async () => {
    if (!currentResult) return;

    setIsSaving(true);
    try {
      await api.post('/api/history', {
        disease_id: currentResult.disease_name.toLowerCase().includes('healthy')
          ? 'healthy_leaf'
          : String(currentResult.disease_id),
        disease_name: currentResult.disease_name,
        confidence_score: currentResult.confidence_score,
        s3_storage_uri: currentResult.s3_storage_uri || null,
        bounding_box: currentResult.bounding_box || null,
      });

      setIsSaved(true);
      setSaveMessage('Diagnosis logged successfully to farm history!');

      // Trigger celebratory confetti for positive action
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#22c55e', '#16a34a', '#86efac'],
        });
      } catch {
        // Confetti optional
      }
    } catch (err: any) {
      setSaveMessage('Failed to persist diagnosis record: ' + (err.response?.data?.detail || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Status computation against tau = 0.55 threshold
  const isHealthy = currentResult?.disease_name?.toLowerCase().includes('healthy');
  const isUncertain = currentResult?.is_healthy_or_uncertain && !isHealthy;
  const isConfirmedInfection = currentResult && !currentResult.is_healthy_or_uncertain && !isHealthy;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* Hidden Offscreen Canvas for preprocessing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header / Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-agri-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Edge Diagnostic Suite</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Foliage Lesion Scanner</h1>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'camera'
                  ? 'bg-agri-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-agri-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Main Work Area: Scanner Viewport (Left) + Diagnosis Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-[4/3] flex items-center justify-center">
              {mode === 'camera' ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Bounding Box / Two-layer Localization Overlay */}
                  {currentResult?.bounding_box && (
                    <div
                      className={`absolute pointer-events-none transition-all duration-300 rounded-lg border-2 ${
                        isConfirmedInfection
                          ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : isHealthy
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-amber-500 bg-amber-500/10'
                      }`}
                      style={{
                        left: `${currentResult.bounding_box.x_min * 100}%`,
                        top: `${currentResult.bounding_box.y_min * 100}%`,
                        width: `${(currentResult.bounding_box.x_max - currentResult.bounding_box.x_min) * 100}%`,
                        height: `${(currentResult.bounding_box.y_max - currentResult.bounding_box.y_min) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/90 text-white border border-slate-700 whitespace-nowrap shadow-sm">
                        Lesion ROI: {(currentResult.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}

                  {/* Scanning Radar Line */}
                  {isScanning && !isInFlight && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-agri-400 to-transparent animate-radar pointer-events-none" />
                  )}

                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-auto">
                    <button
                      onClick={() => setIsScanning(!isScanning)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur shadow-lg transition-all touch-target ${
                        isScanning
                          ? 'bg-slate-900/80 text-amber-400 border border-amber-500/40 hover:bg-slate-900'
                          : 'bg-agri-600 text-white hover:bg-agri-500'
                      }`}
                    >
                      {isScanning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Stream</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Resume Stream</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={toggleFacingMode}
                      className="p-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 backdrop-blur hover:bg-slate-800 transition-colors touch-target"
                      title="Flip camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Upload Mode Viewport */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  {frozenFrameDataUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={frozenFrameDataUrl}
                        alt="Uploaded leaf"
                        className="max-h-full max-w-full object-contain rounded-2xl"
                      />
                      {currentResult?.bounding_box && (
                        <div
                          className={`absolute pointer-events-none rounded-lg border-2 ${
                            isConfirmedInfection
                              ? 'border-red-500 bg-red-500/20'
                              : isHealthy
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-amber-500 bg-amber-500/20'
                          }`}
                          style={{
                            left: `${currentResult.bounding_box.x_min * 100}%`,
                            top: `${currentResult.bounding_box.y_min * 100}%`,
                            width: `${(currentResult.bounding_box.x_max - currentResult.bounding_box.x_min) * 100}%`,
                            height: `${(currentResult.bounding_box.y_max - currentResult.bounding_box.y_min) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center space-y-3 p-8 border-2 border-dashed border-slate-700 rounded-3xl hover:border-agri-500 hover:bg-slate-900/50 transition-all">
                      <div className="w-16 h-16 rounded-2xl bg-agri-950 text-agri-400 flex items-center justify-center border border-agri-800">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-base font-bold text-white">Upload Groundnut Foliage Photo</div>
                        <p className="text-xs text-slate-400">JPEG or PNG magic-byte verified</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Status Pill overlay on top left */}
              <div className="absolute top-4 left-4 pointer-events-none flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide backdrop-blur border flex items-center space-x-1.5 ${
                    isInFlight
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isInFlight ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{isInFlight ? 'Inference...' : isScanning ? '1.5s Stream Active' : 'Stream Paused'}</span>
                </span>
                {lastInferenceTime && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900/80 text-slate-400 border border-slate-700">
                    {lastInferenceTime}ms
                  </span>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Camera Connection Issue</div>
                  <div>{cameraError}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Diagnosis Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-white">Diagnostic Reading</h2>
                  <p className="text-[11px] text-slate-400">Calibrated against τ = 0.55 floor</p>
                </div>

                {currentResult && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isHealthy
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : isConfirmedInfection
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : 'bg-amber-950 text-amber-300 border-amber-600'
                    }`}
                  >
                    {isHealthy ? 'Healthy' : isConfirmedInfection ? 'Infection' : 'Uncertain'}
                  </span>
                )}
              </div>

              {currentResult ? (
                <div className="space-y-6">
                  {/* Primary Disease Card */}
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Identified Condition
                    </div>
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {currentResult.disease_name}
                    </div>
                    {currentResult.scientific_name && (
                      <div className="text-xs italic text-agri-400 font-mono">
                        {currentResult.scientific_name}
                      </div>
                    )}
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">Model Diagnostic Confidence</span>
                      <span className="font-mono text-agri-400 text-sm font-bold">
                        {(currentResult.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                      {/* Threshold Marker at 55% */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: '55%' }}
                        title="Calibration Threshold (τ = 0.55)"
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentResult.confidence_score >= 0.55 ? 'bg-agri-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, currentResult.confidence_score * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>0%</span>
                      <span className="text-slate-300">τ = 55% floor</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Calibration Advice Notice */}
                  {isUncertain && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold">Low-Confidence Reading (&lt; 55%)</div>
                        <p className="text-[11px] leading-relaxed">
                          Hold your device steady, verify bright outdoor illumination, and frame the foliage to fill the viewport before deciding on chemical intervention.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Save & View Remedies */}
                  <div className="space-y-3 pt-2">
                    {/* CRITICAL PERSISTENCE BUTTON */}
                    <button
                      onClick={handleSaveDiagnosis}
                      disabled={isSaving || isSaved}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all touch-target flex items-center justify-center space-x-2 ${
                        isSaved
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-agri-600 hover:bg-agri-500 text-white'
                      }`}
                    >
                      {isSaving ? (
                        <span>Logging Record...</span>
                      ) : isSaved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span>Diagnosis Saved to History</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Diagnosis to History</span>
                        </>
                      )}
                    </button>

                    {saveMessage && (
                      <p
                        className={`text-center text-xs font-medium ${
                          isSaved ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {saveMessage}
                      </p>
                    )}

                    {/* View Remedies Button */}
                    <button
                      onClick={() => setModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition-colors flex items-center justify-center space-x-2 touch-target"
                    >
                      <Layers className="w-4 h-4 text-agri-400" />
                      <span>
                        {isHealthy ? 'View Foliage Maintenance Tips' : 'Inspect Organic & Chemical Remedies'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Waiting State */
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/80 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
                    <Scan className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-300">Awaiting Foliage Frame</div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Point camera at groundnut leaves. The system samples frames automatically every 1.5s.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Treatment Plan Modal */}
      {currentResult && (
        <TreatmentPlanModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          diseaseName={currentResult.disease_name}
          diseaseId={String(currentResult.disease_id)}
          scientificName={currentResult.scientific_name}
          confidenceScore={currentResult.confidence_score}
          remedies={currentResult.remedies || []}
        />
      )}
    </div>
  );
};
