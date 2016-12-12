import React, { Component } from 'react';
import JSONClientSingleton from '../util/JSONClientSingleton'

//import './SettingsView.css';

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
    //const valueText = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div>
        <h3>{this.props.label}</h3>
        <input type="range" min="0" max="15" step="1" value={this.state.localValue} onChange={this.onChange} />
        <p>{this.state.localValue} - {this.props.value}</p>
      </div>
    );
  }

}

export default SwitchDimmer
