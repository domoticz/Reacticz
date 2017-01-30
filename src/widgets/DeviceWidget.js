import React, { Component } from 'react';
import AlertWidget from './AlertWidget'
import ContactWidget from './ContactWidget'
import MediaPlayer from './MediaPlayer'
import PercentWidget from './PercentWidget'
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import SwitchSelector from './SwitchSelector'
import TextWidget from './TextWidget'
import ThermostatWidget from './ThermostatWidget'
import WattWidget from './WattWidget'
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
      case "On/Off" :
        return <SwitchOnOff idx={device.idx} label={device.name}
            value={device.nvalue} {...this.props} />;
      case "Media Player" :
        return <MediaPlayer idx={device.idx} label={device.name}
            value={device.nvalue}
            playing={device.svalue1}
            {...this.props} />;
      case "Selector" :
        return <SwitchSelector idx={device.idx} label={device.name}
            value={device.svalue1}
            levels={device.LevelNames.split('|')}
            useButtons={device.SelectorStyle === "0"}
            {...this.props} />;
      case "Contact" :
        return <ContactWidget label={device.name} value={device.svalue1}
            {...this.props} />
      default:
        break;
    }
    switch (device.dtype) {
      case "General" :
        switch (device.stype) {
          case "Alert" :
            return <AlertWidget label={device.name} value={device.svalue1}
                level={device.nvalue} {...this.props} />
          case "Percentage" :
            return <PercentWidget label={device.name} value={device.svalue1}
                {...this.props} />
          case "Text" :
            return <TextWidget label={device.name} value={device.svalue1}
                {...this.props} />
          case "kWh" :
            return <WattWidget label={device.name} powerValue={device.svalue1}
                energyValue={device.svalue2} {...this.props} />
          default:
            break;
        }
        break;
      case "Heating" :
      case "Thermostat" :
        return <ThermostatWidget idx={device.idx} label={device.name}
            value={device.svalue1} {...this.props} />
      case "Temp" :
      case "Temp + Humidity" :
      case "Temp + Humidity + Baro" :
        return <WeatherWidget hidePressure="true" {...this.props} />;
      case "Usage" :
        switch (device.stype) {
          case "Electric" :
            return <WattWidget label={device.name} powerValue={device.svalue1}
                {...this.props} />
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
