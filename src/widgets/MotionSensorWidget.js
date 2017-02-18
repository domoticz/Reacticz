import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';

class MotionSensorWidget extends Component {

  render() {
    return (
      <GenericWidget icon="run-fast"
        isOn={this.props.value > 0}
        value1={this.props.value === 0 ? 'No motion' : 'Motion'}
        {...this.props} />
      );
  }
}

export default MotionSensorWidget
