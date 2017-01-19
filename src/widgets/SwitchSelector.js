import React, { Component } from 'react';
import LoadingWidget from './LoadingWidget'
import MqttClientSingleton from '../util/MqttClientSingleton'
import './SwitchSelector.css';
import './SwitchOnOff.css';

class SwitchSelector extends Component {

  constructor(props) {
    super(props);
    this.mqtt = new MqttClientSingleton();
  }

  handleSelect = (event) => {
    if (this.props.readOnly) {
      return
    }
    const message = {
      command: 'switchlight',
      idx: this.props.idx,
      switchcmd: 'Set Level',
      level: event.target.value
    };
    this.mqtt.publish(message);
  }

  render() {
    if (!this.props.deviceSpec) {
      return <LoadingWidget />
    }
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text
    } : {};
    const buttonStyleOff = theme ? {
      background: theme.buttonOff,
      color: theme.textOff
    } : {};
    const buttonStyleOn = theme ? {
      background: theme.buttonOn,
      color: theme.textOn
    } : {};
    const carretStyle = theme ? {
      color: this.props.value === '0' ? theme.textOff : theme.textOn
    } : {};
    const list = this.props.levels.map(function(level, index) {
      const levelValue = index * 10;
      const selected = parseInt(this.props.value, 10) === levelValue;
      if (index === 0 && this.props.deviceSpec["LevelOffHidden"] === true) {
        return null;
      }
      if (this.props.useButtons) {
        return (
          <button key={index + '-' + level}
                  className="switch"
                  style={selected ? buttonStyleOn : buttonStyleOff}
                  value={levelValue} onClick={this.handleSelect}>{level}
          </button>
        );
      }
      return (
        <option key={index + '-' + level} value={levelValue}>{level}</option>
      );
    }, this);
    if (this.props.useButtons) {
      return (<div className="selector" style={style}><h2>{this.props.label}</h2><section>{list}</section></div>);
    }
    return (<div className="selector" style={style}>
        <h2>{this.props.label}</h2>
        <div className="selectContainer">
        <i className="carret" style={carretStyle}>▼</i>
        <select disabled={this.props.readOnly} value={this.props.value} style={this.props.value === '0' ? buttonStyleOff : buttonStyleOn} onChange={this.handleSelect}>{list}</select>
        </div></div>);
  }
}

export default SwitchSelector
