import React, { Component } from 'react';
import GenericWidget from './GenericWidget';
import './WeatherInfoWidget.css';

class WeatherInfoWidget extends Component {

  render() {
    if (this.props.visibility !== undefined) {
      return (
      <GenericWidget class="WeatherInfoWidget" icon="eye"
        isOn={this.props.visibility > 0}
        value1={<div className="visibility">{this.props.visibility}</div>}
        {...this.props} />
      );
    }
    if (this.props.radiation !== undefined) {
      return (
      <GenericWidget class="WeatherInfoWidget" icon="weather-sunny"
        isOn={this.props.radiation > 0}
        value1={<div className="radiation">{this.props.radiation}</div>}
        {...this.props} />
      );
    }
      return (
      <GenericWidget class="WeatherInfoWidget" icon="sunglasses"
        isOn={this.props.uv > 0}
        value1={<div className="uv">{this.props.uv}</div>}
        {...this.props} />
      );
  }
}

export default WeatherInfoWidget
