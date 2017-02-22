import React, { Component } from 'react';
import MqttClientSingleton from '../util/MqttClientSingleton'
import './SwitchOnOff.css';
import './MediaPlayer.css';

class MediaPlayer extends Component {

  constructor(props) {
    super(props);
    this.mqtt = new MqttClientSingleton();
  }

  handleClick = (event) => {
    if (this.props.readOnly) {
      return
    }
    const message = {
      command: 'switchlight',
      idx: this.props.idx,
      switchcmd: this.props.value === 0 ? 'On' : 'Off',
      level: 100
    };
    this.mqtt.publish(message);
  }

  getButtonStyle() {
    const theme = this.props.theme;
    if (!theme) {
      return {};
    }
    const style = {
      color: theme.textOn,
      background: this.props.readOnly ? theme.unlockedBackground : theme.buttonOn
    }
    if (this.props.valueText === "Off" || this.props.value === 0) {
      style.color = theme.textOff;
      style.background =  this.props.readOnly ? theme.unlockedBackground : theme.buttonOff;
    }
    return style;
  }

  render() {
    const valueText = this.props.valueText || (this.props.value === 0 ? 'Off' : 'On');
    const valuePlaying = ((this.props.playing === "100" && valueText === "On") ? 'Loading...' : ((this.props.playing === "100" && valueText === "Off") ? 'Off' : this.props.playing));
    return (
      <button className="switch" style={this.getButtonStyle()} onClick={this.handleClick} title={valueText}>{this.props.label}<i className="playing">{valuePlaying}</i></button>
    );
  }

}

export default MediaPlayer
