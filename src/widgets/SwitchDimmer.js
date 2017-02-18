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

  render() {
    if (!this.props.deviceSpec) {
      return <LoadingWidget />
    }
    const theme = this.props.theme;
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
    return (
      <div>
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
      </div>
    );
  }
}

export default SwitchDimmer
