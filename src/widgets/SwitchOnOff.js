import React, { Component } from 'react';
import MqttClientSingleton from '../util/MqttClientSingleton'
import JSONClientSingleton from '../util/JSONClientSingleton'
import './SwitchOnOff.css';

class SwitchOnOff extends Component {

  constructor(props) {
    super(props);
    if (this.props.isScene) {
      this.json = new JSONClientSingleton();
    } else {
      this.mqtt = new MqttClientSingleton();
    }
  }

  handleClick = (event) => {
    if (this.props.readOnly) {
      return
    }
    if (this.props.isScene) {
      const command = this.props.pushButton ? 'On' :
          (this.props.valueText === 'On' ? 'Off' : 'On');
      const message = {
        type: 'command',
        param: 'switchscene',
        idx: this.props.idx,
        switchcmd: command
      };
      this.json.get(message, this.props.onChange);
    } else {
      const message = {
        command: 'switchlight',
        idx: this.props.idx,
        switchcmd: this.props.value === 0 ? 'On' : 'Off',
        level: 100
      };
      this.mqtt.publish(message);
    }
  }

  render() {
    const valueText = this.props.valueText || (this.props.value === 0 ? 'Off' : 'On');
    return (
      <button className={'switch ' + (this.props.pushButton ? 'Push' : valueText)} onClick={this.handleClick} title={valueText}>{this.props.label}</button>
    );
  }

}

export default SwitchOnOff
