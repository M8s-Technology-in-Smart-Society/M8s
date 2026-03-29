import asyncio
import json
import random
from datetime import datetime
import websockets

async def test_sensor():
    uri = "ws://localhost:8000/ws/sensor"

    async with websockets.connect(uri) as ws:
        sensor_id = "sensor-1"
        lat = 66.5039
        lng = 25.7294

        while True:
            lat += random.uniform(-0.0001, 0.0001)
            lng += random.uniform(-0.0001, 0.0001)

            payload = {
                "id": sensor_id,
                "lat": lat,
                "lng": lng,
                "altitude": round(random.uniform(180, 220), 2),
                "speed": round(random.uniform(0, 12), 2),
                "timestamp": datetime.utcnow().isoformat()
            }

            await ws.send(json.dumps(payload))
            reply = await ws.recv()
            print("sent:", payload)
            print("reply:", reply)

            await asyncio.sleep(1)

asyncio.run(test_sensor())