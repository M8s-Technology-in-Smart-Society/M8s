import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSensor } from "../context/SensorContext";

export default function Arrow() {
  const { soundDetected, audioAngleDeg, audioEnergy } = useSensor();
  const groupRef = useRef();
  const matRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;

    const angle = Math.max(-65, Math.min(65, Number(audioAngleDeg || 0)));
    const active = soundDetected || Number(audioEnergy || 0) > 450000;

    // Arrow sits low and points forward, then pans left/right by audio angle.
    const targetYRotation = THREE.MathUtils.degToRad(angle);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetYRotation,
      0.16
    );

    const color = active ? "#f97316" : "#94a3b8";
    matRef.current.color.lerp(new THREE.Color(color), 0.16);
    matRef.current.emissive.lerp(new THREE.Color(color), 0.16);

    const pulse = active ? 1.15 + Math.sin(Date.now() / 120) * 0.08 : 0.9;
    groupRef.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.12);
  });

  return (
    <group ref={groupRef} position={[0, -2.05, 3.25]} rotation={[0, 0, 0]}>
      {/* shaft pointing forward */}
      <mesh position={[0, 0, -0.45]}>
        <boxGeometry args={[0.12, 0.12, 0.95]} />
        <meshStandardMaterial
          ref={matRef}
          color="#94a3b8"
          emissive="#94a3b8"
          emissiveIntensity={0.75}
        />
      </mesh>

      {/* arrow head */}
      <mesh position={[0, 0, -1.05]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.28, 0.62, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.7} />
      </mesh>

      {/* base dot */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color="#94a3b8" emissive="#94a3b8" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}
