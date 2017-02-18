import React, { Component } from 'react';
import Slider from './helpers/Slider';
import JSONClientSingleton from '../util/JSONClientSingleton'

import './SwitchRGBW.css';
import './SwitchOnOff.css';

class SwitchRGBW extends Component {

  constructor(props) {
    super(props);
    this.state = {
      color: '',
      hue: 0,
      sat: 0
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

  toHexStr(num) {
    const hex = Math.round(num * 255).toString(16);
    return hex.length < 2 ? '0' + hex : hex;
  }

  hslToHex(hue = 0, sat = 1, lum = 0.5) {
    let r, g, b;
    if (sat === 0) {
        r = g = b = lum; // achromatic
    } else {
      const hue2rgb = function hue2rgb(p, q, t){
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      const q = lum < 0.5 ? lum * (1 + sat) : lum + sat - lum * sat;
      const p = 2 * lum - q;
      r = hue2rgb(p, q, hue + 1/3);
      g = hue2rgb(p, q, hue);
      b = hue2rgb(p, q, hue - 1/3);
    }
    return '#' + this.toHexStr(r) + this.toHexStr(g) + this.toHexStr(b);
  }

  changeHue = (value) => {
    this.setState({hue: value, sat: 1});
  }

  changeColor = (color) => {
    if (this.props.readOnly) {
      return
    }
    this.setState({color: color});
    let message = {
      type: 'command',
      param: 'setcolbrightnessvalue',
      idx: this.props.idx,
      hex: color.replace('#',''),
      brightness: 100,
      iswhite: false
    };
    this.json.get(message);
  }

  toWhite = () => {
    if (this.props.readOnly) {
      return;
    }
    this.setState({sat: 0});
    this.changeColor('#ffffff');
  }

  render() {
    const theme = this.props.theme;
    const buttonStyle = theme ? {
      background: this.props.value === 0 ? theme.buttonOff : theme.buttonOn,
      color: this.props.value === 0 ? theme.textOff : theme.textOn
    } : {};
    const value = this.props.value === 0 ? 'Off' : 'On';
    const lv1 = this.hslToHex(this.state.hue, this.state.sat,
        this.state.sat ? .125 : .2);
    const lv2 = this.hslToHex(this.state.hue, this.state.sat,
        this.state.sat ? .25 : .4);
    const lv3 = this.hslToHex(this.state.hue, this.state.sat,
        this.state.sat ? .375 : .6);
    const lv4 = this.hslToHex(this.state.hue, this.state.sat,
        this.state.sat ? .5 : .8);
    return (
      <div className="SwitchRGBW">
        <button className="toggle" style={buttonStyle} title={value} onClick={this.toggle}>{this.props.label}</button>
        {this.props.layoutWidth > 1 && <div className="colorSelect">
          <div className="hue">
            <Slider disabled={this.props.readOnly} edgeTolerance={0.1}
                onChange={this.changeHue} value={this.state.hue} />
          </div>
          <div className="swatch">
            <button title="Color at 25%" style={{background: lv1}} onClick={() => this.changeColor(lv1)}></button>
            <button title="Color at 50%" style={{background: lv2}} onClick={() => this.changeColor(lv2)}></button>
            <button title="Color at 75%" style={{background: lv3}} onClick={() => this.changeColor(lv3)}></button>
            <button title="Color at 100%" style={{background: lv4}} onClick={() => this.changeColor(lv4)}></button>
            <div style={{background: theme.buttonOn}}><button className="white" style={{borderColor: theme.buttonOn}} title="Return to white" onClick={this.toWhite}></button></div>
          </div>
        </div>}
      </div>
    );
  }

}

export default SwitchRGBW
