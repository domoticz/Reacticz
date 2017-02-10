import mqtt from 'mqtt';

let singletonInstance = null;

const TOPIC_IN = 'domoticz/in';
const TOPIC_OUT = 'domoticz/out';

class MqttClientSingleton {

  /**
   * A basic mqtt client proxy. Works as a singleton. Constructed with a handler
   * function that will be called with 2 params: event type (one of 'status',
   * 'message', 'error'), and an optional data parameter (respectively, a
   * boolean - true means connected, a data object, or an error message).
   **/

  constructor() {
    if (singletonInstance) {
      return singletonInstance;
    }
    this.client = null;
    this.isConnected = false;
    this.eventHandler = function(type, opt_data) {};
    singletonInstance = this;
    return singletonInstance;
  }

  setEventHandler(eventHandler) {
    this.eventHandler = eventHandler;
  }

  connect(brokerUrl, opt_login, opt_password) {
    if (this.client) {
      this.close();
    }
    if (!brokerUrl) {
      return;
    }
    try {
      this.mqttConfig = {};
      if (opt_login  && opt_password) {
        this.mqttConfig = {
          username: opt_login,
          password: opt_password
        };
      }
      this.client = mqtt.connect(brokerUrl, this.mqttConfig);
    } catch(e) {
      alert('Connexion to MQTT broker failed.\n\nPlease make sure the URL is correct and that it accepts WebSocket protocol.');
      console.debug('connexion failed', e);
      return;
    }
    // Register the listeners.
    this.client.on('connect', () => {
      console.log('connected to mqtt broker');
      this.client.subscribe(TOPIC_OUT);
      this.setConnected_(true);
    });
    this.client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      this.eventHandler('message', data);
    });
    this.client.on('error', (error) => {
      console.debug('mqtt client error:', error);
      this.eventHandler('error', error);
    });
    this.client.on('close', () => {
      this.setConnected_(false);
    });
  }

  close() {
    this.client.end(true /* force */);
    this.client = null;
    this.setConnected_(false);
  }

  publish(data) {
    if (!this.isConnected) {
      console.debug('Cannot publish message, client is not connected', data);
      return;
    }
    this.client.publish(TOPIC_IN, JSON.stringify(data), {qos: 2});
  }

  setConnected_(isConnected) {
    this.isConnected = isConnected;
    this.eventHandler('connected', this.isConnected);
  }
}

export default MqttClientSingleton;
