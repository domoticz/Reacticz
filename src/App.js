import React, { Component } from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

import AboutView from './AboutView'
import SettingsView from './SettingsView'
import DeviceListView from './DeviceListView'
import DeviceWidget from './widgets/DeviceWidget'
import LoadingWidget from './widgets/LoadingWidget'
import LocalStorage from './util/LocalStorage'
import MqttClientSingleton from './util/MqttClientSingleton'
import JSONClientSingleton from './util/JSONClientSingleton'
import LZString from 'lz-string'

import './App.css';
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'

const View = {
  DASHBOARD: 1,
  DEVICE_LIST: 2,
  SERVER_SETTINGS: 3,
  ABOUT: 4
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

  componentWillMount() {
    const storedServerConfig = this.store.read('serverConfig');
    this.setState({
      whitelist: this.store.read('whitelist') || [],
      layout: this.store.read('layout') || []
    });
    if (storedServerConfig) {
      this.setState({serverConfig: storedServerConfig});
    }
    this.readConfigParameter();
  }

  componentDidMount() {
    this.connectClients(this.state.serverConfig);
  }

  connectClients(config) {
    this.mqtt.connect(config.mqttBrokerUrl);
    this.json.setServerUrl(config.domoticzUrl);
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

  readConfigParameter() {
    const param = document.location.hash.slice(1);
    if (!param) {
      return;
    }
    if (confirm('Reacticz configuration parameters detected! Apply here?\n(existing configuration will be lost)')) {
      try {
        const config = JSON.parse(LZString.decompressFromEncodedURIComponent(param));
        config.s && this.handleServerConfigChange(config.s);
        config.w && this.handleDeviceListChange(config.w);
        config.l && this.setState({layout: config.l});
      } catch (e) {
        alert('Sorry, something went wrong. The configuration could not be read.');
      }
    }
    document.location.hash = '';
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

  requestDeviceStatus = (id) => {
    const explodedId = id.split('|');
    if (explodedId[0] !== 'd') {
      return;
    }
    const idx = parseInt(id.split('|')[1], 10);
    this.mqtt.publish({"command": "getdeviceinfo", "idx": idx });
  }

  toggleMenu = () => {
    this.setState({ 'menuOpen': !this.state.menuOpen });
  }

  toggleSettings = () => {
    this.setState({
      'currentView': View.SERVER_SETTINGS,
      'layoutLocked': true });
  }

  toggleDeviceList = () => {
    this.setState({
      'currentView': View.DEVICE_LIST,
      'layoutLocked': true });
  }

  toggleAbout = () => {
    this.setState({
      'currentView': View.ABOUT,
      'layoutLocked': true });
  }

  toggleLayoutEdit = () => {
    this.setState({ 'layoutLocked': !this.state.layoutLocked });
  }

  toMainView = () => {
    this.setState({ 'currentView': View.DASHBOARD });
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
        updatedLayout.push({x: 0, y: i, w: 2, h: 1, i: deviceId})
      }
    };
    this.setState({layout: updatedLayout});
    this.store.write('layout', updatedLayout);
  }

  onLayoutChange = (layout) => {
    this.setState({layout: layout});
    this.store.write('layout', layout);
  }

  renderCurrentView = (opt_forceView = null) => {
    const view = opt_forceView || this.state.currentView;
    switch (view) {
      case View.ABOUT:
        return (<AboutView appState={this.state} />);
      case View.SERVER_SETTINGS:
        return (<SettingsView config={this.state.serverConfig} status={this.state.mqttConnected} onChange={this.handleServerConfigChange}></SettingsView>);
      case View.DEVICE_LIST:
        return (<DeviceListView domoticzUrl={this.state.serverConfig.domoticzUrl} onWhitelistChange={this.handleDeviceListChange} idxWhitelist={this.state.whitelist}></DeviceListView>);
      default:
        if (this.state.whitelist.length === 0) {
          return (
            <div className="addDevices">
              <h2>Welcome to your Reacticz dashboard!</h2>
              <p>Your dashboard is currently empty. Open the menu at the top right (<i className="material-icons">settings</i>) and go to the devices list screen (<i className="material-icons">playlist_add_check</i>) to select the widgets you want to add.</p>
              <p>Then come back here (<i className="material-icons">home</i>) and unlock the layout (<i className="material-icons">lock</i>) to drag and resize the widgets however you like.</p>
              <p>That's it!</p>
              <aside>Note: this is a work in progress, only a limited number of device types are currently supported. Scenes and groups are not supported yet.</aside>
            </div>
          );
        }
        const widgets = this.state.layout.map(function(deviceLayout) {
          const deviceId = deviceLayout.i;
          const device = this.state.devices[deviceId];
          if (!device) {
            // Device not available
            return (<div key={deviceId} className="gridItem centered"><LoadingWidget/></div>);
          }
          return (
            <div key={deviceId} className={this.state.layoutLocked ? 'gridItem':'gridItem resizeable'}>
              <DeviceWidget
                  readOnly={!this.state.layoutLocked}
                  key={'item'+ deviceId}
                  device={device}>
              </DeviceWidget>
            </div>
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
    const shouldConfigure = !this.state.serverConfig.mqttBrokerUrl || !this.state.serverConfig.domoticzUrl;
    const view = this.renderCurrentView(shouldConfigure ? View.SERVER_SETTINGS : undefined);
    const currentView = this.state.currentView;
    return (
      <div className="App">
        <div key='menu' className={this.state.menuOpen ? 'appbar open' : 'appbar'} style={{display: shouldConfigure ? 'none' : ''}}>
           <button key='toggle' onClick={this.toggleMenu}><i className="material-icons settings">settings</i></button>
           {currentView !== View.DASHBOARD && <button onClick={this.toMainView}><i className="material-icons">home</i></button>}
           {currentView === View.DASHBOARD && <button onClick={this.toggleLayoutEdit}><i className="material-icons selected">{this.state.layoutLocked ? 'lock' : 'lock_open'}</i></button>}
           <button onClick={this.toggleDeviceList}><i className={'material-icons' + (currentView === View.DEVICE_LIST ? ' selected' : '')}>playlist_add_check</i></button>
           <button onClick={this.toggleSettings}><i className={'material-icons' + (currentView === View.SERVER_SETTINGS ? ' selected' : '')}>router</i></button>
           <button onClick={this.toggleAbout}><i className={'material-icons' + (currentView === View.ABOUT ? ' selected' : '')}>info_outline</i></button>
        </div>
        {view}
      </div>
    );
  }
}

export default App;
