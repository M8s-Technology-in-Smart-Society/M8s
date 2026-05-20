# M8Find SAR PoC Context

M8Find is a 14-day proof-of-concept for detecting human presence behind light obstacles using an Acconeer XM125 A121 radar connected to an NVIDIA Jetson Orin Nano.

## Current working state
- Live XM125 sensor data works on Jetson.
- Backend FastAPI WebSocket works.
- Frontend /webgl receives live data and renders moving target markers.
- The current branch is feature/sar-dashboard-polish.
- Do not break the live pipeline.

## Architecture
- Backend: /home/M8s/Software/backend
- Frontend: /home/M8s/Software/M8Find
- Hardware tests: /home/M8s/Hardware/xm125-tests
- Main route for demo: /webgl
- Backend WebSocket: ws://172.20.10.7:8080/ws

## WebSocket frame
{
  "timestamp": "...",
  "source": "xm125",
  "presence": true,
  "distance_m": 0.85,
  "confidence": 72.5,
  "breathing_detected": false,
  "breathing_rate_bpm": null,
  "sound_detected": false,
  "status": "CLEAR | MONITORING | DETECTED",
  "mode": "mock | live",
  "error": null,
  "raw": {
    "inter_presence_score": 1.2,
    "intra_presence_score": 0.8
  }
}

## Scope
Inside scope:
- Single light obstacle: cardboard, wood, drywall
- Short range: 0.5�2 m
- Single target
- Approximate distance and confidence visualization
- Web dashboard via local network
- Mock/live mode support

Outside scope:
- Real SAR certification
- Concrete/brick claims
- Body silhouette rendering
- Multi-target tracking
- Production ruggedized UI
- Cloud connectivity

## UI goal
Create a clear SAR operator dashboard:
- Big status banner: CLEAR / MONITORING / HUMAN DETECTED
- Confidence %
- Distance in meters
- Sensor mode/source
- Sensor connection/error status
- 3D target visualization that is understandable immediately
- Distance rings or depth reference
- Keep audio panel but mark it optional/prototype
- Keep existing routes and components unless clearly broken

## Engineering priorities
Functional > Perfect
Stable > Feature-rich
Repeatable > Experimental
Measured > Assumed
Demonstrated > Promised

## Do not do
- Do not change backend protocol unless absolutely necessary.
- Do not delete working backend/hardware code.
- Do not remove mock mode.
- Do not overengineer.
- Do not claim precise body imaging or guaranteed wall penetration.
