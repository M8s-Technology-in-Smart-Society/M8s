import WebGL_UI from "../components/WebGL_UI";
import WebGLCanvas from "../components/WebGLCanvas";
import Cube from "../components/TESTcube";
import { OrbitControls } from "@react-three/drei";

export default function WebGL() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      
      {/* 3D BACKGROUND */}
      <div style={{ width: "100%", height: "100%" }}>
        <WebGL_UI></WebGL_UI>
        <WebGLCanvas>
          <Cube />
          <OrbitControls />
        </WebGLCanvas>

      </div>

    </div>
  );
}