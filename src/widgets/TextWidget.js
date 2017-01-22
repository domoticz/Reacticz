import React, { Component } from 'react';
import './TextWidget.css';

class TextWidget extends Component {

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text
    } : {};
    const textBits = [];
    const device = this.props.device;
    for (const key in device) {
      if ({}.hasOwnProperty.call(device, key) && !!key.match(/^svalue/)) {
        textBits.push(device[key]);
      }
    }
    // For some reason Domoticz gives me incomplete "&nbsp" (without ";") HTML
    // codes in one of my virtual devices.  So we are removing them here.
    const text = textBits.join(' ').replace(/&nbsp/g, ' ');
    return (
      <div className="TextWidget" style={style}>
        <section>
          <div>{this.props.label}</div>
          <h2>{text}</h2>
        </section>
      </div>
    );
  }

}

export default TextWidget
