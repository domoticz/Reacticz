import React, { Component } from 'react';
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import WeatherWidget from './WeatherWidget'
import './DeviceWidget.css';
import '../App.css';

class DeviceWidget extends Component {

  render() {
    const device = this.props.device;
    switch (device.switchType) {
      case "On/Off" :
        return <SwitchOnOff idx={device.idx} label={device.name} value={device.nvalue} readOnly={this.props.readOnly}></SwitchOnOff>;
      case "Blinds" :
        return <SwitchBlinds idx={device.idx} label={device.name} value={device.nvalue} readOnly={this.props.readOnly}></SwitchBlinds>;
      case "Dimmer" :
        if (device.stype === "RGBW") {
          return <SwitchRGBW idx={device.idx} label={device.name} value={device.nvalue} readOnly={this.props.readOnly}></SwitchRGBW>;
        }
        return <SwitchDimmer idx={device.idx} label={device.name} value={device.svalue1} readOnly={this.props.readOnly}></SwitchDimmer>;
      default:
        break;
    }
    switch (device.dtype) {
      case "Temp" :
      case "Temp + Humidity" :
      case "Temp + Humidity + Baro" :
        return <WeatherWidget device={device} hidePressure="true" />;
      default:
        break;
    }
    return <div><h3>Unsupported type: {device.switchType}</h3><pre>{JSON.stringify(device)}</pre></div>;
  }

}

export default DeviceWidget
