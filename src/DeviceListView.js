import React, { Component } from 'react';
import JSONClientSingleton from './util/JSONClientSingleton'

import './DeviceListView.css';

class DeviceListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: {}
    };
    this.json = new JSONClientSingleton();
  }

  handleListChange = (event) => {
    const checkboxEl = event.target;
    if (checkboxEl.checked && this.props.idxWhitelist.indexOf(checkboxEl.value) < 0) {
      // Add device
      this.props.onWhitelistChange(this.props.idxWhitelist.concat([checkboxEl.value]));
    } else {
      // Remove device
      const result = this.props.idxWhitelist.slice(0);
      result.splice(this.props.idxWhitelist.indexOf(checkboxEl.value), 1);
      this.props.onWhitelistChange(result);
    }
  }

  componentDidMount() {
    this.json.getAllDevices((data) => {
      const devices = {};
      for (let i = 0 ; i < data.result.length; i++) {
        const deviceType = data.result[i]['Type'];
        if (!devices[deviceType]) {
          devices[deviceType] = [];
        }
        devices[deviceType].push(data.result[i]);
      }
      this.setState({devices: devices});
    });
  }

  getUid(device) {
    switch(device.Type) {
      case 'Scene':
        return 's|' + device.idx;
      case 'Group':
        return 'g|' + device.idx;
      default:
        return 'd|' + device.idx;
    }
  }

  renderDeviceTypeSection(type) {
    const devices = this.state.devices[type];
    const list = devices.map(function(device) {
      const id = this.getUid(device);
      return (
        <li key={id}><label>{device.Name}<input type="checkbox" value={id} onChange={this.handleListChange} checked={this.props.idxWhitelist.indexOf(id) >= 0}/></label></li>
      );
    }, this);
    return (
      <section key={type}>
        <h2>{type}</h2>
        <ul>{list}</ul>
      </section>
    )
  }

  render() {
    const sections = [];
    for (const type in this.state.devices) {
      if ({}.hasOwnProperty.call(this.state.devices, type)) {
        sections.push(this.renderDeviceTypeSection(type));
      }
    };

    return (
      <div className="DeviceListView">
        <span>Tick the devices to show in the dashboard</span>
        {sections}
      </div>
    );
  }
}

export default DeviceListView;
