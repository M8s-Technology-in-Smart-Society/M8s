import { useState } from "react";
import DetectionTracker from "../components/DetectionTracker";
import WebGLCanvas from "../components/WebGLCanvas";
import WebGL_UI from "../components/WebGL_UI";
import Arrow from "../components/Arrow";
import { useSensor } from "../context/SensorContext";

function WallPlane() {
  return (
    <mesh position={[0, 0.2, 1.55]}>
      <boxGeometry args={[5.5, 4.2, 0.08]} />
      <meshStandardMaterial color="#94a3b8" transparent opacity={0.22} />
    </mesh>
  );
}

function DistanceGuides3D() {
  return (
    <group>
      {[0.5, 1.0, 1.5, 2.0].map((m) => (
        <group key={m} position={[0, -2.2, 1.55 - m * 1.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[m * 0.85, m * 0.85 + 0.015, 96]} />
            <meshBasicMaterial color="#14b8a6" transparent opacity={0.16} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Radar2DView() {
  const { presence, distanceM, confidence, status } = useSensor();
  const distance = Math.max(0.2, Math.min(2.0, Number(distanceM ?? 0)));
  const radius = presence ? (distance / 2.0) * 36 : 0;

  const color =
    status === "DETECTED" ? "#22c55e" :
    status === "MONITORING" ? "#facc15" :
    "#38bdf8";

  return (
    <div className="radar2d-overlay">
      <div className="radar2d-screen">
        <div className="radar2d-sweep" />
        <div className="radar2d-ring r05" />
        <div className="radar2d-ring r10" />
        <div className="radar2d-ring r15" />
        <div className="radar2d-ring r20" />

        <div className="radar2d-axis vertical" />
        <div className="radar2d-axis horizontal" />
        <div className="radar2d-wall">WALL / SENSOR SURFACE</div>

        {presence && (
          <>
            <div
              className="radar2d-target"
              style={{
                background: color,
                boxShadow: `0 0 22px ${color}`,
                left: "50%",
                top: `${50 + radius}%`,
                transform: `translate(-50%, -50%) scale(${Math.max(0.8, Number(confidence ?? 40) / 75)})`,
              }}
            />
            <div
              className="radar2d-target-label"
              style={{
                left: "57%",
                top: `${50 + radius}%`,
              }}
            >
              <span>Target distance</span>
              <strong>~{Math.abs(distance).toFixed(2)} m</strong>
            </div>
          </>
        )}
      </div>

      <div className="radar2d-note">
        Static radar mode · single dominant target · approx. distance from wall
      </div>
    </div>
  );
}

export default function WebGLScene() {
  const [viewMode, setViewMode] = useState("3d");

  return (
    <div className={`webgl_page ${viewMode === "2d" ? "is-2d-mode" : "is-3d-mode"}`}>
      {viewMode === "3d" && (
        <div className="canvas_layer">
          <WebGLCanvas>
            <gridHelper args={[12, 12, "#666666", "#444444"]} position={[0, -2.5, 0]} />
            <axesHelper args={[3]} />
            <WallPlane />
            <DistanceGuides3D />
            <DetectionTracker />
            <Arrow />
          </WebGLCanvas>
        </div>
      )}

      {viewMode === "2d" && <Radar2DView />}

      <div className="view-toggle">
        <button className={viewMode === "3d" ? "active" : ""} onClick={() => setViewMode("3d")}>
          3D view
        </button>
        <button className={viewMode === "2d" ? "active" : ""} onClick={() => setViewMode("2d")}>
          2D radar
        </button>
      </div>

      <WebGL_UI />
    </div>
  );
}
