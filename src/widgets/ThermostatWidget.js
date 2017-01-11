/*
{"Battery":255,"RSSI":10,"description":"","dtype":"Heating","id":"92130","idx":131,"name":"thermostat","nvalue":0,"stype":"Zone","svalue1":"0.0","svalue2":"0.0","svalue3":"Auto","unit":1}
{"Battery":255,"RSSI":12,"description":"","dtype":"Heating","id":"92130","idx":131,"name":"thermostat","nvalue":0,"stype":"Zone","svalue1":"20.5","unit":1}
{"Battery":255,"RSSI":12,"dtype":"Thermostat","id":"0000001","idx":283,"name":"Thermostaat","nvalue":0,"stype":"SetPoint","svalue1":"17.00","unit":0}
*/

import React, { Component } from 'react';
//import MqttClientSingleton from '../util/MqttClientSingleton'
import JSONClientSingleton from '../util/JSONClientSingleton'
import './ThermostatWidget.css';

class ThermostatWidget extends Component {

  constructor(props) {
    super(props);
    this.json = new JSONClientSingleton();
    //this.mqtt = new MqttClientSingleton();
  }

  decreaseSetpoint = () => {
    this.updateSetpoint(parseFloat(this.props.value, 10) - 0.5);
  }

  increaseSetpoint = () => {
    this.updateSetpoint(parseFloat(this.props.value, 10) + 0.5);
  }

  updateSetpoint(value) {
    if (this.props.readOnly) {
      return
    }
    //type=command&param=udevice&idx=131&nvalue=0&svalue=20.5
    const message = {
      type: 'command',
      param: 'udevice',
      idx: this.props.idx,
      nvalue: 0,
      svalue: value
    };
    this.json.get(message);
  }

  render() {
    return (
      <div className="thermostat">
        <h2>{this.props.label}</h2>
        <div className="controls">
          <button className="switch minus" onClick={this.decreaseSetpoint}>-</button>
          <div>{Number(this.props.value).toFixed(1)}</div>
          <button className="switch plus" onClick={this.increaseSetpoint}>+</button>
        </div>
      </div>
    );
  }

}

export default ThermostatWidget
