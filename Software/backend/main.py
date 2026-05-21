import asyncio
import math
import os
import random
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.sensors.xm125_reader import XM125Reader

MODE = os.getenv("M8_MODE", "mock").lower()
SERIAL_PORT = os.getenv("XM125_SERIAL_PORT", "/dev/ttyUSB0")

app = FastAPI(title="M8Find Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "m8find-backend",
        "mode": MODE,
        "serial_port": SERIAL_PORT,
    }


def make_mock_frame(t: int):
    presence_cycle = math.sin(t / 20)
    presence = presence_cycle > -0.2

    confidence = 10 if not presence else 45 + (presence_cycle + 1) * 25
    confidence += random.uniform(-4, 4)
    confidence = max(0, min(100, confidence))

    if confidence < 30:
        status = "CLEAR"
    elif confidence < 70:
        status = "MONITORING"
    else:
        status = "DETECTED"

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "mock",
        "presence": presence,
        "distance_m": round(0.8 + random.uniform(-0.08, 0.08), 2) if presence else None,
        "confidence": round(confidence, 1),
        "breathing_detected": confidence > 75,
        "breathing_rate_bpm": round(14 + random.uniform(-2, 2), 1) if confidence > 75 else None,
        "sound_detected": random.random() > 0.94,
        "status": status,
        "mode": "mock",
        "error": None,
        "raw": {
            "inter_presence_score": None,
            "intra_presence_score": None,
        },
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    reader = None
    t = 0

    try:
        if MODE == "live":
            reader = XM125Reader(serial_port=SERIAL_PORT)
            reader.start()

        while True:
            if MODE == "live":
                try:
                    data = await asyncio.to_thread(reader.read)
                    data["timestamp"] = datetime.now(timezone.utc).isoformat()
                except Exception as e:
                    data = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "xm125",
                        "presence": False,
                        "distance_m": None,
                        "confidence": 0,
                        "breathing_detected": False,
                        "breathing_rate_bpm": None,
                        "sound_detected": False,
                        "status": "CLEAR",
                        "mode": "live",
                        "error": str(e),
                        "raw": {
                            "inter_presence_score": None,
                            "intra_presence_score": None,
                        },
                    }
                    await asyncio.sleep(0.5)
            else:
                data = make_mock_frame(t)
                t += 1
                await asyncio.sleep(0.15)

            await websocket.send_json(data)

    except WebSocketDisconnect:
        pass
    finally:
        if reader:
            reader.stop()