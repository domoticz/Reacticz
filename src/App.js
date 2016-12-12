import React, { Component } from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

import SettingsView from './SettingsView'
import DeviceListView from './DeviceListView'
import DeviceWidget from './widgets/DeviceWidget'
import LocalStorage from './util/LocalStorage'
import MqttClientSingleton from './util/MqttClientSingleton'
import JSONClientSingleton from './util/JSONClientSingleton'

import './App.css';
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      settingsPanel: false,
      deviceListPanel: false,
      layoutLocked: true,
      serverConfig: {
        mqttBrokerUrl: '', //ws://192.168.0.2:9001
        domoticzUrl: '' //http://192.168.0.6:8080
      },
      mqttConnected: false,
      whitelist: [],
      devices: {},
      layout: []
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
        }
        this.render();
        break;
      default:
        console.debug('unknow event type from MqttClientSingleton', eventType);
        break;
    }
  }

  componentWillMount() {
    const storedServerConfig = this.store.read('serverConfig');
    this.setState({
      whitelist: this.store.read('whitelist') || [],
      layout: this.store.read('layout') || []
    });
    if (storedServerConfig) {
      this.setState({serverConfig: storedServerConfig});
    }
  }

  componentDidMount() {
    this.connectClients(this.state.serverConfig);
  }

  connectClients(config) {
    this.mqtt.connect(config.mqttBrokerUrl);
    this.json.setServerUrl(config.domoticzUrl);
  }

  handleServerConfigChange = (config) => {
    this.setState({serverConfig: config});
    this.store.write('serverConfig', config);
    this.connectClients(config);
  }

  handleDeviceListChange = (list) => {
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
    this.cleanupLayout(list);
    for (let i = 0; i < list.length; i++) {
      if (!devices[list[i]]) {
        this.requestDeviceStatus(list[i]);
      }
    }
  }

  toggleSettings = () => {
    this.setState({ 'settingsPanel': !this.state.settingsPanel });
  }

  toggleDeviceList = () => {
    this.setState({ 'deviceListPanel': !this.state.deviceListPanel });
  }

  toggleLayoutEdit = () => {
    this.setState({ 'layoutLocked': !this.state.layoutLocked });
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

  cleanupLayout(list) {
    console.log('cleaning up layout', this.state.layout);
    // Clear layout items for devices that are no longer present.
    const ids = [];
    const updatedLayout = this.state.layout.filter(function(deviceLayout) {
      ids.push(deviceLayout.i);
      return list.indexOf(deviceLayout.i) >= 0;
    }, this);
    console.log('ids', ids);
    console.log('cleared ' + (this.state.layout.length - updatedLayout.length) + ' layouts');
    // Add missing layouts
    for (let i = 0; i < list.length; i++) {
      const deviceId = list[i];
      if (ids.indexOf(deviceId) < 0) {
        console.log('adding layout for device ' + deviceId);
        updatedLayout.push({x: 0, y: i, w: 2, h: 1, i: deviceId})
      }
    };
    console.log('final layout ', updatedLayout);
    this.setState({layout: updatedLayout});
    this.store.write('layout', updatedLayout);
  }

  onLayoutChange = (layout) => {
    console.log('layout change', layout);
    this.setState({layout: layout});
    this.store.write('layout', layout);
  }

  render() {
    if (this.state.settingsPanel || !this.state.serverConfig.mqttBrokerUrl) {
      return (<SettingsView config={this.state.serverConfig} status={this.state.mqttConnected} onExit={this.toMainView} onChange={this.handleServerConfigChange}></SettingsView>);
    }
    if (this.state.deviceListPanel) {
      return (<DeviceListView domoticzUrl={this.state.serverConfig.domoticzUrl} onExit={this.toMainView} onWhitelistChange={this.handleDeviceListChange} idxWhitelist={this.state.whitelist}></DeviceListView>);
    }

    // Main view (dashboard).
    const widgets = this.state.layout.map(function(deviceLayout) {
      const deviceId = deviceLayout.i;
      const device = this.state.devices[deviceId];
      if (!device) {
        // Device not available
        return (<div key={deviceId}>Loading</div>);
      }
      return (
        <div key={deviceId}><DeviceWidget device={device}></DeviceWidget></div>
      );
    }, this);
    return (
      <div className="App">
        <div>
           <button onClick={this.toggleSettings}>settings</button>
           <button onClick={this.toggleDeviceList}>select devices</button>
           <button onClick={this.toggleLayoutEdit}>{this.state.layoutLocked ? 'Locked':'Unlocked'}</button>
        </div>
        <ResponsiveGridLayout
            layouts={{lg:this.state.layout}}
            onDragStop={this.onLayoutChange}
            onResizeStop={this.onLayoutChange}
            isDraggable={!this.state.layoutLocked}
            isResizable={!this.state.layoutLocked}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
            cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
            className="layout"
            items={this.state.whitelist.length}
            rowHeight={100}>
          {widgets}
        </ResponsiveGridLayout>
      </div>
    );
  }
}

export default App;
