import React, { useEffect, useRef } from "react";

const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let stream = null;

  useEffect(() => {
    if (!isOpen) return;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((s) => {
        stream = s;
        videoRef.current.srcObject = s;
      });

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isOpen]);

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    onCapture(base64);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-[340px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded w-full"
        />

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2 mt-3">
          <button
            onClick={capture}
            className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded"
          >
            Capture
          </button>
          <button
            onClick={onClose}
            className="flex-1 border text-sm py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
