//https://docs.allthingstalk.com/developers/javascript-conversion/
const assert = require('assert');
require('console');
const fs = require('fs')
//
module.exports = class CameraControlCommand {
	constructor() {
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
			void: 0,
			boolean: 0,
			int8: 1,
			int16: 2,
			int32: 3,
			int64: 4,
			string: 5,
			fixed16: 128,
		};

		this.STRUCT = {
			destination: 0,
			commandLength: 1,
			commandId: 2,
			source: 3,
			category: 4,
			parameter: 5,
			dataType: 6,
			operationType: 7,
			payloadStart: 8

		}
	}

	getKeyByValue(object, value) {
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
		assert(dataObject.operation !== undefined, 'operation must be specified');
		assert(dataObject.data !== undefined, 'data must be specified');
		assert(dataObject.id !== undefined, 'id must be specified');


		const destination = dataObject.destination;
		const operation = dataObject.operation;
		const datablockLength = this.calculateDatablockLength(dataObject.data);
		//console.log("len", this.calculatePadding(datablockLength));
		const buffer = Buffer.alloc(8 + this.calculatePadding(datablockLength)); // 8 bytes for the header

		const offset = 0;
		// Write header
		buffer.writeUInt8(destination, offset + this.STRUCT.destination);
		buffer.writeUInt8(4 + datablockLength, offset + this.STRUCT.commandLength);
		buffer.writeUInt8(dataObject.id, offset + this.STRUCT.commandId);
		buffer.writeUInt8(0, offset + this.STRUCT.source); // Unused byte
		buffer.writeUInt8(dataObject.data.category_id, offset + this.STRUCT.category);
		buffer.writeUInt8(dataObject.data.id, offset + this.STRUCT.parameter);
		buffer.writeUInt8(this.DATA_TYPES[dataObject.data.data_type], offset + this.STRUCT.operationType);
		buffer.writeUInt8(operation, offset + this.STRUCT.payloadStart);

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
		if (Array.isArray(datagram)) {
			datagram = this.arrayToBuffer(datagram);
		}
		const destination = datagram.readUInt8(0);
		const datablockLength = datagram.readUInt8(1);
		const id = datagram.readUInt8(2);
		const categoryId = datagram.readUInt8(4);
		const dataId = datagram.readUInt8(5);
		const dataType = this.getKeyByValue(this.DATA_TYPES, datagram.readUInt8(6));
		const operation = datagram.readUInt8(7);
		const datablock = datagram.slice(8, 8 + datablockLength);
		// Update dataObject with parsed values from the datablock
		const value = this.readValue(datablock, 0, dataType);

		const dataObject = {
			class: 'ccu',
			id: id,
			destination: destination,
			operation: operation,
			data: {
				id: dataId,
				category_id: categoryId,
				data_type: dataType,
				value: value,
			}
		};

		return dataObject;
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
}