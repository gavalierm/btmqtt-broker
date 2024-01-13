//https://docs.allthingstalk.com/developers/javascript-conversion/
require('console');
const fs = require('fs')
//
module.exports = class blackmagicProtocol {
	// Packet Format Index

	constructor() {
		this.protocol = JSON.parse(fs.readFileSync('./PROTOCOL.json', 'utf8'))
		var categories = {};

		for (var c = 0; c < this.protocol['categories'].length; c++) {
			var category = this.protocol['categories'][c];
			categories[this.protocol['categories'][c]['key']] = category;
			var parameters = {};
			for (var p = 0; p < category['parameters'].length; p++) {
				category['parameters'][p]['category_key'] = this.protocol['categories'][c]['key'];
				parameters[category['parameters'][p]['key']] = category['parameters'][p];
			}
			categories[this.protocol['categories'][c]['key']]['parameters'] = parameters;
		}
		this.protocol['categories'] = categories;
	}

	getProtocol() {
		return this.protocol;
	}

	hexToBytes(hex) {
		for (var bytes = [], c = 0; c < hex.length; c += 2)
			bytes.push(parseInt(hex.substr(c, 2), 16));
		return bytes;
	}

	bin16dec(bin) {
		var num = bin & 0xFFFF;
		if (0x8000 & num)
			num = -(0x010000 - num);
		return num;
	}

	bin8dec(bin) {
		var num = bin & 0xFF;
		if (0x80 & num)
			num = -(0x0100 - num);
		return num;
	}

	decodePayload(payload) {
		var obj = new Object();
		data = this.hexToBytes(payload);
		//
		var obj = {
			destination_device: data[0],
			command_id: data[2],
			category: data[4],
			parameter: data[5],
			data_type: data[6],
			operation: data[7],
			data: [...data.slice(8, 8 + (data[1] - 4))]
		};
		//
		return obj;
	}

	jsonToPayload(data) {
		console.log("parseJsonCommand");
		//{ type: 'ccu', destination: 255, operation: 0, data: { video: { iso: { value: 400 } } } }
		if (!data.hasOwnProperty("type")) { //check type (ccu, tally, bt)
			return;
		}

		var payload = [];

		//custom structure types addes as very first 4 bytes
		//because we want send and haldne different data structures on ESP32
		//bt handshaking
		//tally commands
		//ccu commands
		payload.push(this.protocol['custom_structure_type'][data['type']]);
		payload.push(0);
		payload.push(0);
		payload.push(0);
		//

		//next we will continue with default SDI protocol for each structure
		// Execute the function using the variable
		if (typeof this[data['type'] + "ParseJson"] === 'function') {
			payload.concat(this[data['type'] + "ParseJson"](data));
		} else {
			console.error(`Function '${data['type'] + "ParseJson"}' not found`);
		}

		return payload;
	}


	btParseJson(data) {
		console.log("btParseJson");

	}

	tallyParseJson(data) {
		console.log("tallyParseJson");

	}

	ccuParseJson(data) {
		console.log("ccuParseJson");
		var payload = [];

		//we need convert value to the payload data and determine lenght
		//data lenght included 4 bytes category, parameter, type, operation
		//{ type: 'ccu', destination: 255, operation: 'assignValue', data: { video: { iso: { value: 400 } } } }
		var datagram = [];
		for (const c in data['data']) {
			for (const p in data['data'][c]) {
				data['data'][c][p] = {
					...this.protocol['categories'][c]['parameters'][p],
					...data['data'][c][p]
				};
				//Category
				datagram.push(data[c][p]['category_id']);
				//Paramter
				datagram.push(data[c][p]['category_id']);
				//Type
				datagram.push(this.protocol['dataTypes'][data[c][p]['data_type']]);
				//Operation
				datagram.push(this.protocol['operationTypes'][data['operation']]);
			}
		}
		//now we have merged parameter with value in it
		//create ccu datagram


		//Destination
		payload.push(data['destination']);
		//Length
		payload.push(datagram.lenght);
		//Command id
		payload.push(this.protocol['commands']['changeConfiguration']);
		//Reserved
		payload.push(0);

		//Data
		payload.concat(datagram);

		return payload;
	}
	encodeValue(type, value) {
		return this[type](value);
	}

	to_fixed16(value) {
		return this.hexToSigned5_11FixedPoint(value);
	}

	hexToSigned5_11FixedPoint(hexValue) {
		Buffer.from([0x00, 0xe0]).readUIntLE(0, 2)
		// Convert hexadecimal to signed 16-bit integer
		const int16Value = hexValue & 0xFFFF;

		// Interpret as signed 5.11 fixed-point
		const signBit = (int16Value & 0x8000) ? -1 : 1;
		const integerPart = (int16Value >> 11) & 0x1F; // Extract the most significant 5 bits
		const fractionalPart = (int16Value & 0x7FF) / 2048; // Extract the least significant 11 bits

		// Calculate the fixed-point value
		const fixedPointValue = signBit * (integerPart + fractionalPart);

		return fixedPointValue;
	}

}