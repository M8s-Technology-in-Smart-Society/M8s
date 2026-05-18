import "../App.css";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";

export default function WebGL_UI() {
  const navigate = useNavigate();
  const { status, x, y, z, rssi, sensorModel } = useSensor();

  const statusColor =
    status === "Connected"
      ? "#156015"
      : status === "Error"
      ? "#f87171"
      : "#facc15";

  return (
    <div className="UI_container">
      <h2>Sensor view</h2>

      <h5>Sensor model: {sensorModel ?? "No data"}</h5>
      <h5>Sensor signal strength: {rssi !== null ? `${rssi} dBm` : "No data"}</h5>
      <h5>
        Status: <span style={{ color: statusColor }}>{status}</span>
      </h5>
      <h5>X: {x !== null ? x.toFixed(2) : "No data"}</h5>
      <h5>Y: {y !== null ? y.toFixed(2) : "No data"}</h5>
      <h5>Z: {z !== null ? z.toFixed(2) : "No data"}</h5>

      <Button onClick={() => navigate("/start")}>Return</Button>
    </div>
  );
}