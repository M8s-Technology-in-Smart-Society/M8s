import asyncio
import json
import math
import os
import random
import threading
import time
from datetime import datetime, timezone

import serial
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.sensors.xm125_reader import XM125Reader

MODE = os.getenv("M8_MODE", "mock").lower()
SERIAL_PORT = os.getenv("XM125_SERIAL_PORT", "/dev/ttyUSB0")
AUDIO_SERIAL_PORT = os.getenv("AUDIO_SERIAL_PORT", "/dev/ttyUSB1")
AUDIO_BAUD = int(os.getenv("AUDIO_BAUD", "115200"))

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

audio_state = {
    "connected": False,
    "sound_detected": False,
    "audio_angle_deg": 0,
    "audio_energy": 0,
    "audio_lag": 0,
    "audio_direction_zone": 0,
    "audio_direction_confidence": 0,
    "audio_hold_until": 0,
    "audio_error": None,
    "last_update": None,
}

audio_thread_started = False


def audio_reader_loop():
    global audio_state

    while True:
        try:
            ser = serial.Serial(AUDIO_SERIAL_PORT, AUDIO_BAUD, timeout=1)
            audio_state["connected"] = True
            audio_state["audio_error"] = None

            while True:
                line = ser.readline().decode(errors="ignore").strip()
                if not line:
                    continue

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue

                if data.get("type") != "audio-angle":
                    continue

                audio_state.update({
                    "connected": True,
                    "sound_detected": bool(data.get("sound_detected", False)),
                    "audio_angle_deg": float(data.get("angle", 0) or 0),
                    "audio_energy": int(data.get("energy", 0) or 0),
                    "audio_lag": int(data.get("lag", 0) or 0),
                    "audio_direction_zone": int(data.get("direction_zone", 0) or 0),
                    "audio_direction_confidence": int(data.get("direction_confidence", 0) or 0),
                    "audio_hold_until": time.time() + 3.0 if bool(data.get("sound_detected", False)) else audio_state.get("audio_hold_until", 0),
                    "audio_error": data.get("error"),
                    "last_update": datetime.now(timezone.utc).isoformat(),
                })

        except Exception as e:
            audio_state.update({
                "connected": False,
                "sound_detected": False,
                "audio_error": str(e),
                "last_update": datetime.now(timezone.utc).isoformat(),
            })
            time.sleep(2)


def ensure_audio_thread():
    global audio_thread_started

    if audio_thread_started:
        return

    audio_thread_started = True
    t = threading.Thread(target=audio_reader_loop, daemon=True)
    t.start()


@app.on_event("startup")
def startup():
    ensure_audio_thread()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "m8find-backend",
        "mode": MODE,
        "serial_port": SERIAL_PORT,
        "sensor_ready": reader is not None and reader_error is None,
        "sensor_error": reader_error,
        "audio_serial_port": AUDIO_SERIAL_PORT,
        "audio_connected": audio_state["connected"],
        "audio_error": audio_state["audio_error"],
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


def apply_audio(data):
    now = time.time()

    raw_sound = bool(audio_state.get("sound_detected", False))
    held_sound = now < float(audio_state.get("audio_hold_until", 0) or 0)
    sound_detected = raw_sound or held_sound

    lag = int(audio_state.get("audio_lag", 0) or 0)
    zone = int(audio_state.get("audio_direction_zone", 0) or 0)
    angle = float(audio_state.get("audio_angle_deg", 0) or 0)

    # Fallback angle derivation:
    # Some two-mic readings report angle 0 but lag/zone still tells direction.
    if abs(angle) < 1.0:
        if abs(lag) > 0:
            angle = max(-65.0, min(65.0, (lag / 7.0) * 65.0))
        elif zone < 0:
            angle = -45.0
        elif zone > 0:
            angle = 45.0

    direction_label = "CENTER"
    if angle < -12:
        direction_label = "LEFT"
    elif angle > 12:
        direction_label = "RIGHT"

    direction_conf = int(audio_state.get("audio_direction_confidence", 0) or 0)
    if sound_detected and direction_conf == 0:
        direction_conf = min(100, int(abs(angle) / 65 * 70) + 30)

    data["sound_detected"] = sound_detected
    data["audio_connected"] = bool(audio_state.get("connected", False))
    data["audio_angle_deg"] = round(angle, 1)
    data["audio_energy"] = int(audio_state.get("audio_energy", 0) or 0)
    data["audio_lag"] = lag
    data["audio_direction_zone"] = zone
    data["audio_direction_label"] = direction_label
    data["audio_direction_confidence"] = direction_conf
    data["audio_error"] = audio_state.get("audio_error")

    # Small demo-level confidence boost when radar + knock/sound agree.
    if sound_detected and data.get("presence"):
        data["confidence"] = min(100, round(float(data.get("confidence", 0)) + 8, 1))
        if data["confidence"] >= 72:
            data["status"] = "DETECTED"

    return data


def error_frame(message: str):
    return apply_audio({
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
    })


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

    return apply_audio({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "mock",
        "presence": presence,
        "distance_m": round(0.8 + random.uniform(-0.08, 0.08), 2) if presence else None,
        "confidence": round(confidence, 1),
        "breathing_detected": confidence > 75,
        "breathing_rate_bpm": round(14 + random.uniform(-2, 2), 1) if confidence > 75 else None,
        "sound_detected": False,
        "status": status,
        "mode": "mock",
        "error": None,
        "raw": {
            "inter_presence_score": None,
            "intra_presence_score": None,
        },
    })


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
                        data = apply_audio(data)
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
