import { DEFAULT_VIDEO_SPEED, isValidVideoSpeed, VIDEO_SPEED_OPTIONS } from "../lib/videoSpeed.js";
import "./VideoSpeedSelect.css";

const formatSpeed = (speed) => `${speed.toFixed(2)}×`;

export default function VideoSpeedSelect({ speed = DEFAULT_VIDEO_SPEED, onChange, disabled = false }) {
  const selectedSpeed = isValidVideoSpeed(speed) ? speed : DEFAULT_VIDEO_SPEED;

  const handleChange = (event) => {
    const nextSpeed = Number(event.currentTarget.value);
    if (!disabled && isValidVideoSpeed(nextSpeed)) onChange?.(nextSpeed);
  };

  return <div
    className="video-speed-select"
    onClick={(event) => event.stopPropagation()}
    onPointerDown={(event) => event.stopPropagation()}
    onTouchStart={(event) => event.stopPropagation()}
  >
    <label className="video-speed-select-label">
      Playback speed
      <select value={selectedSpeed} onChange={handleChange} disabled={disabled}>
        {VIDEO_SPEED_OPTIONS.map((option) => <option key={option} value={option}>{formatSpeed(option)}</option>)}
      </select>
    </label>
    <output className="video-speed-select-active" aria-label="Active playback speed">{formatSpeed(selectedSpeed)}</output>
  </div>;
}
