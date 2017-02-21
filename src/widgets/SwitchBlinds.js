import React, { Component } from 'react';
import MqttClientSingleton from '../util/MqttClientSingleton'
import JSONClientSingleton from '../util/JSONClientSingleton'

import './SwitchBlinds.css';

class SwitchBlinds extends Component {

  constructor(props) {
    super(props);
    this.mqtt = new MqttClientSingleton();
    this.json = new JSONClientSingleton();
    // nvalue for normal Blinds switch type.
    this.valueOpen = 1;
    this.valueClosed = 3;
    this.inverted = false;
    switch (this.props.type) {
      case 'Blinds Inverted' :
        this.inverted = true;
        this.valueOpen = 3;
        this.valueClosed = 1;
        break;
      case 'Venetian Blinds EU' :
        this.valueOpen = 17;
        this.valueClosed = 18;
        break;
      case 'Venetian Blinds US' :
        this.valueOpen = 15;
        this.valueClosed = 16;
        break;
      default:
        break;
    }
  }

  open = () => {
    this.sendValue("Off");
  }

  stop = () => {
    // Stop command isnt's working via MQTT, so we fall back to JSON.
    this.sendValue("Stop", true /* opt_useJSON */);
  }

  close = () => {
    this.sendValue("On");
  }

  sendValue(val, opt_useJSON = false) {
    if (this.props.readOnly) {
      return
    }
    const message = {
      command: "switchlight",
      idx: this.props.idx,
      switchcmd: val
    };
    if (opt_useJSON) {
      message.type = "command"
      message.param = "switchlight";
      this.json.get(message);
    } else {
      this.mqtt.publish(message);
    }
  }

  render() {
    const isOpen = this.props.value === this.valueOpen;
    const isClosed = this.props.value === this.valueClosed;
    const theme = this.props.theme;
    const gradient = 'linear-gradient(to bottom, _a, _a 50%, _b 50%, _b)';
    const style = theme ? {
      backgroundColor: this.props.readOnly ? theme.unlockedBackground : theme.background,
      color: theme.text
    } : {};
    const buttonStyleOpen = theme ? {
      color: isOpen ? theme.blindTextOn : theme.blindTextOff,
      background: theme.blindOpen
    } : {};
    const buttonStyleStop = theme ? {
      color: this.props.value === 0 ? theme.blindTextOn : theme.blindTextOff,
      background: theme.buttonOff
    } : {};
    const buttonStyleClose = theme ? {
      color: isClosed ? theme.blindTextOn : theme.blindTextOff,
      background: gradient.replace(/_a/g, theme.blindClosed).replace(/_b/g, theme.buttonMixed)
    } : {};
    return (
      <div className="SwitchBlinds" style={style}>
        <h2>{this.props.label}</h2>
        <section>
          <button onClick={this.inverted ? this.close: this.open} className={'blindsOpen' + (isOpen ? ' selected' : '')} style={buttonStyleOpen}>Open</button>
          <button onClick={this.stop} className={'blindsStop' + (this.props.value === 0 ? ' selected' : '')} style={buttonStyleStop}>Stop</button>
          <button onClick={this.inverted ? this.open : this.close} className={'blindsClose' + (isClosed ? ' selected' : '')} style={buttonStyleClose}>Close</button>
        </section>
      </div>
    );
  }

}

export default SwitchBlinds
