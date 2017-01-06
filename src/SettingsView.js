import React, { Component } from 'react';
import './SettingsView.css';

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
    const welcome = this.state.mqttBrokerUrl ? '' :  <span>Welcome to Reacticz, please setup your server config to proceed</span>;
    const mqttOk = this.props.status ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;
    return (
      <div className="SettingsView">
        {welcome}
        <h2>Settings</h2>
        <p>To use Reacticz you need a working Domoticz server and a configured MQTT broker with websockets enabled.</p>
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
