const mqtt = require('mqtt')
module.exports = class MqttClient {

    port = 1883;
    host = "localhost";
    clientId = "mqttNodeClient";
    onMessageCallback = undefined;
    client = null;

    setIdentity(clientId) {
        if (!clientId) {
            return
        }
        this.clientId = clientId;
    }
    getIdentity() {
        return this.clientId
    }

    setPort(port) {
        if (!port) {
            return
        }
        this.port = port;
    }

    getPort() {
        return this.port
    }

    setHost(host) {
        if (!host) {
            return
        }
        this.host = host;
    }

    getHost() {
        return this.host
    }

    setOnMessage(onMessageCallback) {
        if (!onMessageCallback) {
            console.log("onMessage NOT set", onMessageCallback);
            return
        }
        this.onMessageCallback = onMessageCallback;
    }

    getOnMessage() {
        return this.onMessageCallback
    }

    connect() {
        this.mqttClient = mqtt.connect("mqtt://" + this.getHost() + ":" + this.getPort(), { clientId: this.clientId })

        if (this.mqttClient) {
            this.mqttClient.on('connect', () => {
                console.info("[MQTT_client] connected");
                this.heartbeat();
            })
            this.mqttClient.on('reconnect', () => {
                console.info("[MQTT_client] reconnect");
            })
            this.mqttClient.on('error', (err) => {
                console.error("[MQTT_client] " + err);
            })
            this.mqttClient.on('message', (topic, message) => {
                return this.onMessage(topic, message);
            })
        }
    }

    onMessage(topic, message) {
        if (message === undefined) {
            console.log("onMessage undefined message", topic, message);
            return
        }
        if (typeof this.onMessageCallback === 'function') {
            //console.log("onMessageCallback");
            return this.onMessageCallback(topic, message);
        }
        console.log("onMessage without callback", topic, message.toString('utf-8'));
    }

    publish(topic, message, retain = false, qos = 0) {
        if (message === undefined) {
            return
        }
        this.mqttClient.publish(topic, message, { retain: retain, qos: qos });
    }
    subscribe(topic) {
        if (topic === undefined) {
            return
        }
        this.mqttClient.subscribe(topic)
    }

    heartbeat() {
        this.mqttClient.publish('system/heartbeat', this.clientId, { qos: 0 });
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            this.mqttClient.publish('system/heartbeat', this.clientId, { qos: 0 });
        }, 15000);
    }
}