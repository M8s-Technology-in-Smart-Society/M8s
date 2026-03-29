"""
WEBSOCKET CONNECT FROM SENSOR

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json

app = FastAPI()

@app.websocket("/ws/sensor")
async def sensor_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)

            await websocket.send_json({
                "status": "ok",
                "received": payload.get("id")
            })
    except WebSocketDisconnect:
        print("Client disconnected")"""