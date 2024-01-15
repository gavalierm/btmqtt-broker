require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const MqttClientService = require("./services/mqttClient");
const mqttClient = new MqttClientService();

const CameraControlProtocol = require("./services/CameraControlProtocol.js");
const ccuService = new CameraControlProtocol();


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

	for (const k in command.props) {
		//fake values set to max
		command.props[k].value = command.props[k].max;
	}

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

//var data = ccuService.convertToDataobject("FF 0C 00 00 80 01 02 00 FF FF FF FF 00 00 00 00");
//console.log(data, data.data.props);
//return;
var protocol = ccuService.getProtocol();

const groups_k = Object.keys(protocol['groups']).length - 1

var k = 0;
var c = 0;
var fakerInterval = setInterval(function() {
		return;
		//console.log("Faker");
		//var group = Object.values(protocol['groups'])[getRandom(0, Object.keys(protocol['groups']).length - 1)]
		//var command = Object.values(group['parameters'])[getRandom(0, Object.keys(group['parameters']).length - 1)]
		var group = Object.values(protocol['groups'])[k]
		var command = Object.values(group['parameters'])[c]

		c++;
		if (c > (Object.keys(group['parameters']).length - 1)) {
			k++;
			c = 0;
		}

		//console.log("Faker", command);
		var data = ccuService.convertToDatagram(fakeCommand(command));
		console.log(command.group_id, command.id, command.group_name, command.name)
		console.log("De", "Le", "Cm", "__", "Ca", "Pa", "Ty", "Op", "1_", "2_", "3_", "4_", "5_", "6_", "7_", "8_")
		console.log(ccuService.bufferToStringWithSpaces(data));

		//var data = ccuService.convertToDataobject(ccuService.bufferToStringWithSpaces(data));
		//console.log(data.data.props);

		//var data = ccuService.convertToDataobject(data);
		//console.log(data);
		//var data = ccuService.convertToDataobject("FF 06 00 00 05 00 80 00 00 08"); //bluetooth handskae
		//var data = ccuService.convertToDataobject("FF 04 00 00 81 01 02 00 DD 1A 2B 3C 4D 5E 00 00"); //bluetooth handskae
		//console.log(data.data);

		//publish("", data);

	},
	1);

var data = ccuService.convertToDataobject("FF 0A 00 00 81 01 81 00 DD 1A 2B 3C 4D 5E 00 00"); //bluetooth handskae
console.log(data.data);