//https://github.com/michz/tally-server/blob/main/native-ui/index.js
require('console')
//
const ConfigService = require("./services/configHandler")
const MqttBrokerService = require("./services/mqttBroker")
const MqttClientService = require("./services/mqttClient")
const CameraControlProtocol = require("./services/CameraControlProtocol.js");
//

const config = new ConfigService();
const mqttBroker = new MqttBrokerService();
const mqttClient = new MqttClientService();
const ccuService = new CameraControlProtocol();
//
console.log("btmqtt-broker", config.getVersion());
console.log(config.getConfig());
//

//run
var log_to_mqtt = false;

function run() {
	//run the mqtt broker
	mqttBroker.setPort(config.getConfig()['mqtt']['port'])
	mqttBroker.setWsPort(config.getConfig()['mqtt']['wsPort'])
	mqttBroker.run();
	//

	if (log_to_mqtt) {
		function onMessage(topic, message) {
			switch (topic) {
				case 'btmqtt/ccu/raw/upstream':
					//received raw message form clients like ESP
					var data = ccuService.convertToDataobject(message);
					//publish translated data to the target downstream / from raw to json
					//console.log(data);
					mqttClient.publish('system/log/ccu/json/downstream', JSON.stringify(data)); //data is json object, serialize before send
					break;
				case 'btmqtt/ccu/json/upstream':
					//received json message from clients like PWA
					//console.log(message.toString());
					var data = ccuService.convertToDatagram(JSON.parse(message.toString()));
					//publish translated data to the target downstream / from json to raw
					mqttClient.publish('system/log/ccu/raw/downstream', ccuService.bufferToStringWithSpaces(data)); //data is a buffer
					break;
			}
		}
		//
		mqttClient.setPort(config.getConfig()['mqtt']['port']);
		mqttClient.setIdentity("serverClient");
		mqttClient.setOnMessage(onMessage);
		mqttClient.connect();

		mqttClient.subscribe("btmqtt/ccu/json/upstream"); //server can receive data only from upstreams
		mqttClient.subscribe("btmqtt/ccu/raw/upstream"); //server can receive data only from upstreams
	}

}



//
run();