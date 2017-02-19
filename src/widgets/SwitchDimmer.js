import React, { Component } from 'react';
import LoadingWidget from './LoadingWidget';
import Slider from './helpers/Slider';
import JSONClientSingleton from '../util/JSONClientSingleton';
import './SwitchDimmer.css';

class SwitchDimmer extends Component {

  constructor(props) {
    super(props);
    this.json = new JSONClientSingleton();
    this.state = {
      localValue: this.props.value,
      debounceTimeoutId: null,
      fadeTimeoutId: null,
      showBar: false
    }
    this.touchTarget = null;
    this.touchStartData = null;
  }

  handleValueChange = (value) => {
    console.log(value);
    if (value === 0) {
      this.sendOff();
    } else {
      this.sendValue(value);
    }
  }

  sendValue = (value) => {
    const scale = this.props.deviceSpec['MaxDimLevel'] || 100;
    const message = {
      type: 'command',
      param: 'switchlight',
      idx: this.props.idx,
      switchcmd: 'Set Level',
      level: Math.round(value * scale) + 1
    };
    this.json.get(message);
  }

  sendOff = () => {
    const message = {
      type: 'command',
      param: 'switchlight',
      idx: this.props.idx,
      switchcmd: 'Off'
    };
    this.json.get(message);
  }

  toggle = () => {
    if (this.props.readOnly) {
      return
    }
    let message = {
      type: 'command',
      param: 'switchlight',
      switchcmd: 'Toggle',
      idx: this.props.idx
    }
    this.json.get(message);
  }

  render() {
    console.log(this.props.device);
    if (!this.props.deviceSpec) {
      return <LoadingWidget />
    }
    const theme = this.props.theme;
    const buttonStyle = theme ? {
      background: this.props.value === 0 ? theme.buttonOff : theme.buttonOn,
      color: this.props.value === 0 ? theme.textOff : theme.textOn
    } : {};
    const progressStyle = theme ? {
      backgroundColor: theme.buttonOn,
      color: theme.textOn
    } : {};
    const containerStyle = theme ? {
      backgroundColor: theme.buttonOff,
      color: theme.textOff
    } : {};
    const maxDimLevel = this.props.deviceSpec['MaxDimLevel'] || 100;
    const currentPct = this.props.value / maxDimLevel * 100;
    progressStyle.transform = 'translateX(' + (100 - currentPct) + '%)';
    const toggleLabel = this.props.device.nvalue === 0 ? 'Off' : 'On';
    return (
      <div className="SwitchDimmer">
        <button className="toggle" style={buttonStyle} title={this.props.layoutWidth > 1 ? toggleLabel : this.props.label} onClick={this.toggle}>{this.props.layoutWidth > 1 ? '' : this.props.label}</button>
        {this.props.layoutWidth > 1 && <div className="dimmerSlider">
          <div className="dimmerContainer" style={containerStyle}>
            <div className="dimmerProgress" style={{transform: 'translateX(' + currentPct + '%)'}}>
              <div className="dimmerProgressContent" style={progressStyle}>
                <p>{this.props.label}</p>
              </div>
            </div>
            <p>{this.props.label}</p>
          </div>
          <Slider disabled={this.props.readOnly} throttle={200}
              onChange={this.handleValueChange} value={this.props.value/maxDimLevel} />
        </div>}
      </div>
    );
  }
}

export default SwitchDimmer
