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

  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [z, setZ] = useState(null);
  const [rssi, setRSSI] = useState(null);

  const [audioAngleDeg, setAudioAngleDeg] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [audioLag, setAudioLag] = useState(0);
  const [audioTimestampMs, setAudioTimestampMs] = useState(null);
  const [audioDirectionZone, setAudioDirectionZone] = useState(0);
  const [audioDirectionConfidence, setAudioDirectionConfidence] = useState(0);
  const [audioDirectionLabel, setAudioDirectionLabel] = useState("CENTER");
  const [audioConnected, setAudioConnected] = useState(false);

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

          setAudioConnected(Boolean(data.audio_connected));
          setAudioAngleDeg(Math.max(-90, Math.min(90, Number(data.audio_angle_deg ?? data.angle ?? 0))));
          setAudioEnergy(Number(data.audio_energy ?? data.energy ?? 0));
          setAudioLag(Number(data.audio_lag ?? data.lag ?? 0));
          setAudioDirectionZone(Number(data.audio_direction_zone ?? data.direction_zone ?? 0));
          setAudioDirectionConfidence(Number(data.audio_direction_confidence ?? data.direction_confidence ?? 0));
          setAudioDirectionLabel(data.audio_direction_label ?? "CENTER");
          setAudioTimestampMs(data.timestampMs ?? null);

          if (data.raw?.inter_presence_score !== undefined && data.raw.inter_presence_score !== null) {
            setRSSI(Number(data.raw.inter_presence_score));
          }

          if (data.presence && data.distance_m !== null && data.distance_m !== undefined) {
            const distance = Math.max(0.2, Math.min(2.0, Math.abs(Number(data.distance_m))));
            const conf = Math.max(0, Math.min(100, Number(data.confidence ?? 50)));

            setX(distance);
            setY(conf);
            setZ(distance / 2.0);
          } else {
            setX(null);
            setY(null);
            setZ(null);
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

        x,
        y,
        z,
        rssi,

        audioConnected,
        audioAngleDeg,
        audioEnergy,
        audioLag,
        audioTimestampMs,
        audioDirectionZone,
        audioDirectionConfidence,
        audioDirectionLabel,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}
