require('console');
const fs = require('fs')
//
module.exports = class blackmagicProtocol {
	// Packet Format Index

	constructor() {
		this.protocol = JSON.parse(fs.readFileSync('./PROTOCOL.json', 'utf8'))
		console.log(this.protocol);
	}

	getProtocol() {
		return this.protocol;
	}

	static CCUFixedFromFloat(f) {
		// Implementation of CCUFixedFromFloat function
	}

	static CCUFloatFromFixed(f) {
		// Implementation of CCUFloatFromFixed function
	}

	static CCUFloatFromFixed_uint16_t(f) {
		// Implementation of CCUFloatFromFixed_uint16_t function
	}

	static CCUPercentFromFixed(f) {
		// Implementation of CCUPercentFromFixed function
	}

	static toFixed16(value) {
		// Implementation of toFixed16 function
	}

}