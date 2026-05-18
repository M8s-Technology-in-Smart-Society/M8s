import { createContext, useContext, useEffect, useState } from "react";

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [type, setType] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [sensorModel, setSensorModel] = useState(null);
  const [source, setSource] = useState(null);
  const [seq, setSeq] = useState(null);
  const [timestampMs, setTimestampMs] = useState(null);
  const [valid, setValid] = useState(null);
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [z, setZ] = useState(null);
  const [rssi, setRSSI] = useState(null);

  useEffect(() => {
    const ESP_IP = "ws://172.20.10.6/";
    let ws;
    let cancelled = false;
    let reconnectTimer;

    const connect = () => {
      if (cancelled) return;

      setStatus("Connecting");
      ws = new WebSocket(ESP_IP);

      ws.onopen = () => {
        setStatus("Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("PARSED:", data);

          if (data.type !== undefined) setType(data.type);
          if (data.sensorModel !== undefined) setSensorModel(data.sensorModel);
          if (data.source !== undefined) setSource(data.source);
          if (data.seq !== undefined) setSeq(Number(data.seq));
          if (data.timestampMs !== undefined) setTimestampMs(Number(data.timestampMs));
          if (data.valid !== undefined) setValid(Boolean(data.valid));
          if (data.x !== undefined) setX(Number(data.x));
          if (data.y !== undefined) setY(Number(data.y));
          if (data.z !== undefined) setZ(Number(data.z));
          if (data.rssi !== undefined) setRSSI(Number(data.rssi));
        } catch (error) {
          console.error("Message handling failed:", error, event.data);
        }
      };

      ws.onclose = () => {
        setStatus("Disconnected");
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        setStatus("Error");
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <SensorContext.Provider
      value={{
        type,
        status,
        sensorModel,
        source,
        seq,
        timestampMs,
        valid,
        x,
        y,
        z,
        rssi,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}