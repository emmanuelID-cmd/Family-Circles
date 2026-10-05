import "./VideoTimeSlider.css";

export function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export default function VideoTimeSlider({ duration, position, onSeek, onScrubbingChange = () => {}, label = "Video", unavailable = false }) {
  const hasDuration = !unavailable && Number.isFinite(duration) && duration > 0;
  const selected = hasDuration && Number.isFinite(position) ? Math.min(Math.max(position, 0), duration) : 0;
  const totalLabel = hasDuration ? formatVideoTime(Math.ceil(duration)) : "--:--";

  const handleSeek = (event) => {
    if (!hasDuration || unavailable) return;
    const nextPosition = Number(event.currentTarget.value);
    if (Number.isFinite(nextPosition)) onSeek(Math.min(Math.max(nextPosition, 0), duration));
  };

  return <div className="video-time-slider" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()}>
    <div className="video-time-slider-clock">
      <output aria-label="Selected video time" aria-live="off">{hasDuration ? formatVideoTime(selected) : "--:--"}</output>
      <span aria-label="Total video duration">{totalLabel}</span>
    </div>
    {hasDuration && !unavailable
      ? <input
        className="video-time-slider-input"
        type="range"
        min="0"
        max={duration}
        step="any"
        value={selected}
        aria-label={`${label} position`}
        aria-valuetext={`${formatVideoTime(selected)} of ${totalLabel}`}
        onChange={handleSeek}
        onPointerDown={() => onScrubbingChange(true)}
        onPointerUp={() => onScrubbingChange(false)}
        onPointerCancel={() => onScrubbingChange(false)}
        onTouchStart={() => onScrubbingChange(true)}
        onTouchEnd={() => onScrubbingChange(false)}
        onTouchCancel={() => onScrubbingChange(false)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) onScrubbingChange(true);
        }}
        onBlur={() => onScrubbingChange(false)}
        style={{ "--video-progress": `${(selected / duration) * 100}%` }}
      />
      : <p className="video-time-slider-fallback">{unavailable ? "Timeline unavailable." : "Timeline available when video loads."}</p>}
  </div>;
}
