import React, { Component } from 'react';
import LZString from 'lz-string';
import ThemeSelector from './ThemeSelector';
import appInfo from './ext/package.json';
import select from 'select';
import {TYPE as SCREENSAVER_TYPE} from './Screensaver';

import icon from './ext/icon_64.png';
import './AboutView.css';

const DEFAULT_SCREENSAVER_DELAY_SEC = 60;

class AboutView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copyResultTimeoutId: null,
      copyResult: null,
      exportDashboard: false,
      exportUrl: ''
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.copyResultTimeoutId);
  }

  handleDashboardCheckChange = (event) => {
    this.setState({
      exportDashboard: event.target.checked,
    });
  }

  handleZoomChange = (event) => {
    this.props.onZoomChange && this.props.onZoomChange(event.target.value);
  }

  handleToggleScreensaver = (event) => {
    const newConfig = Object.assign({}, this.props.screensaverConfig);
    newConfig.delay = event.target.checked ? DEFAULT_SCREENSAVER_DELAY_SEC : -1;
    this.props.onScreensaverConfigChange && this.props.onScreensaverConfigChange(newConfig);
  }

  handleChangeScreensaverDelay = (event) => {
    const newConfig = Object.assign({}, this.props.screensaverConfig);
    newConfig.delay = event.target.value;
    this.props.onScreensaverConfigChange && this.props.onScreensaverConfigChange(newConfig);
  }

  handleChangeScreensaverType = (event) => {
    const newConfig = Object.assign({}, this.props.screensaverConfig);
    newConfig.type = event.target.value;
    this.props.onScreensaverConfigChange && this.props.onScreensaverConfigChange(newConfig);
  }

  generateExportUrl = () => {
    const params = {
      s: this.props.appState && this.props.appState.serverConfig,
      t: this.props.appState && this.props.appState.themeId
    };
    if (this.state.exportDashboard) {
      params.w = this.props.appState.whitelist;
      const lightLayout = this.props.appState.layout.concat([]);
      for (let i = 0; i < lightLayout.length; i++) {
        delete lightLayout[i].moved;
        delete lightLayout[i].static;
      }
      params.l = lightLayout;
      params.n = this.props.configName;
    }
    const url = document.location.href.split('?')[0].replace('#','') + '#' +
        LZString.compressToEncodedURIComponent(JSON.stringify(params));
    return url;
  }

  handleFocus = (event) => {
    select(event.target);
  }

  copyUrl = () => {
    global.clearTimeout(this.state.copyResultTimeoutId);
    select(this.refs.url);
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    }
    catch (err) {
      console.log('Unable to copy', err);
    }
    this.refs.url.blur();
    this.setState({
      copyResult: succeeded ? 'Copied!' : 'Failed! Use Ctrl+C',
      copyResultTimeoutId:
          global.setTimeout(() => { this.setState({ copyResult: null }) }, 3000)
    });
  }

  render() {
    const url = this.generateExportUrl();
    const screensaverOn = this.props.screensaverConfig.delay >= 0;
    return (
      <div className="AboutView">
        <div className="aboutHeader">
          <img src={icon} alt="Reacticz logo"/>
          <div>
            <h1>Reacticz v{appInfo.version}</h1> - <a href="https://github.com/domoticz/Reacticz" target="_blank" rel="noopener noreferrer">GitHub</a>
            <aside>A minimalistic Domoticz dashboard</aside>
          </div>
        </div>
        <section>
          <h2>Interface settings</h2>
          <p>Color theme: <ThemeSelector themes={this.props.themes} currentTheme={this.props.appState && this.props.appState.themeId} onThemeChange={this.props.onThemeChange} /></p>
          <p>Font size: <span className="zoomlabel">Smaller</span><input className="zoomrange" type="range" min="0.7" max="1.3" value={this.props.zoom} step="0.1" onChange={this.handleZoomChange}/><span className="zoomlabel">Bigger</span></p>
          <p><label htmlFor="toggleScreensaver">Screensaver: </label><input id="toggleScreensaver" type="checkbox" onChange={this.handleToggleScreensaver}
                  checked={screensaverOn} /> 
              {screensaverOn && <span><input type="number" max="3600" min="1" step="1" value={this.props.screensaverConfig.delay} id="delayInput" onChange={this.handleChangeScreensaverDelay} /> <label htmlFor="delayInput">seconds</label>,&nbsp;
              <label htmlFor="screensaverType">type: </label><select id="screensaverType" onChange={this.handleChangeScreensaverType} value={this.props.screensaverConfig.type}>
                <option value={SCREENSAVER_TYPE.BLANK}>Blank</option>
                <option value={SCREENSAVER_TYPE.CLOCK}>Analog clock</option>
              </select></span>}
          </p>
          <p><a href=".">Reload</a></p>
        </section>
        <section>
          <h2>Export configuration</h2>
          <p>To clone your settings to another device, share the URL below.</p>
          <div className="exportOptions">
            <label>
              <input type="checkbox" checked={this.state.exportDashboard} onChange={this.handleDashboardCheckChange} /> include dashboard layout{this.props.multiConfig && ' (' + this.props.configName + ')'}
            </label>
          </div>
          <div className="exportUrl">
            <input type="text" className="url" ref='url' value={url} onFocus={this.handleFocus} readOnly />
            <button onClick={this.copyUrl}>{this.state.copyResult || 'Copy to Clipboard'}</button>
          </div>
          {this.props.multiConfig && this.state.exportDashboard && <em>Tip: repeat the operation with your other dashboards to add them too (they won't overwrite each other).</em>}
        </section>
      </div>
    );
  }

}

export default AboutView
