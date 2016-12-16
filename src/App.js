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

const View = {
  DASHBOARD: 1,
  DEVICE_LIST: 2,
  SERVER_SETTINGS: 3
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      currentView: View.DASHBOARD,
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

  toggleMenu = () => {
    this.setState({ 'menuOpen': !this.state.menuOpen });
  }

  toggleSettings = () => {
    this.setState({ 'currentView': View.SERVER_SETTINGS });
  }

  toggleDeviceList = () => {
    this.setState({ 'currentView': View.DEVICE_LIST });
  }

  toggleLayoutEdit = () => {
    this.setState({ 'layoutLocked': !this.state.layoutLocked });
  }

  toMainView = () => {
    this.setState({'currentView': View.DASHBOARD });
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
    // Clear layout items for devices that are no longer present.
    const ids = [];
    const updatedLayout = this.state.layout.filter(function(deviceLayout) {
      ids.push(deviceLayout.i);
      return list.indexOf(deviceLayout.i) >= 0;
    }, this);
    // Add missing layouts
    for (let i = 0; i < list.length; i++) {
      const deviceId = list[i];
      if (ids.indexOf(deviceId) < 0) {
        updatedLayout.push({x: 0, y: i, w: 1, h: 1, i: deviceId})
      }
    };
    this.setState({layout: updatedLayout});
    this.store.write('layout', updatedLayout);
  }

  onLayoutChange = (layout) => {
    this.setState({layout: layout});
    this.store.write('layout', layout);
  }

  renderCurrentView = () => {
    switch (this.state.currentView) {
      case View.SERVER_SETTINGS:
        return (<SettingsView config={this.state.serverConfig} status={this.state.mqttConnected} onExit={this.toMainView} onChange={this.handleServerConfigChange}></SettingsView>);
      case View.DEVICE_LIST:
        return (<DeviceListView domoticzUrl={this.state.serverConfig.domoticzUrl} onExit={this.toMainView} onWhitelistChange={this.handleDeviceListChange} idxWhitelist={this.state.whitelist}></DeviceListView>);
      default:
        const widgets = this.state.layout.map(function(deviceLayout) {
          const deviceId = deviceLayout.i;
          const device = this.state.devices[deviceId];
          if (!device) {
            // Device not available
            return (<div key={deviceId} className="gridItem centered">Loading</div>);
          }
          return (
            <div key={deviceId} className={this.state.layoutLocked ? 'gridItem':'gridItem resizeable'}><DeviceWidget key={'item'+ deviceId} device={device}></DeviceWidget></div>
          );
        }, this);
        return (
            <ResponsiveGridLayout
                layouts={{lg:this.state.layout}}
                onDragStop={this.onLayoutChange}
                onResizeStop={this.onLayoutChange}
                isDraggable={!this.state.layoutLocked}
                isResizable={!this.state.layoutLocked}
                breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                cols={{lg: 12, md: 10, sm: 8, xs: 6, xxs: 4}}
                className="layout"
                items={this.state.whitelist.length}
                rowHeight={100}>
              {widgets}
            </ResponsiveGridLayout>);
    }
  }

  render() {
    if (!this.state.serverConfig.mqttBrokerUrl) {
      this.setState({currentView: View.SERVER_SETTINGS});
    }
    const view = this.renderCurrentView();
    return (
      <div className="App">
        <div key='menu' className={this.state.menuOpen ? 'appbar open' : 'appbar'}>
           <button key='toggle' onClick={this.toggleMenu}><i className="material-icons settings">settings</i></button>
           <button onClick={this.toggleLayoutEdit}><i className="material-icons">{this.state.layoutLocked ? 'lock' : 'lock_open'}</i></button>
           <button onClick={this.toggleDeviceList}><i className="material-icons">playlist_add_check</i></button>
           <button onClick={this.toggleSettings}><i className="material-icons">router</i></button>
        </div>
        {view}
      </div>
    );
  }
}

export default App;
