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

  getPushCommand = () => {
    if (this.props.pushOn) {
      return 'On'
    } else if (this.props.pushOff) {
      return 'Off'
    }
    const isOn = this.props.isScene ? this.props.valueText === 'On' :
        this.props.value === 1;
    return isOn ? 'Off' : 'On';
  }

  handleClick = (event) => {
    if (this.props.readOnly) {
      return
    }
    const command = this.getPushCommand();
    if (this.props.isScene) {
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
        switchcmd: command,
        level: 100
      };
      this.mqtt.publish(message);
    }
  }

  getButtonStyle() {
    const theme = this.props.theme;
    if (!theme) {
      return {};
    }
    const style = {
      color: theme.textOn,
      background: theme.buttonOn
    }
    const gradient = 'repeating-linear-gradient(-45deg, _corner, _corner 20%, _bg 20%, _bg 80%, _corner 80%, _corner 100%)';
    if (this.props.pushOn && this.props.isScene) {
      style.color = theme.textMixed;
      style.background = gradient.replace(/_corner/g, theme.buttonMixed).replace(/_bg/g, theme.buttonOff);
      return style;
    }
    if (this.props.valueText === "Mixed") {
      style.color = theme.textMixed;
      style.background = gradient.replace(/_corner/g, theme.buttonOn).replace(/_bg/g, theme.buttonOff);
    }
    if (this.props.valueText === "Off" || this.props.value === 0) {
      style.color = theme.textOff;
      style.background =  theme.buttonOff;
    }
    return style;
  }

  render() {
    const valueText = this.props.valueText || (this.props.value === 0 ? 'Off' : 'On');
    return (
      <button className="switch" style={this.getButtonStyle()} onClick={this.handleClick} title={valueText}>{this.props.label}</button>
    );
  }

}

export default SwitchOnOff
