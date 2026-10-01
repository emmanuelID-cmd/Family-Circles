import { useEffect, useRef, useState } from "react";
import "./ReelsTimeframe.css";

const mediaItems = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `reel-${number}`,
    type: "Reel",
    account: "family.circles",
    title: `Video ${index + 1}`,
    file: `reel-${number}.mp4`,
  };
});

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

function TimeframePlayer({ item, onBack }) {
  const videoRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const durationValid = Number.isFinite(duration) && duration > 0;
  const videoUrl = `/assets/${encodeURIComponent(item.file)}`;

  useEffect(() => {
    setPosition(0);
    setDuration(0);
    setPlaying(false);
    setVideoUnavailable(false);
  }, [item]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || videoUnavailable) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  const seek = (event) => {
    const nextPosition = Number(event.target.value);
    if (videoRef.current) videoRef.current.currentTime = nextPosition;
    setPosition(nextPosition);
  };

  return <section className="timeframe-player" aria-label={`${item.type} video timeline demo`}>
    <div className="timeframe-player-heading"><button type="button" className="timeframe-back" onClick={onBack}>← Feed</button><span className="prototype-label">Video demo</span></div>
    <div className="timeframe-viewer">
      <video
        ref={videoRef}
        className="timeframe-video"
        src={videoUrl}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onSeeked={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setVideoUnavailable(true)}
      />
      {videoUnavailable && <div className="timeframe-video-message" role="status">Video not available yet. Add <code>{item.file}</code> to <code>public/assets/</code>.</div>}
      {!playing && !videoUnavailable && <button type="button" className="timeframe-center-play" onClick={togglePlayback} aria-label="Play video">▶</button>}
      {item.id === "live" && <span className="timeframe-live-badge">LIVE REPLAY</span>}
      <span className="timeframe-type-badge">{item.type}</span>
    </div>
    <div className="timeframe-controls">
      <div className="timeframe-clock"><output aria-label="Current video time" aria-live="off">{formatTime(position)}</output><span aria-label="Video duration">{durationValid ? formatTime(duration) : "--:--"}</span></div>
      {durationValid ? <label className="timeframe-slider-label">Video position
        <input className="timeframe-slider" type="range" min="0" max={duration} step="any" value={Math.min(position, duration)} aria-label="Video position" aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`} onChange={seek} style={{ "--timeframe-progress": `${(position / duration) * 100}%` }} />
      </label> : <p className="timeframe-fallback">The timeline will appear when the video loads.</p>}
      <button type="button" className="timeframe-play-button" onClick={togglePlayback} disabled={!durationValid || videoUnavailable}>{playing ? "Pause" : "Play"}</button>
    </div>
  </section>;
}

export default function ReelsTimeframe({ onBack }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (selectedItem) return <main className="timeframe-page"><div className="timeframe-shell"><TimeframePlayer key={selectedItem.id} item={selectedItem} onBack={() => setSelectedItem(null)} /></div></main>;

  return <main className="timeframe-page"><div className="timeframe-shell">
    <header className="timeframe-header"><button type="button" className="timeframe-back" onClick={onBack}>← Circles</button><div><p className="timeframe-kicker">FAMILY CIRCLES</p><h1>Reels</h1></div><span className="prototype-label">Demo</span></header>
    <p className="timeframe-intro">Choose a video to open its timeline. The slider follows the video's actual playback position.</p>
    <section className="timeframe-feed" aria-label="Reels and Circle Story videos">
      {mediaItems.map((item) => <article className="timeframe-card" key={item.id}>
        <video className="timeframe-card-video" src={`/assets/${encodeURIComponent(item.file)}`} muted playsInline preload="metadata" aria-label={`${item.title} preview`} />
        <div className="timeframe-card-copy"><span className="timeframe-card-type">{item.type}</span><h2>{item.title}</h2><p>@{item.account}</p></div>
        <button type="button" className="timeframe-open-button" onClick={() => setSelectedItem(item)}>Open video <span aria-hidden="true">→</span></button>
      </article>)}
    </section>
    <p className="timeframe-disclaimer">Sample video clips stored in this project for the Reels timeline demo.</p>
  </div></main>;
}
