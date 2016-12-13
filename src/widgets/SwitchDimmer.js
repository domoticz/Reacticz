import React, { Component } from 'react';
import JSONClientSingleton from '../util/JSONClientSingleton'
import './SwitchDimmer.css'
import './DeviceWidget.css'

class SwitchDimmer extends Component {

  constructor(props) {
    super(props);
    this.json = new JSONClientSingleton();
    this.state = {
      localValue: this.props.value,
      timeoutId: null
    }
  }

  onChange = (event) => {
    this.setState({localValue: parseInt(event.target.value, 10)});
    global.clearTimeout(this.state.timeoutId);
    this.setState({timeoutId: global.setTimeout(this.sendValue, 200)});
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

    const val = this.props.value;
    const c = Math.PI * (90 * 2);
    const pct = ((15 - val) / 15) * c;

    //const valueText = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div>
        <svg className="doughnut" viewBox="0 0 200 200" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle r="90" cx="100" cy="100" fill="transparent" strokeDasharray="565.48" strokeDashoffset="0"></circle>
          <circle className="progress" r="90" cx="100" cy="100" fill="transparent" strokeDasharray="565.48" strokeDashoffset={pct}></circle>
        </svg>
        <h3>{this.props.label}</h3>
        <div className="centered" style={{position: 'absolute', top: 0}}>
          <input className="slider" type="range" min="0" max="15" step="1" value={this.state.localValue} onChange={this.onChange} />
        </div>
      </div>
    );
  }

}

export default SwitchDimmer
