import React, { Component } from 'react';
import './SettingsView.css';
import icon from '../public/icon/icon_64.png';

class SettingsView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      domoticzAuthChecked: props.config ?
          !!props.config.domoticzAuthChecked : false,
      domoticzLogin: props.config ? props.config.domoticzLogin : '',
      domoticzPassword: props.config ? props.config.domoticzPassword : '',
      domoticzUrl: props.config ? props.config.domoticzUrl : '',
      mqttAuthChecked: props.config ? !!props.config.mqttAuthChecked : false,
      mqttBrokerUrl: props.config ? props.config.mqttBrokerUrl : '',
      mqttLogin: props.config ? props.config.mqttLogin : '',
      mqttPassword: props.config ? props.config.mqttPassword : ''
    };
  }

  handleChange = event => {
    let target = event.target;
    const newPartialState = {};
    newPartialState[target.name] = target.type === "checkbox" ?
        target.checked : target.value;
    this.setState(newPartialState);
  }

  handleSubmit = event => {
    event.preventDefault();
    const state = Object.assign({}, this.state);
    if (!state.mqttAuthChecked) {
      state.mqttLogin = '';
      state.mqttPassword = '';
    }
    if (!state.domoticzAuthChecked) {
      state.domoticzLogin = '';
      state.domoticzPassword = '';
    }
    this.setState(state);
    this.props.onChange(state);
  }

  renderWelcomeMsg = () => {
    return(
      <div>
        <h1>Reacticz</h1>
        <img src={icon} alt="Reacticz logo"/>
        <p>Welcome to Reacticz, the minimalistic <a href="http://www.domoticz.com" target="_blank">Domoticz</a> dashboard!<br/>
        Documentation is available on  <a href="https://github.com/domoticz/Reacticz#reacticz" target="_blank">GitHub</a>.</p>
        <p>Please setup your server config to proceed.</p>
        <p><em>Not your first time here?&nbsp;&nbsp;<button onClick={this.props.importConfigPrompt}>Import config from another dashboard</button></em></p>
      </div>
    );
  }

  renderMqttAuthForm = () => {
    return(
      <fieldset>
        <label>
          Username&nbsp;
          <input type="text" value={this.state.mqttLogin} name="mqttLogin" placeholder="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password&nbsp;
          <input type="password" value={this.state.mqttPassword} name="mqttPassword" placeholder="Password" onChange={this.handleChange} />
        </label>
      </fieldset>
    );
  }

  renderDomoticzAuthForm = () => {
    return(
      <fieldset>
        <label>
          Username&nbsp;
          <input type="text" value={this.state.domoticzLogin} name="domoticzLogin" placeholder="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password&nbsp;
          <input type="password" value={this.state.domoticzPassword} name="domoticzPassword" placeholder="Password" onChange={this.handleChange} />
        </label>
      </fieldset>
    );
  }

  render() {
    const mqttOk = this.props.serverStatus && this.props.serverStatus.mqtt ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;
    const domoticzOk = this.props.serverStatus && this.props.serverStatus.domoticz ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;

    return (
      <div className="SettingsView">
        {!(this.props.config && this.props.config.mqttBrokerUrl && this.props.config.domoticzUrl) && this.renderWelcomeMsg()}
        <h2>Server Settings</h2>
        <p>To use Reacticz you need a working Domoticz server and a configured MQTT broker with websockets enabled (see <a href="https://github.com/domoticz/Reacticz#requirements" target="_blank">requirements</a>).</p>
        <form onSubmit={this.handleSubmit}>
          <h3>MQTT {this.props.config && this.props.config.mqttBrokerUrl && mqttOk}</h3>
          <label>
            Broker URL:
            <input type="url" value={this.state.mqttBrokerUrl} name="mqttBrokerUrl" placeholder="ws://mqtt-broker:port" onChange={this.handleChange} />
          </label>
          <label>
            <input type="checkbox" name="mqttAuthChecked" onChange={this.handleChange}
                checked={this.state.mqttAuthChecked} /> use authentication
          </label>
          <br/>
          {this.state.mqttAuthChecked && this.renderMqttAuthForm()}
          <br/>
          <h3>Domoticz {this.props.config && this.props.config.domoticzUrl && domoticzOk}</h3>
          <label>
            Server URL:
            <input type="url" value={this.state.domoticzUrl} name="domoticzUrl" placeholder="http://domoticz-server:port" onChange={this.handleChange} />
          </label>
          <label>
            <input type="checkbox" name="domoticzAuthChecked" onChange={this.handleChange}
                checked={this.state.domoticzAuthChecked} /> use authentication
          </label>
          <br/>
          {this.state.domoticzAuthChecked && this.renderDomoticzAuthForm()}
          <br /><input type="submit" value="Apply &amp; Save" />
        </form>
      </div>
    );
  }
}

export default SettingsView;
