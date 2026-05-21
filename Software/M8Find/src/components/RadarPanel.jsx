import "../App.css";
import { useSensor } from "../context/SensorContext";

export default function RadarPanel() {
  const { presence, distanceM, confidence, status, audioAngleDeg } = useSensor();

  const maxRange = 3;
  const distance = Math.min(Number(distanceM ?? 0), maxRange);
  const radiusPercent = presence ? (distance / maxRange) * 42 : 0;
  const angleDeg = Number(audioAngleDeg || 0);
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  const x = 50 + radiusPercent * Math.cos(angleRad);
  const y = 50 + radiusPercent * Math.sin(angleRad);

  const targetClass =
    status === "DETECTED" ? "detected" :
    status === "MONITORING" ? "monitoring" :
    "clear";

  return (
    <div className="radar-card">
      <div className="radar-header">
        <span>2D radar view</span>
        <strong>{presence ? `~${Number(distanceM).toFixed(2)} m` : "No target"}</strong>
      </div>

      <div className="radar-screen">
        <div className="radar-sweep" />
        <div className="radar-ring r1" />
        <div className="radar-ring r2" />
        <div className="radar-ring r3" />

        <div className="radar-axis vertical" />
        <div className="radar-axis horizontal" />

        <span className="radar-label l1">1m</span>
        <span className="radar-label l2">2m</span>
        <span className="radar-label l3">3m</span>

        {presence && (
          <div
            className={`radar-target ${targetClass}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${Math.max(0.75, Number(confidence || 50) / 80)})`,
            }}
          />
        )}
      </div>

      <div className="radar-footer">
        <span>Audio angle: {angleDeg}°</span>
        <span>Confidence: {confidence !== null ? `${Number(confidence).toFixed(1)}%` : "--"}</span>
      </div>
    </div>
  );
}
