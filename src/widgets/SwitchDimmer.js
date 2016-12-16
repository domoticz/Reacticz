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
    const targetPct = this.state.localValue / 15 * 100;
    const currentPct = this.props.value / 15 * 100;
    return (
      <div>
        <div className="dimmerContainer">
          <div className="dimmerProgress" style={{transform: 'translateX(' + currentPct + '%)'}}>
            <div className="dimmerProgressContent" style={{transform: 'translateX(' + (100 - currentPct) + '%)'}}>
              <p>{this.props.label}</p>
            </div>
          </div>
          <p>{this.props.label}</p>
        </div>
        <div className="bar" style={{transform: 'translateX(' + targetPct + '%)'}}></div>
        <div className="centered" style={{position: 'absolute', top: 0}}>
          <input className="slider" type="range" min="0" max="15" step="1" value={this.state.localValue} onChange={this.onChange} />
        </div>
      </div>
    );
  }

}

export default SwitchDimmer
