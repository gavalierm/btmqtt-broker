//https://github.com/michz/tally-server/blob/main/native-ui/index.js
require('console')
//
const ConfigService = require("./services/configHandler")
const MqttBrokerService = require("./services/mqttBroker")
//
const config = new ConfigService();
const mqttBroker = new MqttBrokerService();

//
console.log("btmqtt-broker", config.getVersion());
console.log(config.getConfig());
//

//run
function run() {
	mqttBroker.setPort(config.getConfig()['mqtt']['port'])
	mqttBroker.setWsPort(config.getConfig()['mqtt']['wsPort'])
	mqttBroker.run();
}



//
run();