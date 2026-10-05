import { useEffect, useRef, useState } from "react";
import { clampPreviewTime, formatPreviewTime } from "./VideoScrubPreviewTime.js";
import "./VideoScrubPreview.css";

const FALLBACK = "Frame preview unavailable. You can still seek and play the video.";

// The parent supplies only a media URL the current viewer is allowed to access.
export default function VideoScrubPreview({ src, time, duration, active }) {
  const videoRef = useRef(null);
  const requestRef = useRef(0);
  const [frame, setFrame] = useState(null);
  const selectedTime = clampPreviewTime(time, duration);

  useEffect(() => {
    const request = ++requestRef.current;
    setFrame(null);
    if (!active || !src || selectedTime === null) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    const fail = () => {
      if (request === requestRef.current) setFrame({ status: "error", src, time: selectedTime });
    };

    const capture = () => {
      if (request !== requestRef.current || video.seeking || video.readyState < 2) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        fail();
        return;
      }
      const requested = Math.min(selectedTime, video.duration);
      if (Math.abs(video.currentTime - requested) > 0.15) return;

      try {
        const canvas = document.createElement("canvas");
        if (!video.videoWidth || !video.videoHeight) throw new Error("No preview frame available");
        const scale = Math.min(1, 320 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas preview unavailable");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg", 0.8);
        if (request === requestRef.current) setFrame({ status: "ready", url, src, time: selectedTime });
      } catch {
        // Cross-origin media and disabled canvas both fall back without touching playback.
        fail();
      }
    };

    const seek = () => {
      if (request !== requestRef.current || video.readyState < 1) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        fail();
        return;
      }
      if (selectedTime > video.duration + 0.15) {
        fail();
        return;
      }
      try {
        video.currentTime = Math.min(selectedTime, video.duration);
        capture();
      } catch {
        fail();
      }
    };

    video.addEventListener("loadedmetadata", seek);
    video.addEventListener("loadeddata", capture);
    video.addEventListener("seeked", capture);
    video.addEventListener("error", fail);
    video.addEventListener("stalled", fail);
    seek();

    return () => {
      video.removeEventListener("loadedmetadata", seek);
      video.removeEventListener("loadeddata", capture);
      video.removeEventListener("seeked", capture);
      video.removeEventListener("error", fail);
      video.removeEventListener("stalled", fail);
      requestRef.current++;
    };
  }, [active, src, selectedTime]);

  if (!active) return null;

  const currentFrame = frame?.src === src && frame?.time === selectedTime ? frame : null;
  const unavailable = !src || selectedTime === null || currentFrame?.status === "error";
  return <div className="video-scrub-preview" role="group" aria-label="Video scrub preview">
    {src && selectedTime !== null && <video
      key={src}
      ref={videoRef}
      className="video-scrub-preview-source"
      src={src}
      preload="metadata"
      muted
      playsInline
      tabIndex={-1}
      aria-hidden="true"
    />}
    <div className="video-scrub-preview-frame">
      {currentFrame?.status === "ready"
        ? <img src={currentFrame.url} alt={`Video frame at ${formatPreviewTime(selectedTime)}`} />
        : <span role="status">
          {unavailable ? (selectedTime === null ? "Preview unavailable until video timing loads." : FALLBACK) : "Loading preview…"}
        </span>}
    </div>
    <output className="video-scrub-preview-time" aria-live="off">
      {selectedTime === null ? "--:--" : formatPreviewTime(selectedTime)} / {Number.isFinite(duration) && duration > 0 ? formatPreviewTime(Math.ceil(duration)) : "--:--"}
    </output>
  </div>;
}
