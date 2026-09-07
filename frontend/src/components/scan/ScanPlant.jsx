import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  UploadCloud, 
  RefreshCw, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { inferenceService } from '../../services/inference';

export default function ScanPlant({ defaultMode = 'camera', onDiagnosisComplete }) {
  const [mode, setMode] = useState(defaultMode); // 'camera' | 'upload'
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveInferenceActive, setIsLiveInferenceActive] = useState(true);
  const [realtimeBox, setRealtimeBox] = useState(null);
  const [realtimeLabel, setRealtimeLabel] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Upload mode states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isInFlightRef = useRef(false);
  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError('');
    setIsStreaming(false);

    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsStreaming(true);
          }).catch((err) => {
            setCameraError('Unable to start video playback: ' + err.message);
          });
        };
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError(
        'Camera permission was denied or camera is not available. You can upload an image instead.'
      );
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

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

  // Capture frame to base64 JPEG from offscreen canvas
  const captureFrameBase64 = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // Real-time inference streaming loop (1.5s interval with isInFlight guard)
  useEffect(() => {
    if (mode !== 'camera' || !isStreaming || !isLiveInferenceActive) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollStream = async () => {
      if (isInFlightRef.current) return;
      const b64 = captureFrameBase64();
      if (!b64) return;

      isInFlightRef.current = true;
      try {
        const result = await inferenceService.streamFrame(b64);
        if (result && result.bounding_box) {
          setRealtimeBox(result.bounding_box);
          setRealtimeLabel({
            name: result.disease_name,
            confidence: Math.round(result.confidence * 100),
            isHealthy: result.is_healthy_or_uncertain,
          });
        }
      } catch (err) {
        // Stream hiccup: silent fail to prevent interrupting user
      } finally {
        isInFlightRef.current = false;
      }
    };

    pollingIntervalRef.current = setInterval(pollStream, 1500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [mode, isStreaming, isLiveInferenceActive, captureFrameBase64]);

  // High-res manual snap trigger (big circle button)
  const handleShutterSnap = async () => {
    if (analyzing) return;
    const b64 = captureFrameBase64();
    if (!b64) return;

    setAnalyzing(true);
    try {
      // Stream final frame and forward result
      const result = await inferenceService.streamFrame(b64);
      result.preview_image = b64;
      stopCamera();
      onDiagnosisComplete(result);
    } catch (err) {
      alert('Inference error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload Mode handlers
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid JPEG or PNG image file.');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadAnalyze = async () => {
    if (!selectedFile || analyzing) return;
    setAnalyzing(true);
    try {
      const result = await inferenceService.predictUpload(selectedFile);
      result.preview_image = previewUrl;
      onDiagnosisComplete(result);
    } catch (err) {
      alert('Upload error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 md:py-6 flex flex-col items-center">
      {/* Offscreen Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />

      {/* Header & Segmented Toggle (Screen 4) */}
      <div className="w-full mb-4 flex flex-col items-center">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Scan Plant</h2>
        
        {/* Segmented Controller: Camera / Upload */}
        <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 w-full max-w-xs shadow-inner">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'camera'
                ? 'bg-brand-50 text-brand-800 shadow-sm border border-brand-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'upload'
                ? 'bg-brand-50 text-brand-800 shadow-sm border border-brand-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Camera Viewfinder View */}
      {mode === 'camera' && (
        <div className="w-full flex flex-col items-center">
          {cameraError ? (
            <div className="w-full aspect-[3/4] max-w-md rounded-3xl bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400" />
              <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
              <button
                onClick={() => setMode('upload')}
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                Switch to Image Upload
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-[3/4] max-w-md rounded-3xl bg-black overflow-hidden shadow-2xl border-2 border-slate-900 flex items-center justify-center">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing with 4 Corner Brackets */}
              <div className="absolute inset-8 md:inset-12 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                {/* 4 Corner solid brackets */}
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                </div>

                {/* Real-time Bounding Box Overlay if detected */}
                {realtimeBox && isLiveInferenceActive && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded-xl transition-all duration-300 pointer-events-none"
                    style={{
                      left: `${realtimeBox.x_min * 100}%`,
                      top: `${realtimeBox.y_min * 100}%`,
                      width: `${(realtimeBox.x_max - realtimeBox.x_min) * 100}%`,
                      height: `${(realtimeBox.y_max - realtimeBox.y_min) * 100}%`,
                    }}
                  >
                    {realtimeLabel && (
                      <div className="absolute -top-7 left-0 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm whitespace-nowrap shadow-sm">
                        {realtimeLabel.name} ({realtimeLabel.confidence}%)
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </div>

              {/* Viewfinder Caption */}
              <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
                <span className="inline-block px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium tracking-wide">
                  Position the leaf within the frame
                </span>
              </div>

              {/* Live Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-[11px] font-medium text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live AI</span>
              </div>
            </div>
          )}

          {/* Bottom Camera Controls (Gallery, Shutter Button, Camera Flip) */}
          <div className="w-full max-w-md flex items-center justify-around mt-6 px-4">
            {/* Gallery picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
              title="Select from gallery"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            {/* Big Circular Shutter Button */}
            <button
              onClick={handleShutterSnap}
              disabled={analyzing}
              className="w-18 h-18 p-1.5 rounded-full bg-brand-700 hover:bg-brand-800 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-brand-700/30 transition-all"
              title="Capture & Analyze"
            >
              <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-brand-600">
                {analyzing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white"></div>
                )}
              </div>
            </button>

            {/* Flip camera */}
            <button
              onClick={handleFlipCamera}
              className="p-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
              title="Flip camera"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Upload View */}
      {mode === 'upload' && (
        <div className="w-full max-w-md flex flex-col items-center">
          {previewUrl ? (
            <div className="w-full space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm"
                >
                  Change Photo
                </button>
              </div>

              <button
                onClick={handleUploadAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-2xl shadow-md shadow-brand-700/20 text-sm flex items-center justify-center gap-2 transition-all"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Leaf with ConvNeXt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Leaf Diagnosis</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFileSelect(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-brand-600 bg-brand-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-white hover:bg-slate-50/80 hover:border-brand-400'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-4 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Select Plant Photo</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Drag and drop your leaf image here, or click to browse device files.
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
                Browse Photos
              </span>
              <p className="text-[11px] text-slate-400 mt-3">Supports JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
