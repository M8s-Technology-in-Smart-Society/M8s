import "../App.css";
import { useSensor } from "../context/SensorContext";

export default function AudioDirectionOverlay() {
  const {
    soundDetected,
    audioAngleDeg,
    audioEnergy,
    audioLag,
    audioDirectionZone,
    audioDirectionConfidence,
  } = useSensor();

  const active = soundDetected || Number(audioEnergy || 0) > 450000;
  const angle =
    Math.abs(Number(audioAngleDeg || 0)) > 2
      ? Number(audioAngleDeg)
      : Number(audioDirectionZone || 0) * 45;

  return (
    <div className={`audio-floor-arrow ${active ? "active" : ""}`}>
      <div
        className="audio-floor-arrow-shape"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        ?
      </div>
      <div className="audio-floor-label">
        <strong>AUDIO DIRECTION</strong>
        <span>
          {Math.round(angle)}° · lag {audioLag ?? 0} · {audioDirectionConfidence ?? 0}%
        </span>
      </div>
    </div>
  );
}
