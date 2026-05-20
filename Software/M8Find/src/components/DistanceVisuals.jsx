import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function remap(value, inMin, inMax, outMin, outMax) {
  const clamped = clamp(value, inMin, inMax);
  const t = (clamped - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function getVisualsFromZ(z) {
  const d = clamp(z ?? 5, 0, 7);

  let color = "#ffffff";
  let scale = 1.0;

  if (d < 1) {
    color = "#ef4444";
    scale = 5;
  } else if (d >= 1 && d < 2) {
    color = "#eb6912";
    scale = 4;
  } else if (d >= 2 && d < 3) {
    color = "#fff70d";
    scale = 3;
  } else if (d >= 3 && d < 4) {
    color = "#22c55e";
    scale = 2;
  } else if (d >= 4 && d < 5) {
    color = "#0023bd";
    scale = 1.0;
  } else if (d >= 5 && d < 7) {
    color = "#07d6ff";
    scale = 0.5;
  } else {
    color = "#be00a1";
    scale = 0.5;
  }

  return {
    color,
    scale: clamp(scale, 0.1, 10),
  };
}

// Expected incoming coordinate range from sensor/mock feed
const SENSOR_BOUNDS = {
  minX: 0,
  maxX: 2.5,

  minY: 0,
  maxY: 100,

  minZ: 0,
  maxZ: 1,
};

// Visual area in the 3D scene, shifted to the right side
const SCENE_BOUNDS = {
  minX: 1.8,
  maxX: 5.8,
  minY: -2.3,
  maxY: 2.3,
  minZ: 0,
  maxZ: 4.5,
};

function DetectionSphere({ detection, index }) {
  const groupRef = useRef();
  const materialRef = useRef();

  const target = useMemo(() => {
    const visuals = getVisualsFromZ(detection.z);

    const mappedX = remap(
      detection.x,
      SENSOR_BOUNDS.minX,
      SENSOR_BOUNDS.maxX,
      SCENE_BOUNDS.minX,
      SCENE_BOUNDS.maxX
    );

    const mappedY = remap(
      detection.y,
      SENSOR_BOUNDS.minY,
      SENSOR_BOUNDS.maxY,
      SCENE_BOUNDS.minY,
      SCENE_BOUNDS.maxY
    );

    const mappedZ = remap(
      detection.z,
      SENSOR_BOUNDS.minZ,
      SENSOR_BOUNDS.maxZ,
      SCENE_BOUNDS.maxZ,
      SCENE_BOUNDS.minZ
    );

    return {
      color: visuals.color,
      scale: visuals.scale,
      position: new THREE.Vector3(mappedX, mappedY, mappedZ),
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
        <circleGeometry args={[0.12, 65]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive={target.color}
          emissiveIntensity={0.25}
        />
      </mesh>

    </group>
  );
}


export default function DistanceVisuals({ detections }) {
  const sortedDetections = useMemo(() => {
    return [...detections].sort((a, b) => a.z - b.z);
  }, [detections]);

  return (
    <>
      {sortedDetections.map((detection) => (
        <DetectionSphere
          key={detection.id}
          detection={detection}

        />
      ))}
    </>
  );
}