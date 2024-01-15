//https://docs.allthingstalk.com/developers/javascript-conversion/
const assert = require('assert');
require('console');
const fs = require('fs')
//
module.exports = class CameraControlProtocol {
	constructor() {
		//parse protocol schema from file
		this.PATH = './PROTOCOL.json';
		this.PROTOCOL = JSON.parse(fs.readFileSync(this.PATH, 'utf8'))

		// Define the lengths of different types for padding calculations
		this.TYPES_LENGHTS = {
			void: 0,
			boolean: 1,
			int8: 1,
			int16: 2,
			int32: 4,
			int64: 8,
			string: 0, // Variable length, calculated dynamically
			fixed16: 2,
			uInt8: 1,
		};
		this.DATA_TYPES = {
			void: -1, //have to be same as boolean: 0, but we fix this futher in code
			boolean: 0,
			int8: 1,
			int16: 2,
			int32: 3,
			int64: 4,
			string: 5,
			fixed16: 128,
			uInt8: 129 //custom beacuse mac address
		};

		this.OPERATION_TYPES = {
			assignValue: 0,
			offsetValue: 1,
			statusUpdate: 2
		}

		this.STRUCT = {
			destination: 0,
			commandLength: 1,
			command: 2,
			source: 3,
			group: 4,
			parameter: 5,
			dataType: 6,
			operationType: 7,
			payloadStart: 8

		}

	}

	getProtocol() {
		return JSON.parse(JSON.stringify(this.PROTOCOL));
	}

	getKeyByValue(object, value) {
		if (object == undefined) {
			return undefined;
		}

		return Object.keys(object).find(key => object[key] === value);
	}

	// Function to calculate the padding required for the datablock
	calculatePadding(length) {
		if (!length) {
			return length;
		}
		const remainder = length % 4;
		const padding = remainder === 0 ? 0 : 4 - remainder;
		return length + padding;
	}

	// Function to calculate the length of the datablock after conversion
	calculateDatablockLength(dataBlock) {
		let length = 0;
		if (dataBlock.hasOwnProperty('props') && dataBlock.props !== undefined && this.objLenght(dataBlock.props) !== 0) {
			//console.log("Inside Proprs", dataBlock.props);
			for (const k in dataBlock.props) {
				if (dataBlock.props[k].value == undefined || dataBlock.props[k].value == null) {
					continue
				}
				if (dataBlock.data_type === 'string') {
					// For strings, add the length of the string and the null terminator
					length += Buffer.from(dataBlock.props[k].value, 'utf-8').length + 1;
				} else {
					length += this.TYPES_LENGHTS[dataBlock.data_type];
				}
			}
		}
		return length; //because padding is not counted
	}

	// Function to convert dataObject to datagram
	convertToDatagram(dataObject) {

		assert(dataObject !== undefined, 'dataObject must be specified');
		//assert(dataObject.destination !== undefined, 'destination must be specified');
		//assert(dataObject.source !== undefined, 'source must be specified');
		//assert(dataObject.command !== undefined, 'command must be specified');

		assert(dataObject.data !== undefined, 'data must be specified');
		//
		assert(dataObject.data.group_id !== undefined, 'data.group_id must be specified');
		assert(dataObject.data.id !== undefined, 'data.id must be specified');
		//assert(dataObject.data.data_type !== undefined, 'data.data_type must be specified');
		//assert(dataObject.data.operation_type !== undefined, 'data.operation_type must be specified');


		const destination = dataObject.destination ? dataObject.destination : 255;
		const operationType = dataObject.operation ? dataObject.operation : 'assignValue';
		//console.log("Props", dataObject.data.props);
		const datablockLength = this.calculateDatablockLength(dataObject.data);
		//console.log("len", this.calculatePadding(datablockLength));
		const buffer = Buffer.alloc(8 + this.calculatePadding(datablockLength)); // 8 bytes for the header + data + padding

		const offset = 0;
		// Write header
		buffer.writeUInt8(destination, offset + this.STRUCT.destination);
		buffer.writeUInt8(4 + datablockLength, offset + this.STRUCT.commandLength);
		buffer.writeUInt8(dataObject.id, offset + this.STRUCT.command);
		buffer.writeUInt8(0, offset + this.STRUCT.source); // Unused byte
		//
		//return buffer;
		buffer.writeUInt8(dataObject.data.group_id, offset + this.STRUCT.group);
		buffer.writeUInt8(dataObject.data.id, offset + this.STRUCT.parameter);
		buffer.writeUInt8((this.DATA_TYPES[dataObject.data.data_type] < 0) ? 0 : this.DATA_TYPES[dataObject.data.data_type], offset + this.STRUCT.dataType); //void interpreted as 0 not -1 which is out of range
		buffer.writeUInt8(this.OPERATION_TYPES[operationType], offset + this.STRUCT.operationType);
		//return buffer;
		// Write datablock
		if (dataObject.data.props !== undefined && this.objLenght(dataObject.data.props) !== 0) {
			var i = 0;
			for (const k in dataObject.data.props) {
				//console.log("BUILDING DATA");
				if (!dataObject.data.props[k].hasOwnProperty('value') || dataObject.data.props[k].value == undefined || dataObject.data.props[k].value == null) {
					i++;
					continue;
				}
				//console.log("BUILDING DATA");
				this.writeDatablock(buffer, dataObject.data.data_type, dataObject.data.props[k].value, offset + this.STRUCT.payloadStart + i); //(this.TYPES_LENGHTS[dataObject.data.data_type] * i) //if wrong data?
				i++;
			}
		}

		return buffer;
	}

	// Function to write the datablock to the buffer
	minMax(value, min, max) {
		return (value > max) ? max : ((value < min) ? min : value)
	}
	writeDatablock(buffer, type, value, offset) {
		// Write the value based on the type
		switch (type) {
			case 'uInt8':
				buffer.writeUInt8(this.minMax(value, 0, 255), offset);
				break;
			case 'void':
				//void do not have value
				//console.log("Void");
				break;
			case 'boolean':
				buffer.writeUInt8(value ? 1 : 0, offset);
				break;
			case 'int8':
				buffer.writeInt8(this.minMax(value, -128, 127), offset);
				break;
			case 'int16':
				buffer.writeInt16LE(this.minMax(value, -32768, 32767), offset);
				offset = offset + 1;
				break;
			case 'int32':
				buffer.writeInt32LE(this.minMax(value, -2147483648, 2147483647), offset);
				break;
			case 'int64':
				buffer.writeBigInt64LE(this.minMax(BigInt(value), (2 ^ 63) * -1, 2 ^ 63 - 1), offset);
				break;
			case 'string':
				// Write the string at the current offset
				buffer.write(value, offset, 'utf-8');
				// Add null terminator
				buffer.writeUInt8(0, offset + Buffer.from(value, 'utf-8').length);
				break;
			case 'fixed16':
				buffer.writeInt16LE(this.minMax(Math.round(value * (1 << 11)), -32768, 32767), offset);
				break;
			default:
				throw new Error(`Invalid type: ${type}`);
		}
		//We need padd the data to their data_type?
		// MAC address is FF FF FF FF FF FF which is 255 255 255 255 255 255 which is int16 (int8 is only 127)
		// but int16 takes 2 bytes so the we need spacing like FF 00 FF 00 FF 00 FF 00 FF 00 FF 00
		// because FF FF will be translated to 65535 not 255 255 
		//console.log(buffer.length, this.calculatePadding(buffer.length));
		//buffer.fill(0, offset, this.calculatePadding(buffer.length));
	}

	// Function to reverse convert datagram to dataObject
	convertToDataobject(datagram) {

		assert(datagram !== undefined, 'datagram must be specified');
		if (typeof datagram == 'string') {
			// Split the clean MAC address into pairs of two characters
			datagram = datagram.replace(/[:\s]/g, '').match(/.{2}/g).map(hex => parseInt(hex, 16));
		}
		if (Array.isArray(datagram)) {
			datagram = this.arrayToBuffer(datagram);
		}

		const offset = 0;

		const destination = datagram.readUInt8(offset + this.STRUCT.destination);
		const commandLength = datagram.readUInt8(offset + this.STRUCT.commandLength);
		const command = datagram.readUInt8(offset + this.STRUCT.command);
		const source = datagram.readUInt8(offset + this.STRUCT.source);

		const datablock = datagram.slice(offset + this.STRUCT.payloadStart, 8 + commandLength); //befor because we need lenght
		//console.log(datablock.length);
		const group = datagram.readUInt8(offset + this.STRUCT.group);
		const parameter = datagram.readUInt8(offset + this.STRUCT.parameter);
		const dataType = this.getKeyByValue(this.DATA_TYPES, (datagram.readUInt8(offset + this.STRUCT.dataType) == 0 && datablock.length == 0) ? -1 : datagram.readUInt8(offset + this.STRUCT.dataType));
		const operationType = this.getKeyByValue(this.OPERATION_TYPES, datagram.readUInt8(offset + this.STRUCT.operationType));

		var dataObject = {
			class: 'ccu',

			destination: destination,
			commandLength: commandLength,
			command: command,
			source: source,

			data: {
				group_id: group,
				id: parameter,
				data_type: dataType,
				operation_type: operationType,
				//props: {}
			}
		};

		//we need to determine packet type by group_id and id and found protocol stcuture to merge
		//this is first time when protocol is needed to decode message
		var protocol_object = this.findObjectInProtocol(group, parameter);
		//
		//console.log(protocol_object);
		//return protocol_object;
		dataObject.data = {
			...protocol_object,
			...dataObject.data
		}

		//return dataObject;
		//We now hove merged object as json - is time to read datablock from datagram based on object props 
		//here real magic starts
		/**
		 data: {
		    group_id: 128,
		    group_name: 'RGB Tally',
		    group_key: 'rgb_tally',
		    id: 1,
		    name: 'Set tally color',
		    key: 'set_tally_color',
		    data_type: 'boolean',
		    interpretation: 'Custom: Set RGB color to tally RR GG BB YY',
		    props: 
		    {
			  red: { name: 'Red', key: 'red', max: 255, value: null },
			  green: { name: 'Green', key: 'green', max: 255, value: null },
			  blue: { name: 'Blue', key: 'blue', max: 255, value: null },
			  luma: { name: 'Luma', key: 'luma', max: 255, value: null }
			},
		    operation_type: 'assignValue'
		  }
		 **/
		var i = 0;
		for (var p in dataObject.data.props) {
			var prop = dataObject.data.props[p];
			// every prop prepresent the index of command, if command has no index the only one prop is populated - "default" prop 
			//console.log(this.objLenght(dataObject.data.props));
			if (p !== "default" && this.objLenght(dataObject.data.props) == 1) {
				//strange, because one prop = no index and no index = default
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
				console.log("This prop violate the index logic", p)
				console.log("This is not huge problem if you dont need this command in real life, but is good to update the PROTOCOL file and fix the issues.")
				console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
			}
			//read value
			//console.log(dataObject.data.group_id, dataObject.data.id, dataObject.data.name, p, dataObject.data.data_type, datablock.length);
			//console.log(datablock.length, i);
			const value = this.readValue(datablock, i, dataObject.data.data_type) //(this.TYPES_LENGHTS[dataObject.data.data_type] * i) //if wrong data?
			//console.log(value);
			dataObject.data.props[p].value = value;
			i++
		}

		return dataObject;
	}

	findObjectInProtocol(group, parameter) {
		//
		//console.log(group, parameter);
		//
		for (const c in this.PROTOCOL.groups) {
			if (this.PROTOCOL.groups[c]['id'] != group) {
				continue;
			}
			//console.log("found");
			for (const p in this.PROTOCOL.groups[c]['parameters']) {
				if (this.PROTOCOL.groups[c]['parameters'][p]['id'] != parameter) {
					continue;
				}
				//console.log("found");
				return this.PROTOCOL.groups[c]['parameters'][p];
				break;
			}
			break;
		}
		//console.log("not found");
		return null;
	}

	// Function to read a value of a specific type from the buffer
	readValue(buffer, offset, type) {
		//console.log(buffer.length, offset)
		if (buffer.length == 0 || offset >= buffer.length) {
			//console.log("NO DATA in BUFFER")
			return null
		}
		switch (type) {
			case 'uInt8':
				return buffer.readUInt8(offset);
			case 'void':
				return null;
			case 'boolean':
				return buffer.readUInt8(offset) !== 0;
			case 'int8':
				return buffer.readInt8(offset);
			case 'int16':
				return buffer.readInt16LE(offset);
			case 'int32':
				return buffer.readInt32LE(offset);
			case 'int64':
				return buffer.readBigInt64LE(offset);
			case 'string':
				// Read the string until the null terminator
				let str = '';
				while (buffer.readUInt8(offset) !== 0) {
					str += String.fromCharCode(buffer.readUInt8(offset++));
				}
				return str;
			case 'fixed16':
				// Read the fixed16 value and convert back to float
				return buffer.readInt16LE(offset) / (1 << 11);
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	}
	bufferToStringWithSpaces(buffer) {
		let result = '';

		for (let i = 0; i < buffer.length; i++) {
			const byte = buffer.readUInt8(i).toString(16).padStart(2, '0');
			result += byte.toUpperCase() + ' ';
		}

		return result.trim();
	}

	arrayToBuffer(hexArray) {
		const buffer = Buffer.from(hexArray);
		return buffer;
	}

	regenerateProtocolFile() {
		var protocol = JSON.parse(fs.readFileSync(this.PATH, 'utf8'))
		var groups = {};
		//for (var c = 0; c < this.objLenght(protocol['groups']); c++) {
		for (var c in protocol['groups']) {
			//
			var group = protocol['groups'][c];
			//

			var parameters = {};
			//for (var p = 0; p < this.objLenght(group['parameters']); p++) {
			for (var p in group['parameters']) {
				//
				var parameter = {
					group_id: group.id,
					group_name: group.name,
					group_key: group.key,
					id: group['parameters'][p].id,
					name: group['parameters'][p].name,
					key: group['parameters'][p].key,
					data_type: group['parameters'][p].data_type,
					interpretation: group['parameters'][p].interpretation ? group['parameters'][p].interpretation : ''
				}
				//
				var datas = {};
				if (this.objLenght(group['parameters'][p]['props']) == 0 && group['parameters'][p].data_type !== 'void') {
					group['parameters'][p]['props'] = ["Default"];
				}
				if (this.objLenght(group['parameters'][p]['props']) == 0 && group['parameters'][p].data_type == 'boolean') {
					group['parameters'][p]['props'] = ["Default"];
					group['parameters'][p]['min'] = 0;
					group['parameters'][p]['max'] = 1;
				}
				//for (var i = 0; i < this.objLenght(group['parameters'][p]['props']); i++) {
				for (var i in group['parameters'][p]['props']) {
					//
					var index = {
						name: group['parameters'][p]['props'][i],
						key: this.slugify(group['parameters'][p]['props'][i]),
						min: group['parameters'][p]['min'],
						max: group['parameters'][p]['max'],
						value: null
					};
					//console.log(index);
					//
					datas[this.slugify(group['parameters'][p]['props'][i])] = index;
				}
				//console.log(datas);
				parameter['data'] = datas;
				console.log(parameter);
				parameters[parameter.key] = parameter;
			}
			group['parameters'] = parameters;
			groups[group.key] = group;
		}

		protocol['groups'] = groups;
		delete protocol['groups'];

		fs.writeFileSync('./PROTOCOL_rebuild.json', JSON.stringify(protocol), { encoding: "utf8" });
		console.log(protocol['groups']);
	}

	encodeMacAddress(macAddress) {
		// Example usage
		//const macAddress = "DD:1A:2B:3C:4D:5E"; //or 001A2B3C4D5E
		//const byteDatagram = encodeMacAddress(macAddress);
		// Remove any colons from the MAC address
		const cleanMacAddress = macAddress.replace(/:/g, '');

		// Split the clean MAC address into pairs of two characters
		const macPairs = cleanMacAddress.match(/.{2}/g);

		// Convert each pair to a byte and store in an array
		const byteDatagram = macPairs.map(pair => parseInt(pair, 16));

		return byteDatagram;
	}

	decodeMacAddress(byteDatagram) {
		// Example usage
		//const byteDatagram = [0x00, 0x1A, 0x2B, 0x3C, 0x4D, 0x5E];
		//const decodedMacAddress = decodeMacAddress(byteDatagram);
		// Convert each byte to a hexadecimal string, pad with zeros, and join with colons
		const macAddress = byteDatagram.map(byte => byte.toString(16).padStart(2, '0')).join(':');

		return macAddress.toUpperCase(); // Convert to uppercase for consistency
	}


	objLenght(obj) {
		return Object.keys(obj).length;
	}
	slugify(str) {
		const delimiter = '_';
		str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
		str = str.toLowerCase(); // convert string to lowercase
		str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
			.replace(/\s+/g, delimiter) // replace spaces with hyphens
			.replace(/-+/g, delimiter); // remove consecutive hyphens
		return str;
	}
}