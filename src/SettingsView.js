import React, { Component } from 'react';
import './SettingsView.css';

class SettingsView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mqttBrokerUrl: props.config.mqttBrokerUrl,
      domoticzUrl: props.config.domoticzUrl,
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
    const welcome = this.props.config.mqttBrokerUrl ? '' :  <span>Welcome, please setup your server config to proceed</span>;
    const mqttOk = this.props.status ? <span className="OK">Connected</span> : <span className="Status">Offline</span>;
    return (
      <div className="Settings">
        {welcome}
        <h2>Settings</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            MQTT Broker URL:
            <input type="text" value={this.state.mqttBrokerUrl} onChange={this.handleMqttChange} />
          </label>
          {mqttOk}
          <br/>
          <label>
            Domoticz server IP:
            <input type="text" value={this.state.domoticzUrl} onChange={this.handleDomoticzChange} />
          </label>
          <input type="submit" value="Save" />
        </form>
        <button onClick={this.props.onExit}>Back</button>
      </div>
    );
  }
}

export default SettingsView;
