import { useEffect, useRef, useState } from "react";
import VideoTimeSlider from "../components/VideoTimeSlider.jsx";
import "./ReelsTimeframe.css";

const mediaItems = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const titles = [
    "A little moment",
    "Everyday highlights",
    "A day to remember",
    "Moments together",
    "Life lately",
    "Weekend scenes",
    "Good times",
    "Out and about",
    "The long version",
    "One more memory",
  ];
  const durations = [14.067, 6.1, 23.1, 15, 24.728, 25.3, 13.583, 26.354, 61.7, 9.821];
  return {
    id: `reel-${number}`,
    type: "Reel",
    account: `demo.circle${number}`,
    title: titles[index],
    file: `reel-${number}.mp4`,
    duration: durations[index],
  };
});

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

const formatDuration = (seconds) => formatTime(Math.ceil(Number(seconds) || 0));

const EXPIRATION_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEMO_CREATED_AT_KEY = "family-circles-reel-demo-created-at";

function getRemainingTime(createdAt, now = Date.now()) {
  const createdTime = new Date(createdAt).getTime();
  const expiresAt = createdTime + EXPIRATION_WINDOW_MS;
  const diff = expiresAt - now;
  if (!Number.isFinite(diff) || diff <= 0) return "Expired";

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

function loadDemoCreatedAt() {
  const now = Date.now();
  const seeded = Object.fromEntries(mediaItems.map((item, index) => [
    item.id,
    now - (index + 1) * 60 * 60 * 1000,
  ]));

  try {
    const saved = JSON.parse(window.localStorage.getItem(DEMO_CREATED_AT_KEY) || "null");
    if (saved && mediaItems.every((item) => Number.isFinite(Number(saved[item.id])))) return saved;
    window.localStorage.setItem(DEMO_CREATED_AT_KEY, JSON.stringify(seeded));
  } catch {
    // Keep the demo usable when browser storage is unavailable.
  }
  return seeded;
}

function ReelExpiryBadge({ createdAt }) {
  const [isHovered, setIsHovered] = useState(false);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!isHovered) return undefined;
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, [isHovered]);

  return <div
    className="timeframe-expiry-hover-target"
    onMouseEnter={() => { setNow(Date.now()); setIsHovered(true); }}
    onMouseLeave={() => setIsHovered(false)}
    onFocus={() => { setNow(Date.now()); setIsHovered(true); }}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false);
    }}
    tabIndex={0}
    aria-label="Hover or focus to see when this demo reel expires"
  >
    {isHovered && <span className="timeframe-expiry-badge" role="status">{getRemainingTime(createdAt, now)}</span>}
  </div>;
}

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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onBack]);

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

  const seek = (nextPosition) => {
    if (videoRef.current) videoRef.current.currentTime = nextPosition;
    setPosition(nextPosition);
  };

  const seekBy = (seconds) => {
    const video = videoRef.current;
    if (!video || !durationValid) return;
    const nextPosition = Math.min(duration, Math.max(0, video.currentTime + seconds));
    video.currentTime = nextPosition;
    setPosition(nextPosition);
  };

  const handleVideoKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePlayback();
    }
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
        onClick={togglePlayback}
        onKeyDown={handleVideoKeyDown}
        tabIndex="0"
        aria-label="Video playback. Click to play or pause."
      />
      {videoUnavailable && <div className="timeframe-video-message" role="status">Video not available yet. Add <code>{item.file}</code> to <code>public/assets/</code>.</div>}
      {!playing && !videoUnavailable && <button type="button" className="timeframe-center-play" onClick={togglePlayback} aria-label="Play video">▶</button>}
      <span className="timeframe-type-badge">{item.type}</span>
    </div>
    <div className="timeframe-controls">
      <VideoTimeSlider duration={duration} position={position} onSeek={seek} label={item.title} unavailable={videoUnavailable} />
      {durationValid && duration > 15 && <div className="timeframe-skip-controls" aria-label="Skip controls">
        <button type="button" onClick={() => seekBy(-15)} aria-label="Rewind 15 seconds">↶ 15s</button>
        <button type="button" onClick={() => seekBy(15)} aria-label="Fast forward 15 seconds">15s ↷</button>
      </div>}
      <button type="button" className="timeframe-play-button" onClick={togglePlayback} disabled={!durationValid || videoUnavailable}>{playing ? "Pause" : "Play"}</button>
    </div>
  </section>;
}

export default function ReelsTimeframe({ onBack }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewDurations, setPreviewDurations] = useState(() => Object.fromEntries(mediaItems.map((item) => [item.id, item.duration])));
  const [createdAtById] = useState(loadDemoCreatedAt);
  const closePlayer = () => setSelectedItem(null);

  return <main className="timeframe-page"><div className="timeframe-shell">
    <header className="timeframe-header"><button type="button" className="timeframe-back" onClick={onBack}>← Circles</button><div><p className="timeframe-kicker">FAMILY CIRCLES</p><h1>Reels</h1></div><span className="prototype-label">Demo</span></header>
    <p className="timeframe-intro">Choose a video to open its timeline. The slider follows the video's actual playback position.</p>
    <section className="timeframe-feed" aria-label="Reels and Circle Story videos">
      {mediaItems.map((item) => <article className="timeframe-card" key={item.id}>
        <div className="timeframe-card-media">
          <video className="timeframe-card-video" src={`/assets/${encodeURIComponent(item.file)}`} muted playsInline preload="metadata" aria-label={`${item.title} preview`} onLoadedMetadata={(event) => {
            const loadedDuration = event.currentTarget.duration;
            setPreviewDurations((current) => ({ ...current, [item.id]: loadedDuration }));
          }} />
          <span className="timeframe-duration-badge" aria-label={`Video duration ${formatDuration(previewDurations[item.id])}`}>{formatDuration(previewDurations[item.id])}</span>
          <ReelExpiryBadge createdAt={createdAtById[item.id]} />
        </div>
        <div className="timeframe-card-copy"><span className="timeframe-card-type">{item.type}</span><h2>{item.title}</h2><p>@{item.account} · demo</p></div>
        <button type="button" className="timeframe-open-button" onClick={() => setSelectedItem(item)}>Open video <span aria-hidden="true">→</span></button>
      </article>)}
    </section>
    <p className="timeframe-disclaimer">Sample video clips stored in this project. Account names are fictional demo labels.</p>
  </div>
  {selectedItem && <div className="timeframe-overlay" onClick={closePlayer}>
    <div className="timeframe-dialog" role="dialog" aria-modal="true" aria-label={`${selectedItem.title} player`} onClick={(event) => event.stopPropagation()}>
      <TimeframePlayer key={selectedItem.id} item={selectedItem} onBack={closePlayer} />
    </div>
  </div>}
  </main>;
}
