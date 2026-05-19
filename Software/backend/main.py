from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import asyncio
import math
import random

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
    return {"status": "ok", "service": "m8find-backend"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    t = 0

    while True:
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

        data = {
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
        }

        await websocket.send_json(data)
        t += 1
        await asyncio.sleep(0.15)
