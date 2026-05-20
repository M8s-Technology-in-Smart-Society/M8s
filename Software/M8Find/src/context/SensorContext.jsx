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

  //AUDIO
  const [audioAngleDeg, setAudioAngleDeg] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [audioLag, setAudioLag] = useState(0);
  const [audioTimestampMs, setAudioTimestampMs] = useState(null);

  useEffect(() => {
    // Používame potvrdenú IP 172.20.10.7
    const ESP_IP = "ws://172.20.10.7:8080/ws";
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

          // XM125 BACKEND LOGIKA
          if (data.source !== undefined) setSource(data.source);
          
          // Správne preberanie stavu detekcie
          if (data.status !== undefined) setStatus(data.status);

          // Bezpečnejšie spracovanie distance_m
          if (data.distance_m !== undefined) {
            setX(data.distance_m !== null ? Number(data.distance_m) : null);
          }

          if (data.confidence !== undefined) {
            setY(Number(data.confidence));
          }

          if (data.presence !== undefined) {
            setZ(data.distance_m ?? 5);
          }

          if (data.raw?.inter_presence_score !== undefined && data.raw.inter_presence_score !== null) {
            setRSSI(Number(data.raw.inter_presence_score));
          }

          // Dynamický model na základe režimu
          setSensorModel(`XM125 A121 (${data.mode ?? "unknown"})`);

          // AUDIO PLACEHOLDER
          if (data.type === "audio-angle") {
            setAudioAngleDeg(Math.max(-90, Math.min(90, Number(data.angle) || 0)));
            setAudioEnergy(Number(data.energy) || 0);
            setAudioLag(Number(data.lag) || 0);
            setAudioTimestampMs(data.timestampMs ?? null);
          }
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
        audioAngleDeg,
        audioEnergy,
        audioLag,
        audioTimestampMs,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}