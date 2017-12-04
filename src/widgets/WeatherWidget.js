/*
svalue1 = temp
svalue2 = humidity
svalue3 = hum stat (0=Normal, 1=Comfortable, 2=Dry, 3=Wet)
svalue4 = baro hPa
svalue5 = forecast (0 = No info, 1 = Sunny, 2 = Partly cloudy, 3 = Cloudy, 4 = Rain)
*/

import React, { Component } from 'react';

import './WeatherWidget.css';

class WeatherWidget extends Component {

  getProperties() {
    const device = this.props.device;
    const temp = Number(device.svalue1).toFixed(1);
    switch (device.dtype) {
      case "Temp + Humidity + Baro" :
        return { temp: temp, hum: device.svalue2, baro: this.props.hidePressure ? undefined : device.svalue4, forecast: device.svalue5 };
      default:}
  }

  render() {
    const params = this.getProperties();
    const theme = this.props.theme;
    const style = theme ? {
      background: this.props.readOnly ? theme.unlockedBackground : theme.background,
      color: theme.text
    } : {};
    return (
      <div className="WeatherWidget" style={style}>
        {params.forecast !== undefined && this.props.layoutWidth > 1 && <div className={'weatherImage weather' + params.forecast}></div>}
        <div className={'weatherData'}>
          <div className="name">{this.props.device.name}</div>
          {params.temp !== undefined && <div className="temp">{params.temp}</div>}
          {params.baro !== undefined && <div className="baro">{params.baro}</div>}
          {params.hum !== undefined && <div className="hum">{params.hum}</div>}
        </div>
      </div>
    );
  }

}

export default WeatherWidget
