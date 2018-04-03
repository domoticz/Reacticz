import axios from 'axios';

let singletonInstance = null;

const GET_ALL_DEVICES = {type: 'devices', filter: 'all', order: 'Name'};
const GET_ALL_SCENES = {type: 'scenes'};

class JSONClientSingleton {

  /**
   * A basic JSON API client proxy. Works as a singleton.
   **/

  constructor() {
    if (singletonInstance) {
      return singletonInstance;
    }
    this.throttleTimeout_ = null;
    this.debounceErrors_ = false;
    this.isConnected = false;
    this.eventHandler = function(type, opt_data) {};
    singletonInstance = this;
    return singletonInstance;
  }

  setEventHandler(eventHandler) {
    this.eventHandler = eventHandler;
  }

  setServerUrl(url, opt_login, opt_password) {
    this.serverUrl = url;
    this.axiosConfig = {};
    if (opt_login && opt_password) {
      this.axiosConfig.auth = {
        username: opt_login,
        password: opt_password
      };
    }

    // Check if connection is ok with parameters
    axios.head(this.serverUrl+ '/json.htm', this.axiosConfig).then(response => {
      this.setConnected_(true);
    }).catch(error => {
      this.setConnected_(false);
    });
  }

  getAllDevices(callback) {
    this.get(GET_ALL_DEVICES, callback);
  }

  getAllScenesThrottled = (callback) => {
    if (this.throttleTimeout_) {
      return;
    }
    this.getAllScenes(callback);
    this.throttleTimeout_ = global.setTimeout(
      () => { this.throttleTimeout_ = null }, 500);
  }

  getAllScenes = (callback) => {
    this.get(GET_ALL_SCENES, callback);
  }

  objectToQuery(data) {
    const keyvals = [];
    for (const key in data) {
      if ({}.hasOwnProperty.call(data, key)) {
        keyvals.push(key + '=' + encodeURIComponent(data[key]));
      }
    }
    return keyvals.join('&');
  }

  get(queryData, opt_callback = function(data) {
    if (data.status !== 'OK') {
      console.log('JSON query failed', queryData);
    }
  }) {
    if (!this.serverUrl) {
      console.log('Server URL is not set, please check the settings');
      return;
    }
    axios.get(this.serverUrl+ '/json.htm?' + this.objectToQuery(queryData), this.axiosConfig).then(response => {
      opt_callback(response.data);
    }).catch(error => {
      if (!this.debounceErrors_) {
        alert('Unable to reach Domoticz server.\n\nPlease check your Domoticz server URL in the settings and make sure Domoticz is online.');
        window.setTimeout(() => (this.debounceErrors_ = false), 3000);
        this.debounceErrors_ = true;
      }
      console.log('Unable to reach Domoticz', error);
    });
  }

  setConnected_(isConnected) {
    this.isConnected = isConnected;
    this.eventHandler('connected', this.isConnected);
  }

}

export default JSONClientSingleton;
