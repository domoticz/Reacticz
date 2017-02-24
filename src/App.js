import React, { Component } from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

import AboutView from './AboutView';
import ConfigStorageHelper from './util/ConfigStorageHelper';
import DeviceListView from './DeviceListView';
import DeviceWidget from './widgets/DeviceWidget';
import JSONClientSingleton from './util/JSONClientSingleton';
import LZString from 'lz-string';
import LoadingWidget from './widgets/LoadingWidget';
import LocalStorage from './util/LocalStorage';
import MqttClientSingleton from './util/MqttClientSingleton';
import SceneWidget from './widgets/SceneWidget';
import SettingsView from './SettingsView';
import Themes from './Themes';

import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';


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
      serverStatus: {
        mqtt: false,
        domoticz: false,
      },
      lastMqttMessage: null,
      configId: 0,
      configName: '',
      multiConfig: false,
      devices: {},
      deviceSpecs: {},
      layout: [],
      whitelist: [],
      themeId: 'Default',
      theme: {}
    };
    this.json = new JSONClientSingleton();
    this.json.setEventHandler(this.domoticzEventHandler);
    this.mqtt = new MqttClientSingleton();
    this.mqtt.setEventHandler(this.mqttEventHandler);
    this.store = new LocalStorage();
    this.configHelper = new ConfigStorageHelper();
  }

  componentWillMount() {
    const storedServerConfig = this.store.read('serverConfig');
    const themeId = this.store.read('themeId') || this.state.themeId;
    const configId = this.readConfigIdFromUrlParam();
    const configs = this.configHelper.getConfigs();
    const config = this.configHelper.getConfig(configId) || {};
    this.setState({
      whitelist: config.whitelist || [],
      layout: config.layout || [],
      configId: configId,
      configName: config.name || 'Dashboard',
      multiConfig: configs.length > 1,
      themeId: themeId,
      theme: Themes[themeId] || {}
    });
    if (storedServerConfig) {
      this.setState({serverConfig: storedServerConfig});
    }
    this.setState({ multiConfig: this.configHelper.getConfigs().length > 1});
    window.onpopstate = this.handlePopstate;
  }

  componentDidMount() {
    this.connectClients(this.state.serverConfig);
    this.readSharedConfigFromUrl();
    if (this.hasWhitelistedScenes()) {
      this.requestScenesStatus();
    }
  }

  handlePopstate = (event) => {
    if (event.state && event.state.id !== undefined) {
      this.loadConfig(event.state.id, true /* opt_noHistoryPush */ );
    }
  }

  connectClients(config) {
    this.mqtt.connect(config.mqttBrokerUrl, config.mqttLogin, config.mqttPassword);
    this.json.setServerUrl(config.domoticzUrl, config.domoticzLogin, config.domoticzPassword);
  }

  mqttEventHandler = (eventType, opt_data = null) => {
    switch (eventType) {
      case 'connected':
        this.setState({serverStatus:
            Object.assign(this.state.serverStatus, {mqtt: !!opt_data})});
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
        this.setState({serverStatus:
            Object.assign(this.state.serverStatus, {domoticz: !!opt_data})});
        break;
      default:
        console.log('unknown event type from JSONClientSingleton', eventType);
        break;
    }
  }

  readConfigIdFromUrlParam() {
    const param = Number(document.location.search.slice(1));
    if (param >= 0 && Math.round(param) === param) {
      if (this.configHelper.getConfig(param)) {
        return param;
      }
      return 0;
    }
    return 0;
  }

  getPrevConfig = () => {
    this.getNewConfig(true /* opt_prev */);
  }

  getNextConfig = () => {
    this.getNewConfig();
  }

  getNewConfig = (opt_prev = false) => {
    const newId = this.configHelper.getNextId(this.state.configId, opt_prev);
    this.loadConfig(newId);
  }

  loadConfig(id, opt_noHistoryPush = false) {
    const config = this.configHelper.getConfig(id);
    if (!config) {
      console.log('Unable to load config with id ' + id);
      return;
    }
    this.setState({
      configId: id,
      configName: config.name,
      layout: config.layout,
      whitelist: config.whitelist
    });
    !opt_noHistoryPush && history.pushState({id: id}, '', '?' + id);
    this.setState({
      multiConfig: this.configHelper.getConfigs().length > 1,
      layoutLocked: true
    });
    for (let i = 0; i < config.whitelist.length; i++) {
      this.requestDeviceStatus(config.whitelist[i]);
    }
  }

  deleteCurrentConfig = () => {
    if (!confirm('Delete this dashboard ?')) {
      return;
    }
    this.configHelper.deleteConfig(this.state.configId);
    const nextConfigId =
        this.configHelper.getConfigs().length >= this.state.configId + 1 ?
        this.state.configId : 0;
    this.loadConfig(nextConfigId);
  }

  readSharedConfigFromUrl = (opt_param) => {
    const param = opt_param || document.location.hash.slice(1);
    if (!param) {
      return;
    }
    if (confirm('Reacticz configuration parameters detected! Apply here?\n' +
      '\nNote: if a dashboard configuration is found in the parameters and ' +
      'your already have one setup here, a new separate dashboard will be ' +
      'created.')) {
      try {
        const config =
            JSON.parse(LZString.decompressFromEncodedURIComponent(param));
        config.s && this.handleServerConfigChange(config.s);
        config.t && this.handleThemeChange(config.t);
        if (config.w) {
          // Importing dashboard config.
          if (this.state.whitelist.length > 0) {
            console.log('adding config');
            // Don't override the current dahboard.
            this.loadConfig(this.configHelper.addConfig({
              name: config.n || 'Imported dashboard',
              layout: config.l || [],
              whitelist: config.w || []
            }));
            return;
          }
          this.handleConfigNameChange(config.n || 'Imported dashboard');
          this.handleDeviceListChange(config.w || []);
          this.storeConfigChange({layout: config.l || []});
          this.setState({layout: config.l || []});
        }
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
      this.readSharedConfigFromUrl(url.split('#')[1]);
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

  handleConfigNameChange = (configName) => {
    this.setState({configName: configName});
    this.storeConfigChange({name: configName});
  }

  storeConfigChange = (partialConfigObject) => {
    this.configHelper.storeConfigChange(
        this.state.configId, partialConfigObject);
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
    this.storeConfigChange({whitelist: list})
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
    this.storeConfigChange({layout: updatedLayout});
  }

  onLayoutChange = (layout) => {
    this.setState({layout: layout});
    this.storeConfigChange({'layout': layout});
  }

  renderCurrentView = (opt_forceView = null) => {
    const view = opt_forceView || this.state.currentView;
    switch (view) {
      case View.ABOUT:
        return (<AboutView appState={this.state} themes={Themes}
            configName={this.state.configName}
            onThemeChange={this.handleThemeChange}
            multiConfig={this.state.multiConfig} />);
      case View.SERVER_SETTINGS:
        return (<SettingsView config={this.state.serverConfig}
            serverStatus={this.state.serverStatus}
            onChange={this.handleServerConfigChange}
            importConfigPrompt={this.importConfigPrompt} />);
      case View.DEVICE_LIST:
        return (<DeviceListView onWhitelistChange={this.handleDeviceListChange}
            idxWhitelist={this.state.whitelist} name={this.state.configName}
            onNameChange={this.handleConfigNameChange} />);
      default:
        if (this.state.whitelist.length === 0) {
          return (
            <div className="addDevices">
              {!this.state.multiConfig && <h2>Welcome to your Reacticz dashboard!</h2>}
              {this.state.multiConfig && <h2>This is a new blank dashboard!</h2>}
              {this.state.multiConfig && <p>Use the arrows (<svg className='icon'><use xlinkHref="#navigate-before" /></svg> and <svg className='icon'><use xlinkHref="#navigate-next" /></svg>) at the bottom to switch between your dashboards.</p>}
              <p>This dashboard is currently empty. Open the menu at the top right (<svg className='icon'><use xlinkHref="#settings" /></svg>) and go to the devices list screen (<svg className='icon'><use xlinkHref="#playlist-add-check" /></svg>) to select the widgets you want to add.</p>
              <p>Then come back here (<svg className='icon'><use xlinkHref="#home" /></svg>) and unlock the layout (<svg className='icon'><use xlinkHref="#lock" /></svg>) to drag and resize the widgets however you like.</p>
              <p>That's it!</p>
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

  renderFooter(showFooter) {
      const footerStyle = {
        background: this.state.theme.overlayBackground,
        color: this.state.theme.overlayText,
        fill: this.state.theme.menuIcon,
      };
      return (
          <div className={'footer' + (showFooter ? '' : ' hidden')} style={footerStyle}>
            <div className="left">
              {this.state.layoutLocked && this.state.multiConfig &&
                <button title="Previous Layout" onClick={this.getPrevConfig}>
                  <svg className="icon"><use xlinkHref="#navigate-before" /></svg>
                </button>
              }
              {!this.state.layoutLocked && this.state.multiConfig &&
                <button title="Delete" onClick={this.deleteCurrentConfig}>
                  <svg className="icon"><use xlinkHref="#delete" /></svg>
                </button>
              }
            </div>
            <div className="right">
              {this.state.layoutLocked && this.state.multiConfig &&
                <button title="Next Layout" onClick={this.getNextConfig}>
                  <svg className="icon"><use xlinkHref="#navigate-next" /></svg>
                </button>
              }
              {!this.state.layoutLocked &&
                <button title="Add a new dashboard" onClick={() => this.loadConfig(this.configHelper.addConfig())}>
                  <svg className="icon"><use xlinkHref="#add" /></svg>
                </button>
              }
            </div>
            <div className="title">{this.state.configName}</div>
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
    const appStyle = {
      background: this.state.theme.appBackground,
      color: this.state.theme.appText,
      fill: this.state.theme.appText
    };

    const appBarStyle = {
      background: this.state.menuOpen ? this.state.theme.overlayBackground : '',
      display: shouldConfigure ? 'none' : ''
    };
    if (document) {
      document.title = this.state.configName + ' | Reacticz';
      document.body.style.background = this.state.theme.appBackground;
    }
    const showFooter = (currentView === View.DASHBOARD || currentView === View.DEVICE_LIST) && (this.state.multiConfig || !this.state.layoutLocked);

    return (
      <div className="App" style={appStyle}>
        <div key='menu' className={this.state.menuOpen ? 'appbar open' : 'appbar'} style={appBarStyle}>
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
        {this.renderFooter(showFooter)}
      </div>
    );
  }
}

export default App;
