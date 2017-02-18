import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import './PercentWidget.css';

class PercentWidget extends Component {

  constructor(props) {
    super(props);
    this.radius = 70;
  }

  render() {
    const dashArray = Math.PI * this.radius * 2;
    const dashOffset = ((100 - Number(this.props.value)) / 100) * Math.PI *
       (this.radius * 2);
    const theme = this.props.theme;
    const circleStyle = theme ? {
      stroke: theme.buttonOff,
      strokeDasharray: dashArray
    } : {};
    const barStyle = theme ? {
      stroke: theme.buttonOn,
      strokeDasharray: dashArray,
      strokeDashoffset: dashOffset
    } : {};
    return (
      <GenericWidget class='PercentWidget'
          value1={Number(this.props.value).toFixed(0)}
          {...this.props}>
        <svg className="doughnut" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle style={circleStyle} r={this.radius} cx="100" cy="100"></circle>
          <circle className="bar" style={barStyle} r={this.radius} cx="100" cy="100"></circle>
        </svg>
      </GenericWidget>
    );
  }

}

export default PercentWidget
