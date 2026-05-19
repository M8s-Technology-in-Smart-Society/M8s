import { OrbitControls } from "@react-three/drei";
import DetectionTracker from "../components/DetectionTracker";
import WebGLCanvas from "../components/WebGLCanvas";
import WebGL_UI from "../components/WebGL_UI";

export default function WebGLScene() {
  return (
    <div className="webgl_page">
      <div className="canvas_layer">
        <WebGLCanvas>
          <DetectionTracker />
          <OrbitControls />
        </WebGLCanvas>
      </div>

      <WebGL_UI />
    </div>
  );
}