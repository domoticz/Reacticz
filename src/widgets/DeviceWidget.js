import React, { Component } from 'react';
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import './DeviceWidget.css';

class DeviceWidget extends Component {

  render() {
    const device = this.props.device;
    switch (device.switchType) {
      case "On/Off" :
        return <SwitchOnOff idx={device.idx} label={device.name} value={device.nvalue}></SwitchOnOff>;
      case "Blinds" :
        return <SwitchBlinds idx={device.idx} label={device.name} value={device.nvalue}></SwitchBlinds>;
      case "Dimmer" :
        if (device.stype === "RGBW") {
          return <SwitchRGBW idx={device.idx} label={device.name} value={device.nvalue}></SwitchRGBW>;
        }
        return <SwitchDimmer idx={device.idx} label={device.name} value={device.svalue1}></SwitchDimmer>
      default:
        return <div><h3>Unsupported type: {device.switchType}</h3><pre>{JSON.stringify(device)}</pre></div>;
    }
  }

}

export default DeviceWidget
