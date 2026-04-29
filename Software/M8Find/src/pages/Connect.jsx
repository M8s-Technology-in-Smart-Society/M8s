import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";
import "./Connect.css";

export default function Connect() {
  const navigate = useNavigate();
  const { status } = useSensor();

  useEffect(() => {
    if (status === "Connected") {
      const timer = setTimeout(() => {
        navigate("/WebGL");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="connect-container">
      <div>
        {status !== "Connected" && (
          <>
            <h2>Connecting...</h2>
            <p>Reaching out to the sensor.</p>
          </>
        )}

        {status === "Connected" && (
          <>
            <h2>Connection Established ✓</h2>
            <p>Taking you to the next page...</p>
          </>
        )}
      </div>
    </div>
  );
}