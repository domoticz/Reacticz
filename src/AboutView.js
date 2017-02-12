import React, { Component } from 'react';
import LZString from 'lz-string'
import ThemeSelector from './ThemeSelector'
import icon from '../public/icon/icon_64.png';
import appInfo from '../package.json';

import './AboutView.css';

class AboutView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exportWhitelist: false,
      exportLayout: false,
      exportUrl: ''
    }
  }

  handleWhitelistCheckChange = (event) => {
    this.setState({
      exportWhitelist: event.target.checked,
      exportLayout: event.target.checked ? this.state.exportLayout : false
    });
  }

  handleLayoutCheckChange = (event) => {
    this.setState({exportLayout: event.target.checked});
  }

  handleUrlInputFocus = (event) => {
    event.target.setSelectionRange(0, event.target.value.length);
  }

  generateExportUrl = () => {
    const params = {
      s: this.props.appState && this.props.appState.serverConfig,
      t: this.props.appState && this.props.appState.themeId
    };
    if (this.state.exportWhitelist) {
      params.w = this.props.appState.whitelist;
    }
    if (this.state.exportLayout) {
      const lightLayout = this.props.appState.layout.concat([]);
      for (let i = 0; i < lightLayout.length; i++) {
        delete lightLayout[i].moved;
        delete lightLayout[i].static;
      }
      params.l = lightLayout;
    }
    const configParam = this.props.configId !== '' ?
        '?' + this.props.configId : '';
    const url = document.location.href.split('?')[0].replace('#','') +
        configParam + '#' +
        LZString.compressToEncodedURIComponent(JSON.stringify(params));
    return url;
  }

  render() {
    const url = this.generateExportUrl();
    return (
      <div className="AboutView">
        <h1>Reacticz</h1>
        <img src={icon} alt="Reacticz logo"/>
        <p>v{appInfo.version}</p>
        <p>A minimalistic Domoticz dashboard</p>
        <p>Color theme: <ThemeSelector themes={this.props.themes} currentTheme={this.props.appState && this.props.appState.themeId} onThemeChange={this.props.onThemeChange} /></p>
        <p>This is a work in progress! Documentation is available on the project's <a href="https://github.com/t0mg/reacticz" target="_blank">GitHub repository</a>.</p>
        <p><a href=".">Reload</a></p>
        <section>
          <h2>Export settings</h2>
          <p>To clone your settings to another device, share the URL below.</p>
          <div className="exportOptions">
            <label>
              <input type="checkbox" checked={this.state.exportWhitelist} onChange={this.handleWhitelistCheckChange} /> Include device selection
            </label>
            <label>
              <input type="checkbox" disabled={!this.state.exportWhitelist} checked={this.state.exportLayout} onChange={this.handleLayoutCheckChange} /> Include dashboard layout
            </label>
          </div>
          <textarea className="url" type="text" value={url} onFocus={this.handleUrlInputFocus} readOnly />
        </section>
      </div>
    );
  }

}

export default AboutView
