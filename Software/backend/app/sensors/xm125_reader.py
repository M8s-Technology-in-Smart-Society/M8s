from acconeer.exptool import a121
from acconeer.exptool.a121.algo.presence import Detector, DetectorConfig


class XM125Reader:
    def __init__(self, serial_port="/dev/ttyUSB0"):
        self.serial_port = serial_port
        self.client = None
        self.detector = None

    def start(self):
        self.client = a121.Client.open(
            serial_port=self.serial_port,
            override_baudrate=115200,
            flow_control=False,
        )

        config = DetectorConfig(
            start_m=0.2,
            end_m=2.0,
        )

        self.detector = Detector(
            client=self.client,
            sensor_id=1,
            detector_config=config,
        )

        self.detector.start()

    def read(self):
        result = self.detector.get_next()

        inter = float(getattr(result, "inter_presence_score", 0.0))
        intra = float(getattr(result, "intra_presence_score", 0.0))
        presence = bool(getattr(result, "presence_detected", False))
        distance = getattr(result, "presence_distance", None)

        raw_score = max(inter, intra)
        confidence = min(100.0, raw_score * 25.0)

        if not presence and confidence < 30:
            status = "CLEAR"
        elif confidence < 70:
            status = "MONITORING"
        else:
            status = "DETECTED"

        return {
            "source": "xm125",
            "presence": presence,
            "distance_m": round(float(distance), 2) if distance is not None else None,
            "confidence": round(confidence, 1),
            "breathing_detected": False,
            "breathing_rate_bpm": None,
            "sound_detected": False,
            "status": status,
            "mode": "live",
            "error": None,
            "raw": {
                "inter_presence_score": round(inter, 3),
                "intra_presence_score": round(intra, 3),
            },
        }

    def stop(self):
        try:
            if self.detector:
                self.detector.stop()
        finally:
            if self.client:
                self.client.close()