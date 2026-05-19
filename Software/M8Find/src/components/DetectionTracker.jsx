import { useEffect, useState } from "react";
import { useSensor } from "../context/SensorContext";
import DistanceVisuals from "./DistanceVisuals";

const Z_EPSILON = 0.05;
const MAX_DETECTIONS = 20;

export default function DetectionTracker() {
  const { x, y, z, seq, valid } = useSensor();
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (!valid) return;
    if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") return;

    setDetections((prev) => {
      if (prev.length === 0) {
        return [{ id: seq ?? Date.now(), x, y, z, seq }];
      }

      const latest = prev[0];
      const sameZ = Math.abs(latest.z - z) < Z_EPSILON;

      if (sameZ) {
        return [{ ...latest, x, y, z, seq }, ...prev.slice(1)];
      }

      const next = [{ id: seq ?? Date.now(), x, y, z, seq }, ...prev];
      return next.slice(0, MAX_DETECTIONS);
    });
  }, [x, y, z, seq, valid]);

  return <DistanceVisuals detections={detections} />;
}