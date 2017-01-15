import React, { Component } from 'react';
import LoadingWidget from './LoadingWidget'
import JSONClientSingleton from '../util/JSONClientSingleton'
import './SwitchDimmer.css'

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
  }

  onChange = (event) => {
    if (this.props.readOnly) {
      return
    }
    this.setState({showBar: true});
    this.setState({localValue: parseInt(event.target.value, 10)});
    global.clearTimeout(this.state.debounceTimeoutId);
    this.setState({debounceTimeoutId: global.setTimeout(this.sendValue, 200)});
    global.clearTimeout(this.state.fadeTimeoutId);
    this.setState({fadeTimeoutId: global.setTimeout(this.fadeBar, 1000)});
  }

  fadeBar = () => {
    this.setState({showBar: false});
  }

  sendValue = () => {
    const message = {
      type: "command",
      param: "switchlight",
      idx: this.props.idx,
      switchcmd: "Set Level",
      level: this.state.localValue + 1
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
          <input className="slider" type="range" min="0" max={maxDimLevel} step="1" value={this.state.localValue} onChange={this.onChange} />
        </div>
      </div>
    );
  }

}

export default SwitchDimmer
