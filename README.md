# BROKER for Blackmagic Pocket Camera Bluetooth to MQTT service 
Goal is interconnect Blackmagic Pocket Camera (or others from Blackmagic) with other Network clients.
Because Pocket camera has only Bluetooth connection we need something to bridge bluetooth and wifi.

Connection flow:
- CAMERA
- (bluetooth)
- ESP32-C3/S3 (BT to MQTT logic)
- (wifi network)
- BROKER
- (wifi/hardwire network)
- CLIENTs

## Modules
- MQTT borker server
- Blackmagic Bluetooth connection helper (scan, connect, passcode)
- Blackmagic SDI protocol translator (payload decoder/encoder)

https://github.com/gavalierm/blackmagic-camera-control-protocol/tree/main
