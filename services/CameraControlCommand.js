//https://docs.allthingstalk.com/developers/javascript-conversion/
const assert = require('assert');
require('console');
const fs = require('fs')
//
module.exports = class CameraControlCommand {
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
		};
		this.DATA_TYPES = {
			void: -1,
			boolean: 0,
			int8: 1,
			int16: 2,
			int32: 3,
			int64: 4,
			string: 5,
			fixed16: 128,
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
			category: 4,
			parameter: 5,
			dataType: 6,
			operationType: 7,
			payloadStart: 8

		}

	}

	getKeyByValue(object, value) {
		//assert(object !== undefined, 'getKeyByValue object must be specified');
		//assert(value !== undefined, 'getKeyByValue value must be specified');

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

		if (dataBlock.hasOwnProperty('index') && dataBlock.index !== undefined) {
			for (const k in dataBlock.index) {
				if (dataBlock.data_type === 'string') {
					// For strings, add the length of the string and the null terminator
					length += Buffer.from(dataBlock.index[k].value, 'utf-8').length + 1;
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
		assert(dataObject.destination !== undefined, 'destination must be specified');
		//assert(dataObject.source !== undefined, 'source must be specified');
		//assert(dataObject.command !== undefined, 'command must be specified');

		assert(dataObject.data !== undefined, 'data must be specified');
		//
		assert(dataObject.data.category_id !== undefined, 'data.category_id must be specified');
		assert(dataObject.data.parameter_id !== undefined, 'data.parameter_id must be specified');
		//assert(dataObject.data.data_type !== undefined, 'data.data_type must be specified');
		//assert(dataObject.data.operation_type !== undefined, 'data.operation_type must be specified');


		const destination = dataObject.destination;
		const operationType = dataObject.operation ? dataObject.operation : 'assignValue';
		const datablockLength = this.calculateDatablockLength(dataObject.data);
		//console.log("len", this.calculatePadding(datablockLength));
		const buffer = Buffer.alloc(8 + this.calculatePadding(datablockLength)); // 8 bytes for the header

		const offset = 0;
		// Write header
		buffer.writeUInt8(destination, offset + this.STRUCT.destination);
		buffer.writeUInt8(4 + datablockLength, offset + this.STRUCT.commandLength);
		buffer.writeUInt8(dataObject.id, offset + this.STRUCT.command);
		buffer.writeUInt8(0, offset + this.STRUCT.source); // Unused byte
		//
		buffer.writeUInt8(dataObject.data.category_id, offset + this.STRUCT.category);
		buffer.writeUInt8(dataObject.data.id, offset + this.STRUCT.parameter);
		buffer.writeUInt8(this.DATA_TYPES[dataObject.data.data_type], offset + this.STRUCT.dataType);
		buffer.writeUInt8(this.OPERATION_TYPES[operationType], offset + this.STRUCT.operationType);

		// Write datablock
		var i = 0;
		for (const k in dataObject.data.index) {
			if (dataObject.data.index[k].hasOwnProperty('value') && dataObject.data.index[k].value !== undefined) {
				this.writeDatablock(buffer, dataObject.data.data_type, dataObject.data.index[k].value, offset + this.STRUCT.payloadStart + i);
				i++;
			}

		}

		return buffer;
	}

	// Function to write the datablock to the buffer
	writeDatablock(buffer, type, value, offset) {

		// Write the value based on the type
		switch (type) {
			case 'void':
				//void do not have value
				break;
			case 'boolean':
				buffer.writeUInt8(value ? 1 : 0, offset);
				break;
			case 'int8':
				buffer.writeInt8(value, offset);
				break;
			case 'int16':
				buffer.writeInt16LE(value, offset);
				break;
			case 'int32':
				buffer.writeInt32LE(value, offset);
				break;
			case 'int64':
				buffer.writeBigInt64LE(BigInt(value), offset);
				break;
			case 'string':
				// Write the string at the current offset
				buffer.write(value, offset, 'utf-8');
				// Add null terminator
				buffer.writeUInt8(0, offset + Buffer.from(value, 'utf-8').length);
				break;
			case 'fixed16':
				const fixed16Value = Math.round(value * (1 << 11)); // Convert to fixed16
				buffer.writeInt16LE(fixed16Value, offset);
				break;
			default:
				throw new Error(`Invalid type: ${type}`);
		}

		// Add padding if necessary
		//const padding = this.calculatePadding(buffer.length - offset);
		//buffer.fill(0, offset + this.TYPES_LENGHTS[type], offset + this.TYPES_LENGHTS[type] + padding);
	}

	// Function to reverse convert datagram to dataObject
	convertToDataobject(datagram) {

		assert(datagram !== undefined, 'datagram must be specified');

		if (Array.isArray(datagram)) {
			datagram = this.arrayToBuffer(datagram);
		}

		const offset = 0;

		const destination = datagram.readUInt8(offset + this.STRUCT.destination);
		const commandLength = datagram.readUInt8(offset + this.STRUCT.commandLength);
		const command = datagram.readUInt8(offset + this.STRUCT.command);
		const source = datagram.readUInt8(offset + this.STRUCT.source);

		const datablock = datagram.slice(offset + this.STRUCT.payloadStart, 8 + commandLength); //befor because we need lenght

		const category = datagram.readUInt8(offset + this.STRUCT.category);
		const parameter = datagram.readUInt8(offset + this.STRUCT.parameter);
		const dataType = this.getKeyByValue(this.DATA_TYPES, (datagram.readUInt8(offset + this.STRUCT.dataType) == 0 && datablock.length == 0) ? -1 : 0);
		const operationType = this.getKeyByValue(this.OPERATION_TYPES, datagram.readUInt8(offset + this.STRUCT.operationType));


		if (datablock.length) {
			//todo
		}

		var dataObject = {
			class: 'ccu',

			destination: destination,
			commandLength: commandLength,
			command: command,
			source: source,

			data: {
				category_id: category,
				parameter_id: parameter,
				data_type: dataType,
				operation_type: operationType,
				//value: value
			}
		};

		//we need to determine packet type by category_id and parameter_id and found protocol stcuture to merge
		//this is first time when protocol is needed to decode message
		var protocol_object = this.findObjectInProtocol(category, parameter);
		//

		dataObject.data = {
			...protocol_object,
			...dataObject.data
		}

		return dataObject;
	}

	findObjectInProtocol(category, parameter) {
		//
		//console.log(category, parameter);
		//
		for (const c in this.PROTOCOL.categories) {
			if (this.PROTOCOL.categories[c]['id'] != category) {
				continue;
			}
			//console.log("found");
			for (const p in this.PROTOCOL.categories[c]['parameters']) {
				if (this.PROTOCOL.categories[c]['parameters'][p]['id'] != parameter) {
					continue;
				}
				//console.log("found");
				return this.PROTOCOL.categories[c]['parameters'][p];
				break;
			}
			break;
		}
		//console.log("not found");
		return null;
	}

	// Function to read a value of a specific type from the buffer
	readValue(buffer, offset, type) {
		switch (type) {
			case 'void':
				//void do not have value
				return;
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

		var categories = {};
		for (var c = 0; c < this.PROTOCOL['categories'].length; c++) {
			//
			var category = this.PROTOCOL['categories'][c];
			//

			var parameters = {};
			for (var p = 0; p < category['parameters'].length; p++) {
				//
				var parameter = {
					group_id: category.id,
					group_name: category.name,
					group_key: category.key,
					id: category['parameters'][p].id,
					name: category['parameters'][p].name,
					key: category['parameters'][p].key,
					data_type: category['parameters'][p].data_type,
					interpretation: category['parameters'][p].interpretation ? category['parameters'][p].interpretation : ''
				}
				//
				var datas = {};
				if (category['parameters'][p]['index'].length == 0 && category['parameters'][p].data_type !== 'void') {
					category['parameters'][p]['index'] = ["Default"];
				}
				if (category['parameters'][p]['index'].length == 0 && category['parameters'][p].data_type == 'boolean') {
					category['parameters'][p]['index'] = ["Default"];
					category['parameters'][p]['minimum'] = 0;
					category['parameters'][p]['maximum'] = 1;
				}
				for (var i = 0; i < category['parameters'][p]['index'].length; i++) {
					//
					var index = {
						name: category['parameters'][p]['index'][i],
						key: this.slugify(category['parameters'][p]['index'][i]),
						min: category['parameters'][p]['minimum'],
						max: category['parameters'][p]['maximum'],
						value: null
					};
					//console.log(index);
					//
					datas[this.slugify(category['parameters'][p]['index'][i])] = index;
				}
				//console.log(datas);
				parameter['data'] = datas;
				console.log(parameter);
				parameters[parameter.key] = parameter;
			}
			category['parameters'] = parameters;
			categories[category.key] = category;
		}

		this.PROTOCOL['groups'] = categories;
		delete this.PROTOCOL['categories'];

		fs.writeFileSync('./PROTOCOL_v2.json', JSON.stringify(this.PROTOCOL), { encoding: "utf8" });
		console.log(this.PROTOCOL['groups']);
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