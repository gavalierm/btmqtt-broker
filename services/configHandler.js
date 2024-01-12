const path = require("path")
const os = require('os')
const fs = require('fs')

module.exports = class ConfigHandler {
	defaultConfigFileName = 'config.json'
	configFilePath = undefined
	config = undefined

	getVersion() {
		const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
		return packageJson["version"]
	}

	getConfig() {
		if (!this.config) {
			this.config = this.readConfiguration()
		}
		return this.config;
	}
	readConfiguration() {
		// Find config file to use
		if (!this.configFilePath) {
			this.configFilePath = this.findConfigurationFile()
			if (!fs.existsSync(this.configFilePath)) {
				fs.cpSync(path.join(__dirname, this.defaultConfigFileName), this.configFilePath)
			}
		}
		return JSON.parse(fs.readFileSync(this.configFilePath, 'utf8'))
	}

	saveConfiguration(config) {
		this.config = config
		fs.writeFileSync(this.configFilePath, JSON.stringify(this.config), { encoding: "utf8" });
		return this.readConfiguration();
	}

	findConfigurationFile() {
		const tryPath = (pathToTry) => {
			let tryFilePath = path.join(pathToTry, this.defaultConfigFileName)
			// Check if file exists and is RW
			if (fs.existsSync(tryFilePath)) {
				try {
					fs.accessSync(tryFilePath, fs.constants.R_OK | fs.constants.W_OK)
					return tryFilePath
				} catch (e) {
					// Did not work, so try next
				}
			}
			// Check if directory exists and is RW (so file can be created)
			if (fs.existsSync(pathToTry)) {
				try {
					fs.accessSync(pathToTry, fs.constants.R_OK | fs.constants.W_OK)
					return pathToTry
				} catch (e) {
					// Did not work, so try next
				}
			}
			return false
		}
		let pathsToTry = [
			'./',
			// @TODO Add more somewhen in the future, if necessary
		]
		if (process.platform === 'linux') {
			pathsToTry.push(path.join(os.homedir(), ''))
		}
		if (process.platform === 'darwin') {
			pathsToTry.push(path.join(os.homedir(), 'Library/Preferences'))
		}
		if (process.platform === 'win32' || process.platform === 'win64') {
			pathsToTry.push(path.join(os.homedir(), 'AppData/Roaming'))
		}
		for (const pathToTry of pathsToTry) {
			const r = tryPath(pathToTry)
			if (r) {
				if (fs.lstatSync(r).isDirectory()) {
					return path.join(r, defaultConfigFileName)
				}
				return r
			}
		}
		throw Error('Could not find a writable configuration location.')
	}
}