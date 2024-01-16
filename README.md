# BROKER for Blackmagic Pocket Camera BLUETOOTH to MQTT service

The goal is to establish interconnectivity between the Blackmagic Pocket Camera (or other Blackmagic cameras) and various network clients. Since the Pocket Camera exclusively utilizes Bluetooth for connectivity, we require a solution to bridge the gap between Bluetooth and Wi-Fi.

## Connection scenario:
- CAMERA
- (Bluetooth)
- ESP32-C3/S3 (Bluetooth to MQTT logic)
- (Wi-Fi network)
- BROKER
- (Wi-Fi/hardwired network)
- CLIENTs

## Protocol
The protocol is automatically generated and can be found at [https://github.com/gavalierm/blackmagic-camera-control-protocol/tree/main](https://github.com/gavalierm/blackmagic-camera-control-protocol/tree/main).

## Dataflow
The concept is straightforward – do not manipulate the data, just forward it to MQTT as a buffer. However, the default CCU protocol doesn't account for Bluetooth handshakes, passcode exchanges, and similar processes. Therefore, some custom procedures are necessary. This involves utilizing the CCU protocol structure and leveraging free data values to incorporate the required elements (refer to protocol notes).

As the custom protocol data is generated on the ESP itself and sent to MQTT, and vice versa, the ESP handles the processing of this custom data. It doesn't transmit this data to the camera since the camera wouldn't dont use it. However, since the data is structured in the same way as the original protocol, the camera simply discards the data as valid but not useful, if data will be forwarded anyway.
