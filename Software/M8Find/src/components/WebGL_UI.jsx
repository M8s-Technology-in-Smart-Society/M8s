import "../App.css";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";

export default function WebGL_UI() {
  const navigate = useNavigate();

  const {
    status,
    x,
    y,
    z,
    rssi,
    sensorModel,
    audioAngleDeg,
    audioEnergy,
    audioLag,
  } = useSensor();

  const statusColor =
    status === "Connected"
      ? "#156015"
      : status === "Error"
      ? "#f87171"
      : "#facc15";

  const safeAngle = typeof audioAngleDeg === "number" ? audioAngleDeg : 0;
  const percent = ((safeAngle + 90) / 180) * 100;

  return (
    <div className= "UI"> 
      <div className="UI_container">
        <h3>Radiowave sensor</h3>

        <div>
          <h5>Sensor model: {sensorModel ?? "No data"}</h5>
          <h5>Sensor signal strength: {rssi !== null ? `${rssi} dBm` : "No data"}</h5>
          <h5>
            Status: <span style={{ color: statusColor }}>{status}</span>
          </h5>
          <h5>X: {x !== null ? x.toFixed(2) : "No data"}</h5>
          <h5>Y: {y !== null ? y.toFixed(2) : "No data"}</h5>
          <h5>Z: {z !== null ? z.toFixed(2) : "No data"}</h5>
        </div>
      </div>

    <div className="UIA_container">
      <h3>Audiowave sensor</h3>

      <div>
        <h5>Sensor signal strength: {rssi !== null ? `${rssi} dBm` : "No data"}</h5>
          <h5>Energy: {`${audioEnergy} dB`}</h5>
          <h5>Lag: {`${audioLag}`}</h5>
          <h5>Angle: {`${audioAngleDeg}°`}</h5>
      </div>
    <div className="UIButton">
      <button onClick={() => navigate("/start")}>Return</button>
    </div>
    </div>
    </div>
  );
}