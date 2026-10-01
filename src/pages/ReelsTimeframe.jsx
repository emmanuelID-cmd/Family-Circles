import { useEffect, useState } from "react";
import "./ReelsTimeframe.css";

const mediaItems = [
  { id: "post", type: "Post video", account: "sample.creator", title: "A few moments from the day", duration: 26, image: "ChatGPT Image Sep 25, 2026, 01_14_14 AM.jpg" },
  { id: "collage", type: "Collage", account: "sample.studio", title: "Small scenes, together", duration: 48, image: "ChatGPT Image Sep 25, 2026, 01_16_32 AM.jpg" },
  { id: "live", type: "Live replay", account: "sample.live", title: "A saved live moment", duration: 96, image: "ChatGPT Image Sep 26, 2026, 09_44_42 PM.jpg" },
  { id: "story", type: "Circle Story", account: "sample.circle", title: "Today in the Family circle", duration: 180, image: "ChatGPT Image Sep 27, 2026, 01_17_27 AM.jpg" },
];

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
};

function TimeframePlayer({ item, onBack }) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const durationValid = Number.isFinite(item.duration) && item.duration > 0;

  useEffect(() => {
    if (!playing || !durationValid) return undefined;
    const timer = window.setInterval(() => setPosition((current) => Math.min(item.duration, current + 0.1)), 100);
    return () => window.clearInterval(timer);
  }, [playing, durationValid, item.duration]);

  useEffect(() => {
    if (position >= item.duration) setPlaying(false);
  }, [position, item.duration]);

  const togglePlayback = () => {
    if (!durationValid) return;
    if (!playing && position >= item.duration) setPosition(0);
    setPlaying((current) => !current);
  };

  return <section className="timeframe-player" aria-label={`${item.type} time-frame demo`}>
    <div className="timeframe-player-heading"><button type="button" className="timeframe-back" onClick={onBack}>← Feed</button><span className="prototype-label">Prototype media</span></div>
    <div className="timeframe-viewer">
      {!imageUnavailable ? <img src={`/assets/${encodeURIComponent(item.image)}`} alt="Synthetic still image used in the video time-frame demo" onError={() => setImageUnavailable(true)} /> : <div className="timeframe-image-fallback" role="status">Still preview unavailable. The timeline remains usable.</div>}
      {item.id === "live" && <span className="timeframe-live-badge">LIVE REPLAY</span>}
      <span className="timeframe-type-badge">{item.type}</span>
      <button type="button" className="timeframe-center-play" onClick={togglePlayback} aria-label={playing ? "Pause demo playback" : "Play demo playback"}>{playing ? "Ⅱ" : "▶"}</button>
    </div>
    <div className="timeframe-controls">
      <div className="timeframe-clock"><output aria-live="off">{formatTime(position)}</output><span>{durationValid ? formatTime(item.duration) : "Duration unavailable"}</span></div>
      {durationValid ? <label className="timeframe-slider-label">Video position
        <input className="timeframe-slider" type="range" min="0" max={item.duration} step="0.1" value={position} aria-label="Video position" aria-valuetext={`${formatTime(position)} of ${formatTime(item.duration)}`} onChange={(event) => setPosition(Number(event.target.value))} style={{ "--timeframe-progress": `${(position / item.duration) * 100}%` }} />
      </label> : <p className="timeframe-fallback">Timing is unavailable for this item. The still image remains viewable.</p>}
      <button type="button" className="timeframe-play-button" onClick={togglePlayback} disabled={!durationValid}>{playing ? "Pause" : "Play"}</button>
      <p className="timeframe-disclaimer">Still-image demo with a simulated timeline; it does not play or import real social media video.</p>
    </div>
  </section>;
}

export default function ReelsTimeframe({ onBack }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (selectedItem) return <main className="timeframe-page"><div className="timeframe-shell"><TimeframePlayer key={selectedItem.id} item={selectedItem} onBack={() => setSelectedItem(null)} /></div></main>;

  return <main className="timeframe-page"><div className="timeframe-shell">
    <header className="timeframe-header"><button type="button" className="timeframe-back" onClick={onBack}>← Circles</button><div><p className="timeframe-kicker">FAMILY CIRCLES</p><h1>Reels</h1></div><span className="prototype-label">Demo</span></header>
    <p className="timeframe-intro">Choose a sample to open its timeline. Each sample has a deterministic duration in one of the approved time bands.</p>
    <section className="timeframe-feed" aria-label="Synthetic Reels and Story samples">
      {mediaItems.map((item) => <article className="timeframe-card" key={item.id}>
        <img src={`/assets/${encodeURIComponent(item.image)}`} alt="" />
        <div className="timeframe-card-copy"><span className="timeframe-card-type">{item.type} · {formatTime(item.duration)}</span><h2>{item.title}</h2><p>@{item.account}</p></div>
        <button type="button" className="timeframe-open-button" onClick={() => setSelectedItem(item)}>Open timeline <span aria-hidden="true">→</span></button>
      </article>)}
    </section>
    <p className="timeframe-disclaimer">All accounts and media here are synthetic prototype examples. This page does not connect to Instagram.</p>
  </div></main>;
}
