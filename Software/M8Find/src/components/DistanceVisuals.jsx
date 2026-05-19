import { useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getVisualsFromZ(z) {
  const d = clamp(z ?? 5, 0, 5);

  let color = "#ffffff";
  if (d < 0.5) color = "#ef4444";       // red = near
  else if (d < 1) color = "#eb6912";  // orange
  else if (d < 1.5) color = "#fff70d";  // yellow
  else if (d < 2) color = "#22c55e";  // green
  else color = "#0d0085";             // blue = far

  const scale = 1.6 - d * 0.2;

  return {
    color,
    scale: clamp(scale, 0.5, 2.2),
  };
}

function DetectionSphere({ detection, index }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const target = useMemo(() => {
    const visuals = getVisualsFromZ(detection.z);

    return {
      color: visuals.color,
      scale: visuals.scale,
      position: new THREE.Vector3(
        detection.x + 1.4,
        detection.y,
        detection.z
      ),
    };
  }, [detection]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    meshRef.current.position.lerp(target.position, 0.12);

    meshRef.current.scale.lerp(
      new THREE.Vector3(target.scale, target.scale, target.scale),
      0.12
    );

    materialRef.current.color.lerp(new THREE.Color(target.color), 0.12);
    materialRef.current.emissive.lerp(new THREE.Color(target.color), 0.12);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive={target.color}
          emissiveIntensity={0.25}
        />
      </mesh>

      <Text
        position={[detection.x + 1.4, detection.y + 0.95, detection.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {index + 1}
      </Text>
    </group>
  );
}

export default function DistanceVisuals({ detections }) {
  return (
    <>
      {detections.map((detection, index) => (
        <DetectionSphere
          key={detection.id}
          detection={detection}
          index={index}
        />
      ))}
    </>
  );
}