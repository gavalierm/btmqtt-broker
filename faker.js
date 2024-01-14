require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const MqttClientService = require("./services/mqttClient");
const mqttClient = new MqttClientService();

const CameraControlProtocol = require("./services/CameraControlProtocol.js");
const ccuService = new CameraControlProtocol();

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


function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

function onMessage(topic, message) {
	console.log("Faker on message", topic, message.toString('utf-8'));
}

function publish(topic, message) {
	mqttClient.publish("btmqtt/" + mqttClient.getIdentity() + "/bt/raw/tx", JSON.stringify(message));
}

function fakeCommand(command) {
	var obj = {
		class: 'ccu',

		destination: 0,
		commandLength: 0,
		command: 0,
		source: 0,

		data: {
			operation_type: 0
		}
	};

	obj.data = {
		...obj.data,
		...command
	}

	return obj;
}

mqttClient.setPort(config.getConfig()['mqtt']['port']);
mqttClient.setIdentity("faker_1");
mqttClient.setOnMessage(onMessage);
mqttClient.connect();

mqttClient.subscribe("btmqtt/" + mqttClient.getIdentity() + "/bt/raw/rx");

var protocol = ccuService.getProtocol();

var fakerInterval = setInterval(function() {

		//console.log("Faker");
		var group = Object.values(protocol['groups'])[getRandom(0, Object.keys(protocol['groups']).length - 1)]
		var command = Object.values(group['parameters'])[getRandom(0, Object.keys(group['parameters']).length - 1)]
		console.log("Faker", command);
		var data = ccuService.convertToDatagram(fakeCommand(command));
		console.log(ccuService.bufferToStringWithSpaces(data));

		//var data = ccuService.convertToDataobject(data);
		//console.log(data);
		//var data = ccuService.convertToDataobject([255, 0, 0, 0, 128, 2, 0, 0]); //bluetooth handskae
		//var data = ccuService.convertToDataobject([255, 0, 0, 0, 128, 2, 0, 0]); //bluetooth handskae
		//console.log(data);

		//publish("", data);

	},
	100);