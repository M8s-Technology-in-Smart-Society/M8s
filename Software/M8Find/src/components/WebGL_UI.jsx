import "../App.css";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";
import RadarPanel from "./RadarPanel";

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

  const statusClass =
    status === "DETECTED" ? "detected" :
    status === "MONITORING" ? "monitoring" :
    "clear";

  return (
    <div className="UI dashboard-ui">
      <div className="UI_container final-ui-card">
        <div className="dash-top">
          <div>
            <h3>M8Find</h3>
            <span>Operator dashboard</span>
          </div>
          <strong className={connectionStatus === "CONNECTED" ? "okText" : "warnText"}>
            {connectionStatus}
          </strong>
        </div>

        <div className={`final-status ${statusClass}`}>
          {status}
        </div>

        <div className="confidence-row">
          <div>
            <span>Confidence</span>
            <strong>{confidence !== null ? `${Number(confidence).toFixed(1)}%` : "--%"}</strong>
          </div>
          <div>
            <span>Distance</span>
            <strong>{distanceM !== null ? `~${Number(distanceM).toFixed(2)} m` : "No target"}</strong>
          </div>
        </div>

        <div className="end-user-list">
          <div>
            <span>Human presence</span>
            <strong>{presence ? "YES" : "NO"}</strong>
          </div>
          <div>
            <span>Breathing signal</span>
            <strong>{breathingDetected ? `${breathingRateBpm ?? "?"} BPM` : "No lock"}</strong>
          </div>
          <div>
            <span>Sound / knock</span>
            <strong>{soundDetected ? "Detected" : "No event"}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{mode ?? "unknown"}</strong>
          </div>
        </div>

        {error && <div className="final-error">Sensor warning: {error}</div>}

        <details className="engineering-details">
          <summary>Engineering data</summary>
          <h5>Sensor: {sensorModel ?? "No data"}</h5>
          <h5>Source: {source ?? "No data"}</h5>
          <h5>X: {x !== null ? Number(x).toFixed(2) : "No data"}</h5>
          <h5>Y: {y !== null ? Number(y).toFixed(2) : "No data"}</h5>
          <h5>Z: {z !== null ? Number(z).toFixed(2) : "No data"}</h5>
          <h5>Raw score: {rssi !== null ? rssi : "No raw score"}</h5>
        </details>

        <div className="UIButton">
          <button onClick={() => navigate("/home")}>Restart checks</button>
        </div>
      </div>

      <div className="UIA_container final-ui-card">
        <h3>Audiowave sensor</h3>
        <h5>Status: ESP32 USB bridge</h5>
        <h5>Angle: {audioAngleDeg}°</h5>
        <h5>Energy: {audioEnergy} dB</h5>
        <h5>Lag: {audioLag}</h5>
      </div>

      <RadarPanel />
    </div>
  );
}
