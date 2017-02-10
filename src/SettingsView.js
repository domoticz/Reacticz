import React, { Component } from 'react';
import './SettingsView.css';
import icon from '../public/icon/icon_64.png';

class SettingsView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mqttBrokerUrl: props.config ? props.config.mqttBrokerUrl : '',
      mqttAuthChecked: props.config ? props.config.mqttAuthChecked : false,
      mqttLogin: props.config ? props.config.mqttLogin : '',
      mqttPassword: props.config ? props.config.mqttPassword : '',
      domoticzUrl: props.config ? props.config.domoticzUrl : '',
      domoticzAuthChecked: props.config ? props.config.domoticzAuthChecked : false,
      domoticzLogin: props.config ? props.config.domoticzLogin : '',
      domoticzPassword: props.config ? props.config.domoticzPassword : ''
    };
  }

  handleChange = event => {
    const newPartialState = {};
    newPartialState[event.target.name] = event.target.value;
    this.setState(newPartialState);
  }
 
  handleMqttAuthCheckbox = event => {
    if (this.state.mqttAuthChecked) {
      this.setState({mqttLogin: '', mqttPassword: ''});
    }
    this.setState({mqttAuthChecked: !this.state.mqttAuthChecked});
  }
  
  handleDomoticzAuthCheckbox = event => {
    if (this.state.domoticzAuthChecked) {
      this.setState({domoticzLogin: '', domoticzPassword: ''});
    }
    this.setState({domoticzAuthChecked: !this.state.domoticzAuthChecked});
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.onChange(this.state);
  }
  
  renderWelcomeMsg = () => {
    return(
      <div>
        <h1>Reacticz</h1>
        <img src={icon} alt="Reacticz logo"/>
        <p>Welcome to Reacticz, the minimalistic <a href="http://www.domoticz.com" target="_blank">Domoticz</a> dashboard!<br/>
        Documentation is available on  <a href="https://github.com/t0mg/reacticz#reacticz" target="_blank">GitHub</a>.</p>
        <p>Please setup your server config to proceed.</p>
      </div>
    );
  }
  
  renderMqttAuthForm = () => {
    return(
      <fieldset>
        <label>
          Username:
          <input type="text" value={this.state.mqttLogin} name="mqttLogin" placeholder="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input type="password" value={this.state.mqttPassword} name="mqttPassword" placeholder="Password" onChange={this.handleChange} />
        </label>
      </fieldset>
    );
  }
  
  renderDomoticzAuthForm = () => {
    return(
      <fieldset>
        <label>
          Username:
          <input type="text" value={this.state.domoticzLogin} name="domoticzLogin" placeholder="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input type="password" value={this.state.domoticzPassword} name="domoticzPassword" placeholder="Password" onChange={this.handleChange} />
        </label>
      </fieldset>
    );
  }

  render() {
    const welcome = (this.props.config && this.props.config.mqttBrokerUrl) ? '' : this.renderWelcomeMsg();

    const mqttAuthRequired = (this.state.mqttAuthChecked) ? this.renderMqttAuthForm() : '';
    const domoticzAuthRequired = (this.state.domoticzAuthChecked) ? this.renderDomoticzAuthForm() : '';

    const mqttOk = this.props.mqttStatus ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;
    const domoticzOk = this.props.domoticzStatus ? <span className="Status OK">connected!</span> : <span className="Status">unavailable</span>;

    return (
      <div className="SettingsView">
        {welcome}
        <h2>Server Settings</h2>
        <p>To use Reacticz you need a working Domoticz server and a configured MQTT broker with websockets enabled (see <a href="https://github.com/t0mg/reacticz#requirements" target="_blank">requirements</a>).</p>
        <form onSubmit={this.handleSubmit}>
          <h3>MQTT</h3>
          <label>
            Broker URL: {mqttOk}
            <input type="text" value={this.state.mqttBrokerUrl} name="mqttBrokerUrl" placeholder="ws://mqtt-broker:port" onChange={this.handleChange} />
          </label>
          <br/>
          <label>
            Authentication required:
            <input type="checkbox" onChange={this.handleMqttAuthCheckbox} checked={this.state.mqttAuthChecked} ></input>
          </label>
          <br/>
          {mqttAuthRequired}
          <br/>
          <h3>Domoticz</h3>
          <label>
            Server URL: {domoticzOk}
            <input type="text" value={this.state.domoticzUrl} name="domoticzUrl" placeholder="http://domoticz-server:port" onChange={this.handleChange} />
          </label>
          <br/>
          <label>
            Authentication required:
            <input type="checkbox" onChange={this.handleDomoticzAuthCheckbox} checked={this.state.domoticzAuthChecked} ></input>
          </label>
          <br/>
          {domoticzAuthRequired}
          <br /><input type="submit" value="Apply &amp; Save" />
        </form>
      </div>
    );
  }
}

export default SettingsView;
