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
	console.log("Faker: onMessage", topic, message);
	var data = ccuService.convertToDataobject(message);
	console.log(data);
}

function publish(message) {
	mqttClient.publish("btmqtt/ccu/raw/upstream", message);
}

mqttClient.setPort(config.getConfig()['mqtt']['port']);
mqttClient.setIdentity("faker_raw");
mqttClient.setOnMessage(onMessage);
mqttClient.connect();

mqttClient.subscribe("btmqtt/ccu/raw/downstream");

var cmd = '';
var data = undefined;
var fakerInterval = setInterval(function() {

		console.log("Faker RAW: ", "De", "Le", "Cm", "__", "Ca", "Pa", "Ty", "Op", "1_", "2_", "3_", "4_", "5_", "6_", "7_", "8_")
		cmd = "FF 0A 00 00 81 02 81 00 DD 1A 2B 3C 4D 5E 00 00"
		console.log("Faker RAW: ", cmd);
		publish(ccuService.validateDatagram(cmd)) //create buffer from cmd string
		//publish(cmd)

	},
	10000);