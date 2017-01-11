import React, { Component } from 'react';
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import SwitchSelector from './SwitchSelector'
import ThermostatWidget from './ThermostatWidget'
import WeatherWidget from './WeatherWidget'
import '../App.css';

class DeviceWidget extends Component {

  componentWillMount() {
    // Request device specs for widgets that need it.
    if (this.props.deviceSpec) {
      return;
    }
    switch (this.props.device.switchType) {
      case "Selector":
        this.props.requestDeviceSpec();
        break;
      case "Dimmer":
        if (this.props.device.stype !== "RGBW") {
          this.props.requestDeviceSpec();
        }
        break;
      default:
        break;
    }
  }

  render() {
    const device = this.props.device;
    switch (device.switchType) {
      case "On/Off" :
        return <SwitchOnOff idx={device.idx} label={device.name}
            value={device.nvalue} readOnly={this.props.readOnly} />;
      case "Blinds" :
        return <SwitchBlinds idx={device.idx} label={device.name}
            value={device.nvalue} readOnly={this.props.readOnly} />;
      case "Dimmer" :
        if (device.stype === "RGBW") {
          return <SwitchRGBW idx={device.idx} label={device.name}
              value={device.nvalue} readOnly={this.props.readOnly} />;
        }
        return <SwitchDimmer idx={device.idx} label={device.name}
            device={device}
            deviceSpec={this.props.deviceSpec}
            value={device.svalue1} readOnly={this.props.readOnly} />;
      case "Selector" :
        return <SwitchSelector idx={device.idx} label={device.name}
            deviceSpec={this.props.deviceSpec}
            value={device.svalue1}
            levels={device.LevelNames.split('|')}
            useButtons={device.SelectorStyle === "0"}
            readOnly={this.props.readOnly} />;
      default:
        break;
    }
    switch (device.dtype) {
      case "Temp" :
      case "Temp + Humidity" :
      case "Temp + Humidity + Baro" :
        return <WeatherWidget device={device} hidePressure="true" />;
      case "Thermostat" :
      case "Heating" :
        return <ThermostatWidget idx={device.idx} label={device.name}
            value={device.svalue1} readOnly={this.props.readOnly} />
      default:
        break;
    }
    return <div><h3>Unsupported type: {device.switchType}</h3><pre>{JSON.stringify(device)}</pre></div>;
  }

}

export default DeviceWidget
