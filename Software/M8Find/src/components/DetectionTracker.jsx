import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSensor } from "../context/SensorContext";

export default function DetectionTracker() {
  const { presence, distanceM, confidence, status } = useSensor();
  const groupRef = useRef();
  const materialRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !materialRef.current) return;

    const visible = presence && distanceM !== null && distanceM !== undefined;
    const distance = Math.max(0.2, Math.min(2.0, Number(distanceM ?? 1)));
    const conf = Math.max(0, Math.min(100, Number(confidence ?? 0)));

    const color =
      status === "DETECTED" ? "#22c55e" :
      status === "MONITORING" ? "#facc15" :
      "#38bdf8";

    const targetPosition = visible
      ? new THREE.Vector3(0, -0.8 + conf / 40, 3.0 - distance * 2.2)
      : new THREE.Vector3(0, -3.5, 3.0);

    const targetScale = visible
      ? Math.max(0.35, Math.min(1.7, 1.8 - distance / 1.4 + conf / 160))
      : 0.01;

    groupRef.current.position.lerp(targetPosition, 0.16);
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.16);

    materialRef.current.color.lerp(new THREE.Color(color), 0.16);
    materialRef.current.emissive.lerp(new THREE.Color(color), 0.16);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.9}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}
