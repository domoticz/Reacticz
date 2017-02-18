import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import './LuxWidget.css';

class LuxWidget extends Component {

  render() {
      return (
      <GenericWidget class="LuxWidget" icon="brightness-4"
        isOn={this.props.lux > 0}
        value1={this.props.lux}
        {...this.props} />
      );
  }
}

export default LuxWidget
