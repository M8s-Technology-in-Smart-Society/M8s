import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function DetectionSphere({ detection }) {
  const groupRef = useRef();
  const materialRef = useRef();

  const target = useMemo(() => {
    const distance = clamp(Number(detection.z ?? 0.5), 0, 1);
    const confidence = clamp(Number(detection.y ?? 50), 0, 100);

    const color =
      confidence > 75 ? "#22c55e" :
      confidence > 45 ? "#facc15" :
      "#38bdf8";

    const scale = 0.45 + (1 - distance) * 1.2 + confidence / 180;

    return {
      color,
      scale,
      position: new THREE.Vector3(
        3.8,
        -0.8 + confidence / 45,
        3.8 - distance * 4.2
      ),
    };
  }, [detection]);

  useFrame(() => {
    if (!groupRef.current || !materialRef.current) return;

    groupRef.current.position.lerp(target.position, 0.12);
    groupRef.current.scale.lerp(
      new THREE.Vector3(target.scale, target.scale, target.scale),
      0.12
    );

    materialRef.current.color.lerp(new THREE.Color(target.color), 0.12);
    materialRef.current.emissive.lerp(new THREE.Color(target.color), 0.12);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={target.color}
          emissive={target.color}
          emissiveIntensity={0.75}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.39, 48]} />
        <meshBasicMaterial color={target.color} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export default function DistanceVisuals({ detections }) {
  const latest = useMemo(() => detections.slice(0, 4), [detections]);

  return (
    <>
      {latest.map((detection) => (
        <DetectionSphere key={detection.id} detection={detection} />
      ))}
    </>
  );
}
