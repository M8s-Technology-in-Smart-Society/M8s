import { useMemo, useRef } from "react";
//useMemo = caches a computed value, so keeps the previous value as long as the distance doesnt change
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function DistanceVisuals(distance) {

  const d = clamp(distance ?? 100, 0, 100); //Limits for the maximum and minimun distance

  let color = "#ffffff"; //default when the distance gets over the limit
  //These give the colors depending on the distance
  if (d < 10) color = "#ef4444";      // red
  else if (d < 20) color = "#f59e0b"; // orange
  else if (d < 30) color = "#22c55e"; // green
  else if (d < 50) color = "#0d0085"; // blue
  const scale = 1.5 - (d / 100) * 2; //scale of the circle with respect the distance

  return {
    color,
    scale: clamp(scale, 0.5, 2.5),
  };
}

export default function DistanceCircle({ distance }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const target = useMemo(() => DistanceVisuals(distance), [distance]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    meshRef.current.scale.lerp(
      new THREE.Vector3(target.scale, target.scale, target.scale),
      0.12
    );

    materialRef.current.color.lerp(new THREE.Color(target.color), 0.12);
  });

  return (
    //Visual specs for the circle
    //position gives the sideways shift of the visual to not get hidden beneath the UI-box
    //sphereGeometry: [radius, widhth segments, height segments], the more segments, the less blocky the circle is
    <mesh ref={meshRef} position={[1.4, 0, 0]}> 
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ffffff"
        emissive={target.color}
        emissiveIntensity={0}
      />
    </mesh>
  );
}