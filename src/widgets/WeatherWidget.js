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
      case "Humidity" :
        return { humonly: device.nvalue, humstat: device.svalue1 };
      case "Temp" :
        return { temp: temp };
      case "Temp + Humidity" :
        return { temp: temp, hum: device.svalue2 };
      case "Temp + Humidity + Baro" :
        return { temp: temp, hum: device.svalue2, baro: this.props.hidePressure ? undefined : device.svalue4, forecast: device.svalue5 };
      default:}
  }

  render() {
    const params = this.getProperties();
    const theme = this.props.theme;
    const humidityStatus = ((params.humstat === "0") ? 'Normal' : (params.humstat === "1") ? 'Comfortable' : (params.humstat === "2") ? 'Dry' : 'Wet');
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text
    } : {};
    return (
      <div className="WeatherWidget">
        {params.forecast !== undefined && <div className={'weatherImage weather' + params.forecast}></div>}
        <div className={'weatherData'} style={style}>
          <div className="name">{this.props.device.name}</div>
          {params.temp !== undefined && <div className="temp">{params.temp}</div>}
          {params.baro !== undefined && <div className="baro">{params.baro}</div>}
          {params.hum !== undefined && <div className="hum">{params.hum}</div>}
          {params.humonly !== undefined && <div className="humonly">{params.humonly}</div>}
		      {params.humstat !== undefined && <div className="humstat">{humidityStatus}</div>}
        </div>
      </div>
    );
  }

}

export default WeatherWidget
