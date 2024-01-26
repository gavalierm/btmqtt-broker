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


## Auto generated commands for example
```
TESTING: Create datagram from all protocol groups and commands
The fake values are generated with 'value == (max/2)' value.


0 0 Lens Focus
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 00 80 00 00 04 00 00
0 1 Lens Instantaneous autofocus
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 00 01 00 00
0 2 Lens Aperture (f-stop)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 02 80 00 00 40 00 00
0 3 Lens Aperture (normalised)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 03 80 00 00 04 00 00
0 4 Lens Aperture (ordinal)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 04 02 00 80 00 00 00
0 5 Lens Instantaneous auto aperture
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 00 05 00 00
0 6 Lens Optical image stabilisation
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 00 06 00 00
0 7 Lens Set absolute zoom (mm)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 07 02 00 D0 07 00 00
0 8 Lens Set absolute zoom (normalised)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 08 80 00 00 04 00 00
0 9 Lens Set continuous zoom (speed)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 00 09 80 00 00 04 00 00
1 0 Video Video mode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 00 01 00
1 1 Video Gain (up to Camera 4.9)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 01 01 01 00 3F 00 00 00
1 2 Video Manual White Balance
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 01 02 02 00 19 19 00 00
1 3 Video Set auto WB
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 03 00 00
1 4 Video Restore auto WB
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 04 00 00
1 5 Video Exposure (us)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 01 05 03 00 08 52 00 00
1 6 Video Exposure (ordinal)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 06 02 00
1 7 Video Dynamic Range Mode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 01 07 01 00 01 00 00 00
1 8 Video Video sharpening level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 01 08 01 00 01 00 00 00
1 9 Video Recording format
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 09 02 00
1 10 Video Set auto exposure mode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 01 0A 01 00 02 00 00 00
1 11 Video Shutter angle
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 01 0B 03 00 50 46 00 00
1 12 Video Shutter speed
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 01 0C 03 00 C4 09 00 00
1 13 Video Gain
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 01 0D 01 00 3F 00 00 00
1 14 Video ISO
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 01 0E 03 00 FF FF FF 3F
1 15 Video Display LUT
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 01 0F 01 00
1 16 Video ND Filter
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 01 10 80 00 00 40 00 00
2 0 Audio Mic level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 02 00 80 00 00 04 00 00
2 1 Audio Headphone level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 02 01 80 00 00 04 00 00
2 2 Audio Headphone program mix
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 02 02 80 00 00 04 00 00
2 3 Audio Speaker level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 02 03 80 00 00 04 00 00
2 4 Audio Input type
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 02 04 01 00 01 00 00 00
2 5 Audio Input levels
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 02 05 80 00 00 00 04 00
2 6 Audio Phantom power
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 02 06 00 00
3 0 Output Overlay enables
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 03 00 00 00
3 1 Output Frame guides style (Camera 3.x)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 03 01 01 00 04 00 00 00
3 2 Output Frame guides opacity (Camera 3.x)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 03 02 80 00 00 04 00 00
3 3 Output Overlays (replaces .1 and .2 above from Cameras 4.0)
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 03 03 01 00 32 32 32 32
4 0 Display Brightness
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 04 00 80 00 00 04 00 00
4 1 Display Exposure and focus tools
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 04 01 00 00
4 2 Display Zebra level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 04 02 80 00 00 04 00 00
4 3 Display Peaking level
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 04 03 80 00 00 04 00 00
4 4 Display Color bar enable
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 04 04 01 00 0F 00 00 00
4 5 Display Focus Assist
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 04 05 01 00
4 6 Display Program return feed enable
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 04 06 01 00 0F 00 00 00
5 0 Tally Tally brightness
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 05 00 80 00 00 04 00 00
5 1 Tally Front tally brightness
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 05 01 80 00 00 04 00 00
5 2 Tally Rear tally brightness
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 05 02 80 00 00 04 00 00
6 0 Reference Source
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 06 00 01 00 01 00 00 00
6 1 Reference Offset
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 06 01 03 00
7 0 Configuration Real Time Clock
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 07 00 03 00
7 1 Configuration System language
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 07 01 05 00
7 2 Configuration Timezone
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 07 02 03 00
7 3 Configuration Location
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 07 03 04 00
8 0 Color Correction Lift Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 0C 00 00 08 00 80 00 00 00 00 00 08 00 00 00
8 1 Color Correction Gamma Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 0C 00 00 08 01 80 00 00 00 00 00 10 00 00 00
8 2 Color Correction Gain Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 0C 00 00 08 02 80 00 00 00 00 00 40 00 00 00
8 3 Color Correction Offset Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 0C 00 00 08 03 80 00 00 00 00 00 20 00 00 00
8 4 Color Correction Contrast Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 08 04 80 00 00 00 08 00
8 5 Color Correction Luma mix
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 08 05 80 00 00 04 00 00
8 6 Color Correction Color Adjust
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 08 06 80 00 00 00 08 00
8 7 Color Correction Correction Reset Default
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 08 07 00 00
10 0 Media Codec
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0A 00 01 00
10 1 Media Transport mode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0A 01 01 00
10 2 Media Playback Control
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0A 02 01 00
10 3 Media Still Capture
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0A 03 00 00
11 0 PTZ Control Pan/Tilt Velocity
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 0B 00 80 00 00 00 04 00
11 1 PTZ Control Memory Preset
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 0B 01 01 00 02 02 00 00
12 0 Metadata Reel
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 0C 00 02 00 F3 01 00 00
12 1 Metadata Scene Tags
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 01 01 00
12 2 Metadata Scene
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 02 05 00
12 3 Metadata Take
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 0C 03 01 00 31 31 00 00
12 4 Metadata Good Take
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 04 00 00
12 5 Metadata Camera ID
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 05 05 00
12 6 Metadata Camera Operator
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 06 05 00
12 7 Metadata Director
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 07 05 00
12 8 Metadata Project Name
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 08 05 00
12 9 Metadata Lens Type
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 09 05 00
12 10 Metadata Lens Iris
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 0A 05 00
12 11 Metadata Lens Focal Length
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 0B 05 00
12 12 Metadata Lens Distance
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 0C 05 00
12 13 Metadata Lens Filter
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 0D 05 00
12 14 Metadata Slate Mode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 0C 0E 01 00
128 0 RGB Tally Signaling tally
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 80 00 01 00 04 00 00 00
128 1 RGB Tally Set tally
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 06 00 00 80 01 01 00 00 00 00 00
128 2 RGB Tally Set tally color
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 80 02 81 00 7F 7F 7F 7F
129 0 Bluetooth Notify
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 05 00 00 81 00 01 00 3F 00 00 00
129 1 Bluetooth Disconnect
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 04 00 00 81 01 00 00
129 2 Bluetooth Connect
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 0A 00 00 81 02 81 00 7F 7F 7F 7F 7F 7F 00 00
129 3 Bluetooth Passcode
De Le Cm __ Ca Pa Ty Op 1_ 2_ 3_ 4_ 5_ 6_ 7_ 8_
FF 08 00 00 81 03 03 00 1F A1 07 00
```
