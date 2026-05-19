from acconeer.exptool import a121
from acconeer.exptool.a121.algo.presence import Detector, DetectorConfig

SERIAL_PORT = "/dev/ttyUSB0"

client = a121.Client.open(
    serial_port="/dev/ttyUSB0",
    override_baudrate=115200,
    flow_control=False,
)

config = DetectorConfig(
    start_m=0.2,
    end_m=2.0,
)

detector = Detector(client=client, sensor_id=1, detector_config=config)

detector.start()

print("Presence test running. Move hand/person in front of sensor. Ctrl+C to stop.")

try:
    while True:
        result = detector.get_next()
        print(
            f"presence={result.presence_detected} | "
            f"inter_score={result.inter_presence_score:.2f} | "
            f"intra_score={result.intra_presence_score:.2f} | "
            f"distance={result.presence_distance:.2f} m"
        )
except KeyboardInterrupt:
    print("Stopping...")
finally:
    detector.stop()
    client.close()
