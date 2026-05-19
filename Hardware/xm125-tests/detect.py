from acconeer.exptool import a121

client = a121.Client.open(
    serial_port="/dev/ttyUSB0",
    override_baudrate=115200,
    flow_control=False,
)

print("Connected")
print(client.server_info)