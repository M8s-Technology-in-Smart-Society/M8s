import { useEffect, useState } from "react";
import { useSensor } from "../context/SensorContext";
import DistanceVisuals from "./DistanceVisuals";

const MAX_DETECTIONS = 10;

export default function DetectionTracker() {
  const { x, y, z, seq, timestampMs } = useSensor();

  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      return;
    }

    const newDetection = {
      id: `${seq ?? Date.now()}-${timestampMs ?? performance.now()}`,
      x,
      y,
      z,
      seq,
      timestampMs,
    };

    setDetections((prev) =>
      [newDetection, ...prev].slice(0, MAX_DETECTIONS)
    );
  }, [x, y, z, seq, timestampMs]);

  return <DistanceVisuals detections={detections} />;
}