require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const MqttClientService = require("./services/mqttClient");
const mqttClient = new MqttClientService();

const ProtocolService = require("./services/blackmagicProtocol.js");
const protocol = new ProtocolService();

return;


function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

function onMessage(topic, message) {
	console.log("Faker on message", topic, message.toString('utf-8'));
}

mqttClient.setPort(config.getConfig()['mqtt']['port']);
mqttClient.setIdentity("faker_1");
mqttClient.setOnMessage(onMessage);
mqttClient.connect();

mqttClient.subscribe("btmqtt/" + mqttClient.getIdentity() + "/bt/raw/rx");

var fakerInterval = setInterval(function() {

		console.log(protocol.to_fixed16('0xfd9a'));

		var data = { type: 'ccu', destination: 255, operation: 0, data: { video: { iso: { value: 400 } } } };
		console.log(protocol.jsonToPayload(data));
		return;

		var _group = protocol['groups'][getRandom(1, protocol['groups'].length - 1)];
		var _param = _group['parameters'][getRandom(0, _group['parameters'].length - 1)];

		var data = [_group['id'], _param['id'], protocol['types'][_param['type']], 0, 1, 2, 3, 4];
		var cmd = [getRandom(5, 10), data.length, 0, 0].concat(data); //header [destination, lenght of data, cmd type, unused]

		mqttClient.publish("btmqtt/" + mqttClient.getIdentity() + "/bt/raw/tx", JSON.stringify(cmd));
	},
	1000);