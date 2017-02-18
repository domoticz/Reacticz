import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import './RainWidget.css';

class RainWidget extends Component {

  render() {
    return (
      <GenericWidget class="RainWidget" icon="weather-rainy"
          isOn={this.props.rain > 0}
          value1={this.props.rain}
          value2={this.props.rate}
          {...this.props} />
    );
  }

}

export default RainWidget
