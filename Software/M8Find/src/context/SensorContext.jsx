import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [status, setStatus] = useState("CLEAR");
  const [sensorModel, setSensorModel] = useState("XM125 A121");
  const [source, setSource] = useState(null);
  const [mode, setMode] = useState(null);
  const [presence, setPresence] = useState(false);
  const [distanceM, setDistanceM] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [breathingDetected, setBreathingDetected] = useState(false);
  const [breathingRateBpm, setBreathingRateBpm] = useState(null);
  const [soundDetected, setSoundDetected] = useState(false);
  const [error, setError] = useState(null);
  const [lastFrameAt, setLastFrameAt] = useState(null);

  // Legacy 3D coordinates for existing WebGL components.
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [z, setZ] = useState(null);
  const [rssi, setRSSI] = useState(null);

  // Audio placeholders, ready for ESP32 bridge integration.
  const [audioAngleDeg, setAudioAngleDeg] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [audioLag, setAudioLag] = useState(0);
  const [audioTimestampMs, setAudioTimestampMs] = useState(null);

  useEffect(() => {
    const WS_URL =
      import.meta.env.VITE_WS_URL ||
      `ws://${window.location.hostname}:8080/ws`;

    let ws;
    let cancelled = false;
    let reconnectTimer;

    const connect = () => {
      if (cancelled) return;

      setConnectionStatus("CONNECTING");
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnectionStatus("CONNECTED");
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          setLastFrameAt(Date.now());
          setSource(data.source ?? null);
          setMode(data.mode ?? data.source ?? "unknown");
          setStatus(data.status ?? "CLEAR");
          setPresence(Boolean(data.presence));
          setDistanceM(data.distance_m ?? null);
          setConfidence(data.confidence ?? null);
          setBreathingDetected(Boolean(data.breathing_detected));
          setBreathingRateBpm(data.breathing_rate_bpm ?? null);
          setSoundDetected(Boolean(data.sound_detected));
          setError(data.error ?? null);
          setSensorModel(`XM125 A121 (${data.mode ?? data.source ?? "unknown"})`);

          if (data.raw?.inter_presence_score !== undefined && data.raw.inter_presence_score !== null) {
            setRSSI(Number(data.raw.inter_presence_score));
          }

          // Convert radar distance to a simple WebGL marker.
          // x/y/z kept for old visual components.
          if (data.presence && data.distance_m !== null && data.distance_m !== undefined) {
            setX(Number(data.distance_m));
            setY(Number(data.confidence ?? 50));
            setZ(Number(data.distance_m));
          } else {
            setX(null);
            setY(null);
            setZ(null);
          }

          // Future ESP32 microphone bridge format.
          if (data.type === "audio-angle") {
            setAudioAngleDeg(Math.max(-90, Math.min(90, Number(data.angle) || 0)));
            setAudioEnergy(Number(data.energy) || 0);
            setAudioLag(Number(data.lag) || 0);
            setAudioTimestampMs(data.timestampMs ?? null);
          }
        } catch (err) {
          console.error("WebSocket message handling failed:", err, event.data);
          setError("Invalid backend message");
        }
      };

      ws.onclose = () => {
        setConnectionStatus("DISCONNECTED");
        if (!cancelled) reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setConnectionStatus("ERROR");
        setError("WebSocket connection error");
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const stale = useMemo(() => {
    if (!lastFrameAt) return true;
    return Date.now() - lastFrameAt > 3000;
  }, [lastFrameAt]);

  return (
    <SensorContext.Provider
      value={{
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
        lastFrameAt,
        stale,

        // legacy WebGL values
        x,
        y,
        z,
        rssi,

        // audio
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
