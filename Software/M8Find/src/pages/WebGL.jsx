import DetectionTracker from "../components/DetectionTracker";
import WebGLCanvas from "../components/WebGLCanvas";
import WebGL_UI from "../components/WebGL_UI";
import Arrow from "../components/Arrow";

function RadarRings() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[3.8, -2.35, 2.2]}>
      {[1, 2, 3, 4].map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r * 0.55, r * 0.55 + 0.01, 96]} />
          <meshBasicMaterial color="#14b8a6" transparent opacity={0.35} />
        </mesh>
      ))}

      <mesh rotation={[0, 0, Date.now() / 1000]}>
        <planeGeometry args={[0.025, 2.4]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function WebGLScene() {
  return (
    <div className="webgl_page">
      <div className="canvas_layer">
        <WebGLCanvas>
          <gridHelper args={[12, 12, "#666666", "#444444"]} position={[0, -2.5, 0]} />
          <axesHelper args={[2]} />
          <RadarRings />
          <DetectionTracker />
          <Arrow />
        </WebGLCanvas>
      </div>

      <WebGL_UI />
    </div>
  );
}
