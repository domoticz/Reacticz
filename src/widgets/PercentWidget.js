//{"Battery":255,"RSSI":12,"description":"","dtype":"General","id":"0000044D","idx":14,"name":"CPU_Usage","nvalue":0,"stype":"Percentage","svalue1":"16.56","unit":1}


import React, { Component } from 'react';
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
    const style = theme ? {
      backgroundColor: theme.background,
      color: theme.text
    } : {};
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
      <div className="PercentWidget" style={style}>
        <svg className="doughnut" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle style={circleStyle} r={this.radius} cx="100" cy="100"></circle>
          <circle className="bar" style={barStyle} r={this.radius} cx="100" cy="100"></circle>
        </svg>
        <section>
          <div>{this.props.label}</div>
          <h2>{Number(this.props.value).toFixed(0)}</h2>
        </section>
      </div>
    );
  }

}

export default PercentWidget
