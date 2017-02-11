import React, { Component } from 'react';
import AlertWidget from './AlertWidget'
import ContactWidget from './ContactWidget'
import GasWidget from './GasWidget'
import LuxWidget from './LuxWidget'
import MediaPlayer from './MediaPlayer'
import MeterWidget from './MeterWidget'
import MotionSensorWidget from './MotionSensorWidget'
import PercentWidget from './PercentWidget'
import RainWidget from './RainWidget'
import SwitchOnOff from './SwitchOnOff'
import SwitchBlinds from './SwitchBlinds'
import SwitchDimmer from './SwitchDimmer'
import SwitchRGBW from './SwitchRGBW'
import SwitchSelector from './SwitchSelector'
import TemperatureWidget from './TemperatureWidget'
import TextWidget from './TextWidget'
import ThermostatWidget from './ThermostatWidget'
import WattWidget from './WattWidget'
import WeatherInfoWidget from './WeatherInfoWidget'
import WeatherWidget from './WeatherWidget'
import WindWidget from './WindWidget'
import './DeviceWidget.css';
import '../App.css';

class DeviceWidget extends Component {

  componentWillMount() {
    // Request device specs for widgets that need it.
    if (this.props.deviceSpec) {
      return;
    }
    switch (this.props.device.switchType) {
      case 'Selector' :
        this.props.requestDeviceSpec();
        break;
      case 'Dimmer' :
        if (this.props.device.stype !== 'RGBW') {
          this.props.requestDeviceSpec();
        }
        break;
      default :
        break;
    }
  }

  render() {
    const device = this.props.device;
    switch (device.switchType) {
      case 'Blinds' :
      case 'Blinds Inverted' :
      case 'Venetian Blinds EU' :
      case 'Venetian Blinds US' :
        return <SwitchBlinds idx={device.idx} label={device.name}
            value={device.nvalue} type={device.switchType} {...this.props} />;
      case 'Contact' :
        return <ContactWidget label={device.name} value={device.svalue1}
            {...this.props} />
      case 'Dimmer' :
        if (device.stype === 'RGBW') {
          return <SwitchRGBW idx={device.idx} label={device.name}
              value={device.nvalue} {...this.props} />;
        }
        return <SwitchDimmer idx={device.idx} label={device.name}
            device={device}
            value={device.nvalue === 0 ? 0 : device.svalue1} {...this.props} />;
      case 'Media Player' :
        return <MediaPlayer idx={device.idx} label={device.name}
            value={device.nvalue}
            playing={device.svalue1}
            {...this.props} />;
      case 'Motion Sensor' :
        return <MotionSensorWidget label={device.name} value={Number(device.nvalue)}
            {...this.props} />
      case 'On/Off' :
        return <SwitchOnOff idx={device.idx} label={device.name}
            value={device.nvalue} {...this.props} />;
      case 'Push Off Button' :
        return <SwitchOnOff idx={device.idx} label={device.name}
            pushOff={true} value={device.nvalue} {...this.props} />
      case 'Push On Button' :
        return <SwitchOnOff idx={device.idx} label={device.name}
            pushOn={true} value={device.nvalue} {...this.props} />
      case 'Selector' :
        return <SwitchSelector idx={device.idx} label={device.name}
            value={device.svalue1}
            levels={device.LevelNames.split('|')}
            useButtons={device.SelectorStyle === '0'}
            {...this.props} />;
      default :
        break;
    }
    switch (device.dtype) {
      case 'General' :
        switch (device.stype) {
          case 'Alert' :
            return <AlertWidget label={device.name} value={device.svalue1}
                level={device.nvalue} {...this.props} />
          case 'kWh' :
            return <WattWidget label={device.name} powerValue={device.svalue1}
                energyValue={device.svalue2} {...this.props} />
          case 'Percentage' :
            return <PercentWidget label={device.name} value={device.svalue1}
                {...this.props} />
          case 'Solar Radiation' :
            return <WeatherInfoWidget label={device.name} radiation={Number(device.svalue1)}
                {...this.props} />
          case 'Text' :
            return <TextWidget label={device.name} value={device.svalue1}
                {...this.props} />
          case 'Visibility' :
            return <WeatherInfoWidget label={device.name} visibility={Number(device.svalue1)}
                {...this.props} />
          default :
            break;
        }
        break;
      case 'Heating' :
      case 'Thermostat' :
        return <ThermostatWidget idx={device.idx} label={device.name}
            value={device.svalue1} {...this.props} />
      case 'P1 Smart Meter' :
        switch (device.stype) {
          case 'Energy' :
            return <WattWidget label={device.name} powerValue={device.svalue5}
                prodValue={device.svalue6}
                {...this.props} />
          case 'Gas' :
            return <GasWidget label={device.name} usage={device.svalue1}
                {...this.props} />
          default :
            break;
        }
        break;
      case 'Humidity' :
        return <TemperatureWidget label={device.name}
            humonly={Number(device.nvalue)}
            humstat={Number(device.svalue1)}
            {...this.props} />
      case 'Lux' :
        return <LuxWidget label={device.name}
            lux={Number(device.svalue1)}
            {...this.props} />
      case 'Rain' :
        return <RainWidget label={device.name}
            rain={Number(device.svalue2).toFixed(1)}
            rate={Number(device.svalue1 / 100 ).toFixed(1)}
            {...this.props} />
      case 'RFXMeter' :
        let unit, value = Number(device.svalue1);
        switch (device.meterType) {
          case 'Gas' :
            return <GasWidget label={device.name} usage={device.svalue1}
                {...this.props} />
          case 'Counter':
            unit = device.ValueUnits;
            break;
          case 'Energy' :
          case 'Energy Generated' :
            value /= 1000;
            unit = 'kWh';
            break;
          case 'Water' :
            value /= 1000;
            unit = 'm3';
            break;
          case 'Unknown':
          default :
            break;
        }
        return <MeterWidget label={device.name} value={value} unit={unit}
            {...this.props} />
      case 'Temp' :
        return <TemperatureWidget label={device.name}
            temp={Number(device.svalue1).toFixed(1)}
            {...this.props} />
      case 'Temp + Humidity' :
        return <TemperatureWidget label={device.name}
            temp={Number(device.svalue1).toFixed(1)}
            hum={Number(device.svalue2)}
            {...this.props} />
      case 'Temp + Humidity + Baro' :
        return <WeatherWidget hidePressure='true' {...this.props} />;
      case 'Usage' :
        switch (device.stype) {
          case 'Electric' :
            return <WattWidget label={device.name} powerValue={device.svalue1}
                {...this.props} />
          default :
            break;
        }
        break;
      case 'UV' :
        return <WeatherInfoWidget label={device.name}
            uv={Number(device.svalue1)}
            {...this.props} />
      case 'Wind' :
        return <WindWidget idx={device.idx} label={device.name}
            bearing={Number(device.svalue1)}
            direction={device.svalue2}
            speed={Number(device.svalue3)}
            {...this.props} />
      default :
        break;
    }
    return <div className="Unsupported">
        <h2>Unsupported type: {device.switchType || device.stype}</h2>
        <textarea defaultValue={JSON.stringify(device)}></textarea></div>;
  }

}

export default DeviceWidget
