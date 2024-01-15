require('console');
const fs = require('fs')

const ConfigService = require("./services/configHandler");
const config = new ConfigService();

const CameraControlProtocol = require("./services/CameraControlProtocol.js");
const ccuService = new CameraControlProtocol();
var protocol = ccuService.getProtocol();

function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}



const groups_k = Object.keys(protocol['groups']).length - 1

console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTESTING: Create datagram from all protocol groups and commands\nThe fake values are generated with 'value == (max/2)' value.\n\n")

var commands = [];
for (const k in protocol['groups']) {
	var group = protocol['groups'][k]
	for (const c in group['parameters']) {
		var command = group['parameters'][c]

		//console.log("Faker", command);
		var data = ccuService.convertToDatagram(ccuService.fakeCommand(command));
		console.log(command.group_id, command.id, command.group_name, command.name)
		console.log("De", "Le", "Cm", "__", "Ca", "Pa", "Ty", "Op", "1_", "2_", "3_", "4_", "5_", "6_", "7_", "8_")
		var cmd = ccuService.bufferToStringWithSpaces(data)
		console.log(cmd);
		commands.push(cmd);
		//var data = ccuService.convertToDataobject(ccuService.bufferToStringWithSpaces(data));
		//console.log(data.data.props);

		//var data = ccuService.convertToDataobject(data);
		//console.log(data);
		//var data = ccuService.convertToDataobject("FF 06 00 00 05 00 80 00 00 08"); //bluetooth handskae
		//var data = ccuService.convertToDataobject("FF 04 00 00 81 01 02 00 DD 1A 2B 3C 4D 5E 00 00"); //bluetooth handskae
		//console.log(data.data);
	}
}

console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nTESTING: Create json from all commands\nIf the value == (max/2) the data was readed correctly\n\n")

for (const c in commands) {
	var data = ccuService.convertToDataobject(commands[c]);
	console.log(data.data.props);
}
console.log("Done");