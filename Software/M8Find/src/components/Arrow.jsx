// components/Arrow.jsx
import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSensor } from "../context/SensorContext";

export default function Arrow() {
  const { scene } = useThree();
  const { audioAngleDeg } = useSensor();
  const arrowRef = useRef(null);

  const origin = useMemo(() => new THREE.Vector3(0, -2.3, 6.5), []);
  const color = 0xff4444;
  const length = 5;

  useEffect(() => {
    const initialDir = new THREE.Vector3(0, 0, 1);
    const arrow = new THREE.ArrowHelper(initialDir, origin, length, color, 0.5, 0.3);
    arrowRef.current = arrow;
    scene.add(arrow);

    return () => {
      scene.remove(arrow);
    };
  }, [scene, origin]);

  useEffect(() => {
    if (!arrowRef.current) return;

    const radians = THREE.MathUtils.degToRad(-audioAngleDeg);
    const dir = new THREE.Vector3(Math.sin(radians), 0, -Math.cos(radians)).normalize();

    arrowRef.current.setDirection(dir);
    arrowRef.current.setLength(length, 0.5, 0.3);
  }, [audioAngleDeg]);

  return null;
}