import React, { Component } from 'react';
import './SettingsView.css';
import icon from '../public/icon/icon_64.png';

class SettingsView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mqttBrokerUrl: props.config ? props.config.mqttBrokerUrl : '',
      domoticzUrl: props.config ? props.config.domoticzUrl : '',
    };
  }

  handleMqttChange = (event) => {
    this.setState({mqttBrokerUrl: event.target.value});
  }

  handleDomoticzChange = (event) => {
    this.setState({domoticzUrl: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onChange(this.state);
  }

  render() {
    const welcome = (this.props.config && this.props.config.mqttBrokerUrl) ? '' :
        <div>
          <h1>Reacticz</h1>
          <img src={icon} alt="Reacticz logo"/>
          <p>Welcome to Reacticz, the minimalistic <a href="http://www.domoticz.com" target="_blank">Domoticz</a> dashboard!<br/>
          Documentation is available on  <a href="https://github.com/t0mg/reacticz#reacticz" target="_blank">GitHub</a>.</p>
          <p>Please setup your server config to proceed.</p>
        </div>;
    const mqttOk = this.props.status ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;
    return (
      <div className="SettingsView">
        {welcome}
        <h2>Server Settings</h2>
        <p>To use Reacticz you need a working Domoticz server and a configured MQTT broker with websockets enabled (see <a href="https://github.com/t0mg/reacticz#requirements" target="_blank">requirements</a>).</p>
        <form onSubmit={this.handleSubmit}>
          <label>
            MQTT Broker URL: {mqttOk}
            <input type="text" value={this.state.mqttBrokerUrl} placeholder="ws://mqtt-broker:port" onChange={this.handleMqttChange} />
          </label>
          <br/>
          <label>
            Domoticz server URL:
            <input type="text" value={this.state.domoticzUrl} placeholder="http://domoticz-server:port" onChange={this.handleDomoticzChange} />
          </label>
          <br /><input type="submit" value="Apply &amp; Save" />
        </form>
      </div>
    );
  }
}

export default SettingsView;
