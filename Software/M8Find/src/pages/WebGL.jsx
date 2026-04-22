import WebGL_UI from "../components/WebGL_UI";
import WebGLCanvas from "../components/WebGLCanvas";
import Cube from "../components/TESTcube";
import { OrbitControls } from "@react-three/drei";

export default function WebGL() {
  return (
      
      <div className="webgl_page">
        <WebGL_UI />
        <WebGLCanvas>
          <Cube />
          <OrbitControls />
        </WebGLCanvas>
      </div>

  );
}