import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import './WeatherInfoWidget.css';

class WeatherInfoWidget extends Component {

  render() {
    if (this.props.visibility !== undefined) {
      return (
      <GenericWidget class="WeatherInfoWidget" icon="eye"
        isOn={this.props.visibility > 0}
        value1={this.props.visibility}
        value1Class="visibility"
        {...this.props} />
      );
    }
    if (this.props.radiation !== undefined) {
      return (
      <GenericWidget class="WeatherInfoWidget" icon="weather-sunny"
        isOn={this.props.radiation > 0}
        value1={this.props.radiation}
        value1Class="radiation"
        {...this.props} />
      );
    }
    return (
    <GenericWidget class="WeatherInfoWidget" icon="sunglasses"
      isOn={this.props.uv > 0}
      value1={this.props.uv}
      value1Class="uv"
      {...this.props} />
    );
  }
}

export default WeatherInfoWidget
