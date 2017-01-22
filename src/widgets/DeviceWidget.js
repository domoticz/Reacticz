import React, { Component } from 'react';
import AlertWidget from './AlertWidget'
import PercentWidget from './PercentWidget'
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import SwitchSelector from './SwitchSelector'
import TextWidget from './TextWidget'
import ThermostatWidget from './ThermostatWidget'
import WeatherWidget from './WeatherWidget'
import './DeviceWidget.css';
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
            value={device.nvalue} {...this.props} />;
      case "Blinds" :
      case "Blinds Inverted" :
        return <SwitchBlinds idx={device.idx} label={device.name}
            value={device.nvalue}
            inverted={device.switchType==="Blinds Inverted"} {...this.props} />;
      case "Dimmer" :
        if (device.stype === "RGBW") {
          return <SwitchRGBW idx={device.idx} label={device.name}
              value={device.nvalue} {...this.props} />;
        }
        return <SwitchDimmer idx={device.idx} label={device.name}
            device={device}
            value={device.svalue1} {...this.props} />;
      case "Selector" :
        return <SwitchSelector idx={device.idx} label={device.name}
            value={device.svalue1}
            levels={device.LevelNames.split('|')}
            useButtons={device.SelectorStyle === "0"}
            {...this.props} />;
      default:
        break;
    }
    switch (device.dtype) {
      case "Temp" :
      case "Temp + Humidity" :
      case "Temp + Humidity + Baro" :
        return <WeatherWidget hidePressure="true" {...this.props} />;
      case "Thermostat" :
      case "Heating" :
        return <ThermostatWidget idx={device.idx} label={device.name}
            value={device.svalue1} {...this.props} />
      case "General" :
        switch (device.stype) {
          case "Alert" :
            return <AlertWidget idx={device.idx} label={device.name}
                value={device.svalue1} level={device.nvalue} {...this.props} />
          case "Percentage" :
            return <PercentWidget idx={device.idx} label={device.name}
                value={device.svalue1} {...this.props} />
          case "Text" :
            return <TextWidget idx={device.idx} label={device.name}
                value={device.svalue1} {...this.props} />
          default:
            break;
        }
        break;
      default:
        break;
    }
    return <div className="Unsupported"><h2>Unsupported type: {device.switchType || device.stype}</h2><textarea defaultValue={JSON.stringify(device)}></textarea></div>;
  }

}

export default DeviceWidget
