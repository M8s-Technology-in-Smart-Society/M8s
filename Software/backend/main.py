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

reader = None
reader_error = None
reader_start_lock = asyncio.Lock()
reader_read_lock = asyncio.Lock()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "m8find-backend",
        "mode": MODE,
        "serial_port": SERIAL_PORT,
        "sensor_ready": reader is not None and reader_error is None,
        "sensor_error": reader_error,
    }


async def ensure_reader_started():
    global reader, reader_error

    if MODE != "live":
        return

    async with reader_start_lock:
        if reader is not None:
            return

        try:
            reader = XM125Reader(serial_port=SERIAL_PORT)
            await asyncio.to_thread(reader.start)
            reader_error = None
        except Exception as e:
            reader = None
            reader_error = str(e)


def error_frame(message: str):
    return {
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
        "error": message,
        "raw": {
            "inter_presence_score": None,
            "intra_presence_score": None,
        },
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
    t = 0

    try:
        await ensure_reader_started()

        while True:
            if MODE == "live":
                if reader is None:
                    data = error_frame(reader_error or f"XM125 not available on {SERIAL_PORT}")
                    await asyncio.sleep(0.5)
                else:
                    try:
                        async with reader_read_lock:
                            data = await asyncio.to_thread(reader.read)

                        data["timestamp"] = datetime.now(timezone.utc).isoformat()
                        data["mode"] = "live"
                        data["source"] = data.get("source", "xm125")
                        data["error"] = None
                    except Exception as e:
                        data = error_frame(str(e))
                        await asyncio.sleep(0.5)
            else:
                data = make_mock_frame(t)
                t += 1
                await asyncio.sleep(0.15)

            await websocket.send_json(data)

    except WebSocketDisconnect:
        pass
