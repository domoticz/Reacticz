import React, { Component } from 'react';
import LZString from 'lz-string'
//import QRCanvas from 'qrcanvas-react';

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
      s: this.props.appState.serverConfig
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
      console.debug('lightLayout', lightLayout);

      params.l = lightLayout;
    }
    const url = document.location.href.split("#")[0] + '#' + LZString.compressToEncodedURIComponent(JSON.stringify(params));
    console.log(url.length);
    console.log(url);
    console.debug(JSON.parse(LZString.decompressFromEncodedURIComponent(url.split('#')[1])));
    return url;
  }

  // renderQrCode = (url) => {
  //   if (url.length > 13328) {
  //     return <p>Sorry, there is too much data to render as a QR code, use the link above or try checking fewer export options.</p>;
  //   }
  //   return <QRCanvas options={{data: url}} />
  // }

  render() {
    const url = this.generateExportUrl();
    return (
      <div className="AboutView">
        <button onClick={this.props.onExit}>Back</button>
        <h1>Reacticz</h1>
        <p>Minimalistic Domoticz dashboard</p>
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
          <input className="url" type="text" value={url} onFocus={this.handleUrlInputFocus} readOnly />
        </section>
      </div>
    );
  }

}

export default AboutView
