//param=setcolbrightnessvalue&idx=15&hex=FF00FF&brightness=100&iswhite=false
import React, { Component } from 'react';
import JSONClientSingleton from '../util/JSONClientSingleton'

//import './SettingsView.css';

class SwitchBlinds extends Component {

  constructor(props) {
    super(props);
    this.json = new JSONClientSingleton();
  }

  toggle = () => {
    let message = {
      type: 'command',
      param: 'switchlight',
      switchcmd: 'Toggle',
      idx: this.props.idx
    }
    this.json.get(message);
  }

  changeColor = (event) => {
    console.log(event.target.value);
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
    const valueText = this.props.value === 0 ? 'Off' : 'On';
    return (
      <div>
        <h3>{this.props.label}</h3>
        <input type="color" onChange={this.changeColor}/>
        <button onClick={this.toggle}>{valueText}</button>
      </div>
    );
  }

}

export default SwitchBlinds
