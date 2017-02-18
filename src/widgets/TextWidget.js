import React, { Component } from 'react';
import GenericWidget from "./helpers//GenericWidget";

class TextWidget extends Component {

  render() {
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
      <GenericWidget value1={text} {...this.props} />
    );
  }

}

export default TextWidget
