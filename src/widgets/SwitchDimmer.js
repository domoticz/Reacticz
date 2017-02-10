import React, { Component } from 'react';
import LoadingWidget from './LoadingWidget'
import JSONClientSingleton from '../util/JSONClientSingleton'
import './SwitchDimmer.css'

const HORIZONTAL_THRESHOLD_RAD = 0.8;

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

  onClick = (event) => {
    if (this.props.readOnly) {
      return
    }
    var rect = this.touchTarget.getBoundingClientRect();
    let value = (event.pageX - rect.left) / rect.width;
    // Make off and max slightly larger touch targets.
    if (value <= 0.1) {
      this.sendOff();
      return;
    } else if (value >= 0.9) {
      value = 1;
    }
    const targetValue = Math.round(value * (this.props.deviceSpec['MaxDimLevel'] || 100));
    this.setState({showBar: true});
    this.setState({localValue: parseInt(targetValue, 10)});
    global.clearTimeout(this.state.debounceTimeoutId);
    this.setState({debounceTimeoutId: global.setTimeout(this.sendValue, 200)});
    global.clearTimeout(this.state.fadeTimeoutId);
    this.setState({fadeTimeoutId: global.setTimeout(this.fadeBar, 1000)});
  }

  onTouchStart = (event) => {
    this.touchStartData = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
      rect: this.touchTarget.getBoundingClientRect()
    };
  }

  onTouchMove = (event) => {
    if (this.props.readOnly) {
      return;
    }

    const touch = event.changedTouches[0];
    const angle = Math.atan2(
        touch.pageY - this.touchStartData.y,
        touch.pageX - this.touchStartData.x);
    const isVertical =
        (Math.abs(Math.abs(angle) - Math.PI / 2)) <= HORIZONTAL_THRESHOLD_RAD;

    if (isVertical) {
      return;
    }

    const pct = (touch.pageX - this.touchStartData.rect.left) /
        this.touchStartData.rect.width;
    const max = (this.props.deviceSpec['MaxDimLevel'] || 100);
    const targetValue = Math.min(max, Math.max(Math.round(pct * max), 0));

    if (this.state.localValue !== targetValue) {
      this.setState({showBar: true});
      this.setState({localValue: parseInt(targetValue, 10)});
      global.clearTimeout(this.state.debounceTimeoutId);
      this.setState(
          {debounceTimeoutId: global.setTimeout(this.sendValue, 200)});
      global.clearTimeout(this.state.fadeTimeoutId);
      this.setState({fadeTimeoutId: global.setTimeout(this.fadeBar, 1000)});
    }
  }

  fadeBar = () => {
    this.setState({showBar: false});
  }

  sendValue = (opt_targetValue) => {
    const message = {
      type: 'command',
      param: 'switchlight',
      idx: this.props.idx,
      switchcmd: 'Set Level',
      level: (opt_targetValue || this.state.localValue) + 1
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
    const targetPct = this.state.localValue / maxDimLevel * 100;
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
        <div className="bar" style={{transform: 'translateX(' + targetPct + '%)', opacity: this.state.showBar ? 1 : 0}}></div>
        <div style={{width: '100%', height: '100%', position: 'absolute', top: 0}}>
          <div className="slider" ref={(div) => { this.touchTarget = div; }}
              onClick={this.onClick} onTouchStart={this.onTouchStart}
              onTouchMove={this.onTouchMove}></div>
        </div>
      </div>
    );
  }
}

export default SwitchDimmer
