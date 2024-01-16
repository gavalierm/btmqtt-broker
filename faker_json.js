require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const MqttClientService = require("./services/mqttClient");
const mqttClient = new MqttClientService();

const CameraControlProtocol = require("./services/CameraControlProtocol.js");
const ccuService = new CameraControlProtocol();
const protocol = ccuService.getProtocol();


function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

function onMessage(topic, message) {
	console.log("Faker: onMessage", topic, message);
	var data = ccuService.convertToDataobject(message);
	console.log(data);
}

function publish(message) {
	mqttClient.publish("btmqtt/ccu/json/downstream", message);
}

mqttClient.setPort(config.getConfig()['mqtt']['port']);
mqttClient.setIdentity("faker_json");
mqttClient.setOnMessage(onMessage);
mqttClient.connect();

mqttClient.subscribe("btmqtt/ccu/json/upstream");

var cmd = '';
var data = undefined;
var fakerInterval = setInterval(function() {
		var command = protocol['groups']['video']['parameters']['iso'];
		var data = ccuService.fakeCommand(command); //get object
		console.log("Faker JSON: ", data);
		publish(JSON.stringify(data)) //create string from object
		//publish(cmd)

	},
	10000);