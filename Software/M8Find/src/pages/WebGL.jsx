import { useEffect, useState } from "react";
import DetectionTracker from "../components/DetectionTracker";
import WebGLCanvas from "../components/WebGLCanvas";
import WebGL_UI from "../components/WebGL_UI";
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

function RedAudioArrow() {
  const { soundDetected, audioAngleDeg } = useSensor();
  const [lastAngle, setLastAngle] = useState(0);
  const [holdUntil, setHoldUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (soundDetected) {
      setLastAngle(Math.max(-65, Math.min(65, Number(audioAngleDeg || 0))));
      setHoldUntil(Date.now() + 3000);
    }
  }, [soundDetected, audioAngleDeg]);

  const active = now < holdUntil;
  const angle = active ? lastAngle : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "26px",
        transform: "translateX(-50%)",
        zIndex: 999,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <svg
        width="78"
        height="78"
        viewBox="0 0 100 100"
        style={{
          transform: `rotate(${angle}deg)`,
          transition: "transform 160ms ease",
          filter: active
            ? "drop-shadow(0 0 12px rgba(239,68,68,0.9))"
            : "drop-shadow(0 0 5px rgba(148,163,184,0.5))",
        }}
      >
        <polygon
          points="50,5 82,60 60,55 60,95 40,95 40,55 18,60"
          fill={active ? "#ef4444" : "#94a3b8"}
          stroke="white"
          strokeWidth="3"
        />
      </svg>

      <div
        style={{
          background: "rgba(255,255,255,0.82)",
          color: active ? "#991b1b" : "#075f63",
          borderRadius: "999px",
          padding: "3px 9px",
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.04em",
        }}
      >
        {active ? `${Math.round(angle)}° AUDIO` : "AUDIO"}
      </div>
    </div>
  );
}

function Radar2DView() {
  const {
    presence,
    distanceM,
    confidence,
    status,
    soundDetected,
    audioAngleDeg,
    audioDirectionLabel,
    audioDirectionConfidence,
  } = useSensor();

  const [now, setNow] = useState(Date.now());
  const [lastAudio, setLastAudio] = useState({
    angle: 0,
    label: "CENTER",
    confidence: 0,
    until: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (soundDetected) {
      setLastAudio({
        angle: Math.max(-65, Math.min(65, Number(audioAngleDeg || 0))),
        label: audioDirectionLabel || "CENTER",
        confidence: Number(audioDirectionConfidence || 0),
        until: Date.now() + 3000,
      });
    }
  }, [soundDetected, audioAngleDeg, audioDirectionLabel, audioDirectionConfidence]);

  const distance = Math.max(0.2, Math.min(2.0, Math.abs(Number(distanceM ?? 0))));
  const radius = presence ? (distance / 2.0) * 36 : 0;

  const color =
    status === "DETECTED" ? "#22c55e" :
    status === "MONITORING" ? "#facc15" :
    "#38bdf8";

  const audioVisible = now < lastAudio.until;
  const audioAngle = audioVisible ? lastAudio.angle : 0;

  const audioRadius = 34;
  const audioX = 50 + Math.sin((audioAngle * Math.PI) / 180) * audioRadius;
  const audioY = 50 - Math.cos((audioAngle * Math.PI) / 180) * audioRadius;

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

        {audioVisible && (
          <div
            className="radar2d-audio-final"
            style={{
              left: `${audioX}%`,
              top: `${audioY}%`,
            }}
          >
            <span>AUDIO {lastAudio.label}</span>
            <strong>{Math.round(audioAngle)}°</strong>
          </div>
        )}

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
              <span>Radar target</span>
              <strong>~{distance.toFixed(2)} m</strong>
            </div>
          </>
        )}
      </div>

      <div className="radar2d-note">
        Radar target = XM125 · Audio marker = microphone direction
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
          </WebGLCanvas>
        </div>
      )}

      {viewMode === "3d" && <RedAudioArrow />}
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
