import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import DetectionTracker from "./DetectionTracker";

export default function WebGLScene() {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <DetectionTracker />
      <OrbitControls />
    </Canvas>
  );
}