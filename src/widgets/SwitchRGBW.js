import React, { Component } from 'react';
import JSONClientSingleton from '../util/JSONClientSingleton'

import './SwitchRGBW.css';
import './SwitchOnOff.css';

class SwitchRGBW extends Component {

  constructor(props) {
    super(props);
    this.state = {
      color: ''
    }
    this.json = new JSONClientSingleton();
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

  changeColor = (event) => {
    if (this.props.readOnly) {
      return
    }
    this.setState({color: event.target.value});
    let message = {
      type: 'command',
      param: 'setcolbrightnessvalue',
      idx: this.props.idx,
      hex: event.target.value.replace('#',''),
      brightness: 100,
      iswhite: false
    };
    this.json.get(message);
  }

  render() {
    const value = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div className="SwitchRGBW">
        <div className="unknown" style={{opacity: this.state.color ? 0 : 1}}>?</div>
        <button onClick={this.toggle} className={'switch ' + value}>{this.props.label}</button>
        <input type="color" value={this.state.color ? this.state.color : '#000000'} onChange={this.changeColor}/>
      </div>
    );
  }

}

export default SwitchRGBW
