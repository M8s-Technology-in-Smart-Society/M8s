import { Canvas } from "@react-three/fiber";

export default function WebGLCanvas({ children }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas>
        <color attach="background" args={["black"]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        {children}
      </Canvas>
    </div>
  );
}