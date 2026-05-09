import WebGL_UI from "../components/WebGL_UI";
import WebGLCanvas from "../components/WebGLCanvas";
import DistanceCircle from "../components/DistanceVisuals";

import { OrbitControls } from "@react-three/drei";
import { useSensor } from "../context/SensorContext";

export default function WebGL() {
  const { distance, status } = useSensor();

  return (
    <div className="webgl_page">
      <WebGL_UI distance={distance} status={status} />
      <WebGLCanvas>
        <DistanceCircle distance={distance} />
        <OrbitControls />
      </WebGLCanvas>
    </div>
  );
}