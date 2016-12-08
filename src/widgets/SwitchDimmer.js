import React, { Component } from 'react';
import MqttClientSingleton from '../util/MqttClientSingleton'

//import './SettingsView.css';

class SwitchDimmer extends Component {

  constructor(props) {
    super(props);
    this.mqtt = new MqttClientSingleton();
  }

  render() {
    //const valueText = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div>
        <h3>{this.props.label}</h3>
        Dimmer type not implemented yet.
      </div>
    );
  }

}

export default SwitchDimmer
