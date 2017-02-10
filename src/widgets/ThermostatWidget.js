import React, { Component } from 'react';
import JSONClientSingleton from '../util/JSONClientSingleton'
import './ThermostatWidget.css';

class ThermostatWidget extends Component {

  constructor(props) {
    super(props);
    this.json = new JSONClientSingleton();
    this.state = {
      settingValue: false,
      targetValue: parseFloat(this.props.value, 10),
      throttleId: null
    };
  }

  decreaseSetpoint = () => {
    this.updateSetpoint(-0.5);
  }

  increaseSetpoint = () => {
    this.updateSetpoint(0.5);
  }

  updateSetpoint(delta) {
    if (this.props.readOnly) {
      return
    }
    window.clearTimeout(this.state.throttleId);
    let targetValue = this.state.settingValue ? this.state.targetValue :
        parseFloat(this.props.value);
    targetValue += delta;
    this.setState({
      settingValue: true,
      targetValue: targetValue,
      throttleId: window.setTimeout(() => this.emitSetpointUpdate(), 1000)
    });
  }

  emitSetpointUpdate() {
    const message = {
      type: 'command',
      param: 'udevice',
      idx: this.props.idx,
      nvalue: 0,
      svalue: this.state.targetValue
    };
    this.json.get(message, () => {
      this.setState({settingValue: false})
    });
  }

  render() {
    const updating = this.state.settingValue ?
        this.state.targetValue !== parseFloat(this.props.value, 10) : false
    const displayValue = updating ? Number(this.state.targetValue).toFixed(1) :
        parseFloat(this.props.value, 10);
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text
    } : {};
    const buttonStyle = theme ? {
      backgroundColor: theme.buttonOff,
      color: theme.textOff
    } : {};
    return (
      <div className="ThermostatWidget" style={style}>
        <h2>{this.props.label}</h2>
        <div className="controls">
          <button className="switch minus" style={buttonStyle}
                  onClick={this.decreaseSetpoint}>-</button>
          <div className={updating ? 'blink' : ''}>{displayValue}</div>
          <button className="switch plus" style={buttonStyle}
                  onClick={this.increaseSetpoint}>+</button>
        </div>
      </div>
    );
  }

}

export default ThermostatWidget
