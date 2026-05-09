import { createContext, useContext, useEffect, useState } from "react";

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [distance, setDistance] = useState(null);
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    const ESP_IP = "ws://172.20.10.3/"; 
    //THIS HAS TO BE CHECKED EVERYTIME, MIGHT CHANGE BETWEEN SESSIONS AND WILL CHANGE IF THE HOTSPOT IS DIFFERENT
    let ws;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      ws = new WebSocket(ESP_IP);

      ws.onopen = () => setStatus("Connected");

      ws.onmessage = (event) => {
        try {
          //TÄSSÄ KOHTAA TIETO HAETAAN ESP32 JA TALLENETAAN DISTANCEEN!!!!!!!!!!1
          const data = JSON.parse(event.data);
          if (data.distance !== undefined) setDistance(data.distance);
        } catch {}
      };

      ws.onclose = () => {
        setStatus("Disconnected");
        if (!cancelled) setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        setStatus("Error");
        ws.close();
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (ws) ws.close();
    };
  }, []);

  //TÄSSÄ KOHTAA ON SENSORIN ANTAMA TIETO VISUAALISESTI!!!!!!!!!
  return (
    <SensorContext.Provider value={{ distance, status }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}