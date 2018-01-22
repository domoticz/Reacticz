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
    this.valueStopped = 0;
    this.inverted = false;
    switch (this.props.type) {
      case 'Blinds' :
        switch (this.props.device.stype) {
          case 'ASP' :
            this.valueOpen = 0;
            this.valueClosed = 1;
            this.valueStopped = 2;
            break;
          default :
            break;
        }
        break;
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
    const style = theme ? {
      background: this.props.readOnly ? theme.unlockedBackground : theme.background,
      color: theme.text
    } : {};
    const buttonStyleOpen = theme ? {
      fill: isOpen ? theme.textOn : theme.textOff,
      background: isOpen ? theme.buttonOn : theme.buttonOff
    } : {};
    const buttonStyleStop = theme ? {
      fill: this.props.value === this.valueStopped ? theme.textOn : theme.textOff,
      background: this.props.value === this.valueStopped ? theme.buttonOn : theme.buttonOff
    } : {};
    const buttonStyleClose = theme ? {
      fill: isClosed ? theme.textOn : theme.textOff,
      background: isClosed ? theme.buttonOn : theme.buttonOff
    } : {};
    return (
      <div className="SwitchBlinds" style={style}>
        <h2>{this.props.label}</h2>
        <section>
          <button onClick={this.inverted ? this.close: this.open} className={'blindsOpen' + (isOpen ? ' selected' : '')} style={buttonStyleOpen}><svg className='icon'><use xlinkHref='#arrow-up-drop-circle' /></svg></button>
          <button onClick={this.stop} className={'blindsStop' + (this.props.value === this.valueStopped ? ' selected' : '')} style={buttonStyleStop}><svg className='icon'><use xlinkHref='#stop-circle' /></svg></button>
          <button onClick={this.inverted ? this.open : this.close} className={'blindsClose' + (isClosed ? ' selected' : '')} style={buttonStyleClose}><svg className='icon'><use xlinkHref='#arrow-down-drop-circle' /></svg></button>
        </section>
      </div>
    );
  }

}

export default SwitchBlinds
