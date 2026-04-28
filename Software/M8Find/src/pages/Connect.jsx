import { useEffect, useState } from "react";
import "./Connect.css";

export default function Connect() {
  const [distance, setDistance] = useState(null);
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    const ESP_IP = "ws://172.20.10.2/"; // 🔥 CHANGE THIS to your ESP IP

    let ws;

    const connect = () => {
      setStatus("Connecting...");

      ws = new WebSocket(ESP_IP);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setStatus("Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.distance !== undefined) {
            setDistance(data.distance);
          }
        } catch (err) {
          console.log("Invalid message:", event.data);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setStatus("Disconnected");

        // 🔁 Auto-reconnect after 2 seconds
        setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.log("WebSocket error:", err);
        setStatus("Error");
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div>
      <h1>ESP32 Live Connection</h1>

      <div>
        <p>
          <strong>Status:</strong> {status}
        </p>
      </div>

      <div>
        <h2>Distance</h2>

        <div>
          {distance !== null ? `${distance.toFixed(2)} cm` : "No data"}
        </div>
      </div>
    </div>
  );
}


/* OLD CONNECT -PAGE

function Connect() {
  const navigate = useNavigate()
  //there can be 3 values:connecting, connected or error
  //set status changes the value and idle is starting value
  //there can be 3 values: connect, connecting and error
  const [status, setStatus] = useState('connecting')

  //connect function (FAKE this is NOT the real code this is just for simulation)
  const handleConnect = () => {
    setStatus('connecting')

  //this is not the final code, this is just for simulation
  //takes you to the webgl page after 2 seconds
  useEffect(() => {
    setTimeout(() => {
      setStatus('connected')
      setTimeout(() => navigate('/next-page'), 2000)
      setTimeout(() => navigate('/WebGL'), 2000)
    }, 2000)
  }
  }, [])

  return (
    <div className="connect-container">
    <div>
      {status === 'connecting' && (
        <>
          <h2>Connecting...</h2>
          <p>Reaching out to the sensor.</p>
        </>
      )}

      {status === 'connected' && (
        <>
          <h2>Connection Established ✓</h2>
          <p>Taking you to the next page...</p>
          <h2>Connection established ✓</h2>
        </>
      )}
    </div> */