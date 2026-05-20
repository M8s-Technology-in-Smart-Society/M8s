import DetectionTracker from "../components/DetectionTracker";
import WebGLCanvas from "../components/WebGLCanvas";
import WebGL_UI from "../components/WebGL_UI";
import Arrow from "../components/Arrow";


export default function WebGLScene() {
  return (
    <div className="webgl_page">
      <div className="canvas_layer">
        <WebGLCanvas>
          <gridHelper args={[12, 12, "#666666", "#444444"]} position={[0, -2.5, 0]} />
          <axesHelper args={[3]} />
          <DetectionTracker />
          <Arrow />
        </WebGLCanvas>
      </div>

      <WebGL_UI />
    </div>
  );
}