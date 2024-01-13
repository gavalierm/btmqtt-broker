require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const MqttClientService = require("./services/mqttClient");
const mqttClient = new MqttClientService();

const ProtocolService = require("./services/blackmagicProtocol.js");
const protocol = new ProtocolService();

// Example usage
const CameraControlCommandService = require("./services/CameraControlCommand.js");
const ccu = new CameraControlCommandService();

const dataObject = {
	class: 'ccu',
	command: 2,
	destination: 255,
	operation: 255,
	data: {
		category_id: 1,
		category_name: "Video",
		category_key: "video",
		parameter_id: 14,
		name: "ISO",
		key: "iso",
		data_type: "int8",
		index: {
			frame_rate: {
				name: "Frame rate",
				key: 'frame_rate',
				value: 24
			},
			m_rate: {
				name: "M-rate",
				key: 'm_rate',
				value: 1
			},
			dimensions: {
				name: "Dimensions",
				key: 'dimensions',
				value: 3
			},
			interlaced: {
				name: "M-rate",
				key: 'interlaced'
			},
			color_space: {
				name: "Color space",
				key: 'color_space'
			}
		},
		minimum: 0,
		maximum: 2147483647,
		interpretation: "ISO value"
	}
};

//var data = ccu.convertToDatagram(dataObject);
//console.log(ccu.bufferToStringWithSpaces(data));

//var data = ccu.convertToDataobject(data);
//console.log(data);

var data = ccu.convertToDataobject([255, 0, 0, 0, 128, 0, 0, 0]);
console.log(data);


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

		var data = { type: 'ccu', destination: 255, operation: 0, data: { video: { iso: { type: 'int9', value: 400 } } } };
		console.log(protocol.jsonToPayload(data));
		return;

		var _group = protocol['groups'][getRandom(1, protocol['groups'].length - 1)];
		var _param = _group['parameters'][getRandom(0, _group['parameters'].length - 1)];

		var data = [_group['id'], _param['id'], protocol['types'][_param['type']], 0, 1, 2, 3, 4];
		var cmd = [getRandom(5, 10), data.length, 0, 0].concat(data); //header [destination, lenght of data, cmd type, unused]

		mqttClient.publish("btmqtt/" + mqttClient.getIdentity() + "/bt/raw/tx", JSON.stringify(cmd));
	},
	1000);