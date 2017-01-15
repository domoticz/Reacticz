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

  getBackgroundStyle() {
    const theme = this.props.theme;
    if (!theme) {
      return;
    }
    const gradient = 'repeating-linear-gradient(-45deg, _corner, _corner 20%, _bg 20%, _bg 80%, _corner 80%, _corner 100%)';
    if (this.props.pushButton) {
      return gradient.replace(/_corner/g, theme.buttonMixed).replace(/_bg/g, theme.buttonOff);
    }
    if (this.props.valueText === "Mixed") {
      return gradient.replace(/_corner/g, theme.buttonOn).replace(/_bg/g, theme.buttonOff);
    }
    if (this.props.valueText === "Off" || this.props.value === 0) {
      return theme.buttonOff;
    }
    return theme.buttonOn;
  }

  render() {
    const valueText = this.props.valueText || (this.props.value === 0 ? 'Off' : 'On');
    const theme = this.props.theme;
    const style = theme ? {
      background: this.getBackgroundStyle(),
      color: valueText === "Mixed" ? theme.textMixed : valueText === "Off" ? theme.textOff : theme.textOn
    } : {};
    return (
      <button className={'switch ' + (this.props.pushButton ? 'Push' : valueText)} style={style} onClick={this.handleClick} title={valueText}>{this.props.label}</button>
    );
  }

}

export default SwitchOnOff
