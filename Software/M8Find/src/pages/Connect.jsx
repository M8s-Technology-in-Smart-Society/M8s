import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSensor } from "../context/SensorContext";
import "../App.css";
import Button from "../components/button";

export default function Connect() {
  const navigate = useNavigate();
  const { status } = useSensor();
  const [showTimeoutError, setShowTimeoutError] = useState(false);

  useEffect(() => {
    let timer;

    setShowTimeoutError(false);

    if (status === "Connected") {
      timer = setTimeout(() => {
        navigate("/WebGL");
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (status !== "Connected") {
      timer = setTimeout(() => {
        setShowTimeoutError(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const showError = status === "Error" || showTimeoutError;

  return (
    <div id="center">
    <div className="instructionbox">
      <div>
        {!showError && status !== "Connected" && (
          <>
            <h2>Connecting...</h2>
            <p>Reaching out to the sensor.</p>
          </>
        )}

        {status === "Connected" && (
          <>
            <h2>Connection Established ✅</h2>
            <p>Visuals loading...</p>
          </>
        )}

        {showError && (
          <>
            <h2>Connection error ❌</h2>
            <p>
              Please check the sensor and make sure that the IP address is configured correctly.  </p>
            <p><Button className="connect-button" onClick={() => window.location.reload()}>Try again</Button></p>
          </>
        )}
      </div>
    </div>
  </div>
  );
}