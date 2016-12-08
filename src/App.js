import React, { Component } from 'react';
import ReactGridLayout from 'react-grid-layout';
import logo from './logo.svg';
import './App.css';
import SettingsView from './SettingsView'
import DeviceListView from './DeviceListView'
import DeviceWidget from './widgets/DeviceWidget'
import LocalStorage from './util/LocalStorage'
import MqttClientSingleton from './util/MqttClientSingleton'
import JSONClientSingleton from './util/JSONClientSingleton'
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      settingsPanel: false,
      deviceListPanel: false,
      serverConfig: {
        mqttBrokerUrl: '', //ws://192.168.0.2:9001
        domoticzUrl: '' //http://192.168.0.6:8080
      },
      mqttConnected: false,
      whitelist: [],
      devices: {}
    };
    this.store = new LocalStorage();
    this.mqtt = new MqttClientSingleton();
    this.json = new JSONClientSingleton();
    this.mqtt.setEventHandler(this.mqttEventHandler);
  }

  mqttEventHandler = (eventType, opt_data = null) => {
    switch (eventType) {
      case 'connected':
        this.setState({mqttConnected: !!opt_data});
        if (opt_data === true) {
          for (let i = 0; i < this.state.whitelist.length; i++) {
            this.requestDeviceStatus(this.state.whitelist[i]);
          }
        }
        break;
      case 'error':
        // nothing to do here for now.
        break;
      case 'message':
        if (this.state.whitelist.indexOf('d|' + opt_data.idx) >= 0) {
          const devices = Object.assign({}, this.state.devices);
          devices['d|' + opt_data.idx] = opt_data;
          this.setState({devices: devices});
          console.debug('devices state updated', this.state.devices);
        }
        this.render();
        break;
      default:
        console.debug('unknow event type from MqttClientSingleton', eventType);
        break;
    }
  }

  componentWillMount() {
    const storedWhitelist = this.store.read('whitelist');
    const storedServerConfig = this.store.read('serverConfig');
    if (storedWhitelist) {
      this.setState({whitelist: storedWhitelist});
    }
    if (storedServerConfig) {
      this.setState({serverConfig: storedServerConfig});
    }
  }

  componentDidMount() {
    this.connectClients();
  }

  connectClients() {
    this.mqtt.connect(this.state.serverConfig.mqttBrokerUrl);
    this.json.setServerUrl(this.state.serverConfig.domoticzUrl);
  }

  handleServerConfigChange = (config) => {
    console.debug('config change', config);
    this.setState({serverConfig: config});
    this.store.write('serverConfig', config);
    this.connectClients();
  }

  handleDeviceListChange = (list) => {
    console.log('new list', list);
    const devices = Object.assign({}, this.state.devices);
    // Delete device info for devices that were removed from the whitelist.
    for (let i = 0; i < this.state.whitelist.length; i++) {
      const id = this.state.whitelist[i];
      if (list.indexOf(id) < 0) {
        delete devices[id];
      }
    }
    this.setState({whitelist: list, devices: devices});
    this.store.write('whitelist', list);
    for (let i = 0; i < list.length; i++) {
      if (!devices[list[i]]) {
        this.requestDeviceStatus(list[i]);
      }
    }
    this.render();
  }

  toggleSettings = () => {
    this.setState({ 'settingsPanel': !this.state.settingsPanel });
  }

  toggleDeviceList = () => {
    this.setState({ 'deviceListPanel': !this.state.deviceListPanel });
  }

  toMainView = () => {
    this.setState({
      'settingsPanel': false,
      'deviceListPanel': false
    });
  }

  requestDeviceStatus = (id) => {
    const explodedId = id.split('|');
    if (explodedId[0] !== 'd') {
      return;
    }
    const idx = parseInt(id.split('|')[1], 10);
    this.mqtt.publish({"command": "getdeviceinfo", "idx": idx });
  }

  render() {
    if (this.state.settingsPanel || !this.state.serverConfig.mqttBrokerUrl) {
      return (<SettingsView config={this.state.serverConfig} status={this.state.mqttConnected} onExit={this.toMainView} onChange={this.handleServerConfigChange}></SettingsView>);
    }
    if (this.state.deviceListPanel) {
      return (<DeviceListView domoticzUrl={this.state.serverConfig.domoticzUrl} onExit={this.toMainView} onWhitelistChange={this.handleDeviceListChange} idxWhitelist={this.state.whitelist}></DeviceListView>);
    }
    const widgets = [];
    const layout = [];
    let y = 0;
    for (const deviceId in this.state.devices) {
      if ({}.hasOwnProperty.call(this.state.devices, deviceId)) {
        const device = this.state.devices[deviceId];
        layout.push({
          i: deviceId,
          x: ++y,
          y: 0,
          w: 1,
          h: 1
        });
        widgets.push(<div key={deviceId}><DeviceWidget device={device}></DeviceWidget></div>);
      }
    };
    console.log(layout);
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
           <button onClick={this.toggleSettings}>settings</button>
           <button onClick={this.toggleDeviceList}>select devices</button>
        </p>
        <ReactGridLayout className="layout" layout={layout} items={this.state.whitelist.length} cols={6} rowHeight={100} width={800}>
          {widgets}
        </ReactGridLayout>
      </div>
    );
  }
}

export default App;
