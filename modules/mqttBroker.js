const aedes = require('aedes')({
  heartbeatInterval: 10000,
  connectTimeout: 3000,
})
const aedes_persistence = require('aedes-persistence')

module.exports = class MqttBroker {
  constructor(port = 1883, wsPort = 8892) {
    this.port = port;
    this.wsPort = wsPort;
    this.server = require('net').createServer(aedes.handle)
    this.httpServer = require('http').createServer()
    this.ws = require('websocket-stream').createServer({ server: this.httpServer }, aedes.handle)
  }
  run() {
    // Subscribe to the 'client' event to log the connected clients
    aedes.on('client', (client) => {
      console.log(`[MQTT_s] Client connected [ ${client.id} ]`)
    })
    // emitted when a client subscribes to a message topic
    aedes.on('subscribe', function(subscriptions, client) {
      if (client) {
        console.log(`[MQTT_s] Client sub [ ${(client ? client.id : 'Unknown')} ] > ${subscriptions.map(s => s.topic).join(',')}`)
      }
    })
    // emitted when a client publishes a message packet on the topic
    aedes.on('publish', function(packet, client) {
      if (client) {
        console.log(`[MQTT_s] Client pub [ ${(client ? client.id : 'Unknown')} ] > ${packet.topic} "${packet.payload}"`)
      }
    })

    //For supporting HTTP mqtt clients like PWA
    this.httpServer.listen(this.wsPort, () => {
      console.info('[MQTT_s] MQTT-WS listening on port: ', this.wsPort)
    })

    //For supporting native MQTT client like ESP
    this.server.listen(this.port, () => {
      console.info('[MQTT_s] server started and listening on port ', this.port)
    })
  }
  getPort() {
    return this.port
  }
  getBroker() {
    return aedes
  }
}