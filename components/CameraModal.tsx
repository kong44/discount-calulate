import React, { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ✅ Start camera when modal opens
  useEffect(() => {
    if (isOpen) startCamera();
    else stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // ✅ REQUIRED for video to show
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => console.log("Play error:", err));
        };
      }

    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access camera. Please enable camera permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (blob) onCapture(blob);
    }, "image/jpeg");

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-4 rounded-xl w-full max-w-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full bg-black rounded-lg mb-4 border border-white/20"
        />
        
        <div className="flex justify-between">
          <button
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={handleCapture}
          >
            Capture
          </button>

          <button
            className="px-5 py-2 bg-gray-600 text-white rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}
