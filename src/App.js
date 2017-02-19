import React, { Component } from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

import AboutView from './AboutView'
import DeviceListView from './DeviceListView'
import DeviceWidget from './widgets/DeviceWidget'
import JSONClientSingleton from './util/JSONClientSingleton'
import LZString from 'lz-string'
import LoadingWidget from './widgets/LoadingWidget'
import LocalStorage from './util/LocalStorage'
import MqttClientSingleton from './util/MqttClientSingleton'
import SceneWidget from './widgets/SceneWidget'
import SettingsView from './SettingsView'
import Themes from './Themes'

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
        mqttBrokerUrl: '',
        mqttLogin: '',
        mqttPassword: '',
        domoticzUrl: '',
        domoticzLogin: '',
        domoticzPassword: ''
      },
      configIdPagination: {
        nbConfigId: 1,
        prevConfigId: '',
        nextConfigId: ''
      },
      mqttConnected: false,
      domoticzConnected: false,
      lastMqttMessage: null,
      whitelist: [],
      devices: {},
      deviceSpecs: {},
      layout: [],
      name: '',
      themeId: 'Default',
      theme: {}
    };
    this.configId = '';
    this.json = new JSONClientSingleton();
    this.json.setEventHandler(this.domoticzEventHandler);
    this.mqtt = new MqttClientSingleton();
    this.mqtt.setEventHandler(this.mqttEventHandler);
    this.store = new LocalStorage();
  }

  componentWillMount() {
    this.readConfigId();
    const storedServerConfig = this.store.read('serverConfig');
    const themeId = this.store.read('themeId') || this.state.themeId;
    this.setState({
      whitelist: this.store.read('whitelist' + this.configId) || [],
      layout: this.store.read('layout' + this.configId) || [],
      name: this.store.read('name' + this.configId) || 'Layout ' + this.configId,
      themeId: themeId,
      theme: Themes[themeId] || {}
    });
    if (storedServerConfig) {
      this.setState({serverConfig: storedServerConfig});
    }
    this.readConfigParameter();
    this.setConfigIdPagination();
  }

  componentDidMount() {
    this.connectClients(this.state.serverConfig);
    if (this.hasWhitelistedScenes()) {
      this.requestScenesStatus();
    }
  }

  connectClients(config) {
    this.mqtt.connect(config.mqttBrokerUrl, config.mqttLogin, config.mqttPassword);
    this.json.setServerUrl(config.domoticzUrl, config.domoticzLogin, config.domoticzPassword);
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
          // Update scene status (with a little debounce check).
          if (this.hasWhitelistedScenes()) {
            this.requestScenesStatus(true /* opt_throttle */);
          }
        }
        this.render();
        break;
      default:
        console.log('unknown event type from MqttClientSingleton', eventType);
        break;
    }
  }

  domoticzEventHandler = (eventType, opt_data = null) => {
    switch (eventType) {
      case 'connected':
        this.setState({domoticzConnected: !!opt_data});
        break;
      default:
        console.log('unknown event type from JSONClientSingleton', eventType);
        break;
    }
  }

  readConfigId() {
    const param = Number(document.location.search.slice(1));
    if (param > 1 && Math.round(param) === param) {
      this.configId = param;
      document.title = 'Reacticz (' + this.configId + ')';
    }
  }
  
  setConfigIdPagination() {
    const allLayouts = this.getLayoutsList();
    const nbLayouts = allLayouts.length;
    const currentLayout = allLayouts.indexOf("layout" + this.configId);
    const prevLayout = currentLayout > 0 ? currentLayout-1 : nbLayouts-1;
    const nextLayout = currentLayout < nbLayouts-1 ? currentLayout+1 : 0;
    const pagination = {
      nbConfigId : nbLayouts,
      prevConfigId : nbLayouts > 1 ? allLayouts[prevLayout].substring(6) : '',
      nextConfigId : nbLayouts > 1 ? allLayouts[nextLayout].substring(6) : ''
    };
    this.setState({configIdPagination: pagination});
  }

  readConfigParameter = (opt_param) => {
    const param = opt_param || document.location.hash.slice(1);
    if (!param) {
      return;
    }
    const configInfo = Number(this.configId) > 1 ? ' #' + this.configId : '';
    if (confirm('Reacticz configuration parameters detected! Apply here?\n'
          + '(existing configuration' + configInfo + ' will be lost)')) {
      try {
        const config = JSON.parse(LZString.decompressFromEncodedURIComponent(param));
        config.s && this.handleServerConfigChange(config.s);
        config.t && this.handleThemeChange(config.t);
        this.handleDeviceListChange(config.w || []);
        this.setState({layout: config.l || []});
      } catch (e) {
        console.log(e);
        alert('Sorry, something went wrong. The configuration could not be read.');
      }
    }
    document.location.hash = '';
  }

  importConfigPrompt = () => {
    const url = prompt('Please paste the full configuration URL to import.\n\n'
        + 'This URL can be found in the About page of a configured Reacticz '
        + 'dashboard.');
    if (url && url.split('#').length === 2) {
      this.readConfigParameter(url.split('#')[1]);
    }
  }

  handleServerConfigChange = (config) => {
    this.setState({serverConfig: config});
    this.store.write('serverConfig', config);
    this.connectClients(config);
  }

  handleThemeChange = (themeId) => {
    const theme = Themes[themeId];
    if (theme) {
      this.setState({themeId: themeId, theme: theme});
      this.store.write('themeId', themeId);
    }
  }
 
  handleNameChange = (name) => {
    this.setState({name: name});
    this.store.write('name' + this.configId, name);
  }

  handleConfigIdChange = (id) => {
    this.configId = id;
    const list = this.store.read('whitelist' + this.configId) || [];
    const layout = this.store.read('layout' + this.configId) || [];
    const name = this.store.read('name' + this.configId) ||  'Layout ' + this.configId;
    this.setState({
      whitelist: list,
      layout: layout,
      name: name
    });
    for (let i = 0; i < list.length; i++) {
      this.requestDeviceStatus(list[i]);
    }
    this.setConfigIdPagination();
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
    this.store.write('whitelist' + this.configId, list);
    this.cleanupLayout(list);
    for (let i = 0; i < list.length; i++) {
      if (!devices[list[i]]) {
        this.requestDeviceStatus(list[i]);
      }
    }
    if (this.hasWhitelistedScenes(list)) {
      this.requestScenesStatus();
    }
  }

  removeDevice = (id) => {
    if (confirm('Remove this widget ?')) {
      const whitelist = this.state.whitelist.slice(0);
      whitelist.splice(whitelist.indexOf(id), 1);
      this.handleDeviceListChange(whitelist);
    }
  }

  requestDeviceStatus = (id) => {
    const explodedId = id.split('|');
    if (explodedId[0] !== 'd') {
      // Not a device type.
      return;
    }
    const idx = parseInt(id.split('|')[1], 10);
    this.mqtt.publish({'command': 'getdeviceinfo', 'idx': idx });
  }

  hasWhitelistedScenes(opt_list) {
    const list = opt_list || this.state.whitelist;
    return list.some((id) => (id[0] === 's' || id[0] === 'g'));
  }

  requestDeviceSpec = (id) => {
    const explodedId = id.split('|');
    if (explodedId[0] !== 'd') {
      // Not a device type.
      return;
    }
    this.json.get({type: 'devices', rid: explodedId[1] }, (data) =>{
      const deviceSpecs = Object.assign({}, this.state.deviceSpecs);
      deviceSpecs[id] = data.result[0];
      this.setState({deviceSpecs: deviceSpecs});
    });
  }

  requestScenesStatus = (opt_throttle = false) => {
    const getScenes = opt_throttle ?
        this.json.getAllScenesThrottled : this.json.getAllScenes;
    getScenes((data) => {
      if (data.status !== "OK") {
        alert("Unable to get scenes status.");
        return;
      }
      const scenes = data.result;
      const devices = Object.assign({}, this.state.devices);
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const fullId = (scene.Type === 'Group' ? 'g' : 's') + '|' + scene.idx;
        if (this.state.whitelist.indexOf(fullId) >= 0) {
          devices[fullId] = scene;
        }
      }
      this.setState({devices: devices});
    });
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

  getLayoutsList = () => {
    const keys = this.store.getKeys();
    return keys.filter(function (propertyName) { return propertyName.indexOf("layout") === 0;});
  }

  cleanupLayout(list) {
    // Clear layout items for devices that are no longer present.
    const ids = [];
    let maxY = -1;
    const updatedLayout = this.state.layout.filter(function(deviceLayout) {
      ids.push(deviceLayout.i);
      maxY = Math.max(deviceLayout.y, maxY);
      return list.indexOf(deviceLayout.i) >= 0;
    }, this);
    // Add missing layouts
    for (let i = 0; i < list.length; i++) {
      const deviceId = list[i];
      if (ids.indexOf(deviceId) < 0) {
        updatedLayout.push({x: 0, y: ++maxY, w: 2, h: 1, i: deviceId})
      }
    };
    this.setState({layout: updatedLayout});
    this.store.write('layout' + this.configId, updatedLayout);
  }

  onLayoutChange = (layout) => {
    this.setState({layout: layout});
    this.store.write('layout' + this.configId, layout);
  }

  renderCurrentView = (opt_forceView = null) => {
    const view = opt_forceView || this.state.currentView;
    switch (view) {
      case View.ABOUT:
        return (<AboutView appState={this.state} themes={Themes} configId={this.configId} onThemeChange={this.handleThemeChange} />);
      case View.SERVER_SETTINGS:
        return (<SettingsView config={this.state.serverConfig} mqttStatus={this.state.mqttConnected} domoticzStatus={this.state.domoticzConnected} onChange={this.handleServerConfigChange} importConfigPrompt={this.importConfigPrompt}></SettingsView>);
      case View.DEVICE_LIST:
        return (<DeviceListView onWhitelistChange={this.handleDeviceListChange} idxWhitelist={this.state.whitelist} name={this.state.name} onNameChange={this.handleNameChange}></DeviceListView>);
      default:
        if (this.state.whitelist.length === 0) {
          return (
            <div className="addDevices">
              <h2>Welcome to your Reacticz dashboard!</h2>
              <p>Your dashboard is currently empty. Open the menu at the top right (<svg className='icon'><use xlinkHref="#settings" /></svg>) and go to the devices list screen (<svg className='icon'><use xlinkHref="#playlist-add-check" /></svg>) to select the widgets you want to add.</p>
              <p>Then come back here (<svg className='icon'><use xlinkHref="#home" /></svg>) and unlock the layout (<svg className='icon'><use xlinkHref="#lock" /></svg>) to drag and resize the widgets however you like.</p>
              <p>That's it!</p>
              <aside>Note: this is a work in progress, only a limited number of device types are currently supported.</aside>
            </div>
          );
        }
        const widgets = this.state.layout.map(function(deviceLayout) {
          const deviceId = deviceLayout.i;
          const device = this.state.devices[deviceId];
          if (!device) {
            // Device not available
            return (<div key={deviceId} className="gridItem">
                <LoadingWidget onRemove={() => this.removeDevice(deviceId)}
                    theme={this.state.theme}/></div>);
          }
          let widget = '';
          if (device.Type === 'Group' || device.Type === 'Scene') {
            widget = <SceneWidget
                readOnly={!this.state.layoutLocked}
                key={'item'+ deviceId}
                scene={device}
                onSceneChange={this.requestScenesStatus}
                theme={this.state.theme} />
          } else {
          widget = <DeviceWidget
              className="widget"
              layoutWidth={deviceLayout.w}
              readOnly={!this.state.layoutLocked}
              key={'item'+ deviceId}
              device={device}
              requestDeviceSpec={() => this.requestDeviceSpec(deviceId)}
              deviceSpec={this.state.deviceSpecs[deviceId]}
              theme={this.state.theme} />
          }
          return (
            <div key={deviceId} className={this.state.layoutLocked ? 'gridItem':'gridItem resizeable'}>
              {widget}
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
                verticalCompact={false}
                breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                cols={{lg: 12, md: 10, sm: 8, xs: 6, xxs: 4}}
                className="layout"
                items={this.state.whitelist.length}
                rowHeight={100}>
              {widgets}
            </ResponsiveGridLayout>);
    }
  }

  renderFooter() {
      const menuIconStyle = {
        fill: this.state.theme.menuIcon
      };
      return (
          <div className='footer'>
            <div className='left'>
              <button key='prev' title='Previous Layout' onClick={() => this.handleConfigIdChange(this.state.configIdPagination.prevConfigId)}>
              <svg className="icon" style={menuIconStyle}><use xlinkHref="#arrow-left-bold-box-outline" /></svg></button>
            </div>
            <div className='right'>
              <button key='next' title='Next Layout' onClick={() => this.handleConfigIdChange(this.state.configIdPagination.nextConfigId)}>
              <svg className="icon" style={menuIconStyle}><use xlinkHref="#arrow-right-bold-box-outline" /></svg></button>
            </div>
            <div className='title'>{this.state.name}</div>
          </div>);
  }

  render() {
    const shouldConfigure = !this.state.serverConfig.mqttBrokerUrl || !this.state.serverConfig.domoticzUrl;
    const view = this.renderCurrentView(shouldConfigure ? View.SERVER_SETTINGS : undefined);
    const currentView = this.state.currentView;
    const menuIconStyle = {
      fill: this.state.theme.menuIcon
    };
    const menuIconSelectedStyle = {
      fill: this.state.theme.menuIconSelected
    };
    const footer = this.state.configIdPagination.nbConfigId > 1 ? this.renderFooter() : '';

    return (
      <div className="App">
        <div key='menu' className={this.state.menuOpen ? 'appbar open' : 'appbar'} style={{display: shouldConfigure ? 'none' : ''}}>
          <button key='toggle' title='Menu' onClick={this.toggleMenu}>
            <svg className="icon" style={menuIconStyle}><use xlinkHref="#settings" /></svg>
          </button>
          {currentView !== View.DASHBOARD &&
               <button onClick={this.toMainView} title='Home'>
               <svg className='icon' style={menuIconStyle}><use xlinkHref="#home" /></svg></button>}
          {currentView === View.DASHBOARD &&
               <button onClick={this.toggleLayoutEdit} title='Layout lock'>
               <svg className='icon' style={(currentView === View.DASHBOARD ? menuIconSelectedStyle : menuIconStyle)}><use xlinkHref={this.state.layoutLocked ? '#lock' : '#lock-open'} /></svg></button>}
          <button onClick={this.toggleDeviceList} title='Device selection'>
            <svg className='icon' style={(currentView === View.DEVICE_LIST ? menuIconSelectedStyle : menuIconStyle)}><use xlinkHref='#playlist-add-check' /></svg>
          </button>
          <button onClick={this.toggleSettings} title='Server settings'>
            <svg className='icon' style={(currentView === View.SERVER_SETTINGS ? menuIconSelectedStyle : menuIconStyle)}><use xlinkHref='#router' /></svg>
          </button>
          <button onClick={this.toggleAbout} title='About'>
            <svg className='icon' style={(currentView === View.ABOUT ? menuIconSelectedStyle : menuIconStyle)}><use xlinkHref='#info-outline' /></svg>
          </button>
        </div>
        {view}
        {(currentView === View.DASHBOARD || currentView === View.DEVICE_LIST) && footer}
      </div>
    );
  }
}

export default App;
