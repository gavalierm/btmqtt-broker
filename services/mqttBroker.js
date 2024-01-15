const aedes = require('aedes')({
  heartbeatInterval: 10000,
  connectTimeout: 3000,
})
const aedes_persistence = require('aedes-persistence')

module.exports = class MqttBroker {

  port = 1883;
  wsPort = 8883;
  server = null;
  httpServer = null;
  ws = null;

  constructor() {
    this.server = require('net').createServer(aedes.handle)
    this.httpServer = require('http').createServer()
    this.ws = require('websocket-stream').createServer({ server: this.httpServer }, aedes.handle)
  }

  run() {
    function bufferToStringWithSpaces(buffer) {
      let result = '';

      for (let i = 0; i < buffer.length; i++) {
        const byte = buffer.readUInt8(i).toString(16).padStart(2, '0');
        result += byte.toUpperCase() + ' ';
      }

      return result.trim();
    }
    // Subscribe to the 'client' event to log the connected clients
    aedes.on('client', (client) => {
      console.log(`[MQTT_broker] Client connected [ ${client.id} ]`)
    })
    // emitted when a client subscribes to a message topic
    aedes.on('subscribe', function(subscriptions, client) {
      if (client) {
        console.log(`[MQTT_broker] Client Sub [ ${(client ? client.id : 'Unknown')} ] >`, subscriptions.map(s => s.topic).join(','))
      }
    })
    // emitted when a client publishes a message packet on the topic
    aedes.on('publish', function(packet, client) {
      if (client && packet.topic != 'system/heartbeat') {
        console.log(typeof packet.payload, `[MQTT_broker] Client Pub [ ${(client ? client.id : 'Unknown')} ] >`, packet.topic, (typeof packet.payload == 'string' || typeof packet.payload == 'object') ? packet.payload : bufferToStringWithSpaces(packet.payload))
      }
    })
    //For supporting native MQTT client like ESP
    this.server.listen(this.port, () => {
      console.info('[MQTT_broker] MQTT-NATIVE listening on port: ', this.port)
    })
    //For supporting HTTP mqtt clients like PWA
    this.httpServer.listen(this.wsPort, () => {
      console.info('[MQTT_broker] MQTT-WS listening on port: ', this.wsPort)
    })
  }
  setPort(port) {
    if (!port) {
      return
    }
    this.port = port;
  }

  getPort() {
    return this.port
  }

  setWsPort(port) {
    if (!port) {
      return
    }
    this.wsPort = port;
  }

  getWsPort() {
    return this.wsPort
  }
}