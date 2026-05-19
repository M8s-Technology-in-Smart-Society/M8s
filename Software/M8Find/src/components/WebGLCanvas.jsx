import "../App.css";
import { Canvas } from "@react-three/fiber";
import WebGL_UI from "./WebGL_UI";

export default function WebGLCanvas({ children }) {
  return (
    <div className="webgl_page">
      <div className="canvas_layer">
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <color attach="background" args={["black"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          {children}
        </Canvas>
      </div>
    </div>
  );
}