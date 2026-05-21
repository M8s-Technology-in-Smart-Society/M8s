import "../App.css";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";

export default function WebGL_UI() {
  const navigate = useNavigate();

  const {
    connectionStatus,
    status,
    sensorModel,
    source,
    mode,
    presence,
    distanceM,
    confidence,
    breathingDetected,
    breathingRateBpm,
    soundDetected,
    error,
    x,
    y,
    z,
    rssi,
    audioAngleDeg,
    audioEnergy,
    audioLag,
  } = useSensor();

  const fusionEstimate = Math.min(
    100,
    Math.round(Number(confidence ?? 0) + (soundDetected ? 8 : 0))
  );

  const statusColor =
    status === "DETECTED" ? "#008f5a" :
    status === "MONITORING" ? "#d97706" :
    "#334155";

  return (
    <div className="UI">
      <div className="UI_container">
        <h3>Radiowave sensor</h3>

        <div>
          <h5>Status: <span style={{ color: statusColor, fontWeight: 900 }}>{status}</span></h5>
          <h5>Connection: {connectionStatus}</h5>
          <h5>Mode: {mode ?? "No data"}</h5>
          <h5>Presence: {presence ? "YES" : "NO"}</h5>
          <h5>Radar confidence: {confidence !== null ? `${Number(confidence).toFixed(1)}%` : "No data"}</h5>
          <h5>Fusion estimate: {fusionEstimate}%</h5>
          <h5>Distance: {distanceM !== null ? `~${Math.abs(Number(distanceM)).toFixed(2)} m` : "No target"}</h5>
          <h5>Breathing: {breathingDetected ? `YES (${breathingRateBpm ?? "?"} BPM)` : "No lock"}</h5>
          <h5>Audio activity: {soundDetected ? "Detected" : "No event"}</h5>
          <h5>Audio angle: {Number(audioAngleDeg ?? 0).toFixed(1)}°</h5>
          <h5>Audio energy: {audioEnergy}</h5>

          {error && <h5 style={{ color: "#b91c1c" }}>Warning: {error}</h5>}

          <details className="engineering-details">
            <summary>Engineering data</summary>
            <h5>Sensor model: {sensorModel ?? "No data"}</h5>
            <h5>Source: {source ?? "No data"}</h5>
            <h5>X: {x !== null ? Number(x).toFixed(2) : "No data"}</h5>
            <h5>Y: {y !== null ? Number(y).toFixed(2) : "No data"}</h5>
            <h5>Z: {z !== null ? Number(z).toFixed(2) : "No data"}</h5>
            <h5>Raw score: {rssi !== null ? rssi : "No raw score"}</h5>
          </details>
        </div>
      </div>

      <div className="UIA_container">
        <h3>Audiowave sensor</h3>

        <div>
          <h5>Status: ESP32 USB bridge</h5>
          <h5>Energy: {audioEnergy} dB</h5>
          <h5>Lag: {audioLag}</h5>
          <h5>Angle: {Number(audioAngleDeg ?? 0).toFixed(1)}°</h5>
        </div>

        <div className="UIButton">
          <Button onClick={() => navigate("/home")}>Return</Button>
        </div>
      </div>
    </div>
  );
}
