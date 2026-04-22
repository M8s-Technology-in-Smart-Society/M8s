import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Cube() {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      onClick={() => alert("Clicked!")}
    >
      <boxGeometry />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}