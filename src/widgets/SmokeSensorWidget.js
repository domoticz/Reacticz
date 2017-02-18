import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';

class SmokeSensorWidget extends Component {

  render() {
    return (
      <GenericWidget icon="led-on"
        isOn={this.props.value > 0}
        value1={this.props.value === 0 ? 'Normal' : 'Fire detected'}
        {...this.props} />
      );
  }
}

export default SmokeSensorWidget
