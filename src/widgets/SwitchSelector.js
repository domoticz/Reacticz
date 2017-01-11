/*
Example

{"Battery":255,
"LevelActions":"|||",
"LevelNames":"Off|Level1|Level2|Level3",
"LevelOffHidden":"false",
"RSSI":12,
"SelectorStyle":"1",    1 for drop down, 0 for buttons
"description":"",
"dtype":"Light/Switch",
"id":"00000000",
"idx":128,
"name":"selector test",
"nvalue":0,
"stype":"Selector Switch",
"svalue1":"0",
"switchType":"Selector",
"unit":1}

*/

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
    const list = this.props.levels.map(function(level, index) {
      const levelValue = index * 10;
      const selected = parseInt(this.props.value, 10) === levelValue;
      if (index === 0 && this.props.deviceSpec["LevelOffHidden"] === true) {
        return null;
      }
      if (this.props.useButtons) {
        return (
          <button key={index + '-' + level} className={'switch' + (selected ? ' On' : '')} value={levelValue} onClick={this.handleSelect}>{level}</button>
        );
      }
      return (
        <option key={index + '-' + level} value={levelValue}>{level}</option>
      );
    }, this);
    if (this.props.useButtons) {
      return (<div className="selector"><h2>{this.props.label}</h2><section>{list}</section></div>);
    }
    return (<div className={'selector' + (this.props.value !== '0' ? ' On' : '')}>
        <h2>{this.props.label}</h2>
        <div>
        <i className="carret">▼</i>
        <select disabled={this.props.readOnly} value={this.props.value} onChange={this.handleSelect}>{list}</select>
        </div></div>);
  }
}

export default SwitchSelector
