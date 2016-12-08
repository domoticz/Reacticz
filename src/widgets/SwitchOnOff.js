import React, { Component } from 'react';
import MqttClientSingleton from '../util/MqttClientSingleton'

//import './SettingsView.css';

class SwitchOnOff extends Component {

  constructor(props) {
    super(props);
    this.mqtt = new MqttClientSingleton();
  }

  handleClick = (event) => {
    const message = {
      command: "switchlight",
      idx: this.props.idx,
      switchcmd: this.props.value === 0 ? 'On' : 'Off',
      level: 100
    };
    this.mqtt.publish(message);
  }

  render() {
    const valueText = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div>
        <h3>{this.props.label}</h3>
        <button onClick={this.handleClick}>{valueText}</button>
      </div>
    );
  }

}

export default SwitchOnOff
