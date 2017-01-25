import React, { Component } from 'react';
import RoomplanSelector from './RoomplanSelector'
import JSONClientSingleton from './util/JSONClientSingleton'

import './DeviceListView.css';

class DeviceListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deviceTypes: [],
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
      console.log(result);
      this.props.onWhitelistChange(result);
    }
  }

  componentDidMount() {
    this.json.getAllDevices((data) => {
      const devices = {};
      const deviceTypes = [];
      for (let i = 0 ; i < data.result.length; i++) {
        const deviceType = data.result[i]['Type'];
        if (!devices[deviceType]) {
          devices[deviceType] = [];
          deviceTypes.push(deviceType);
        }
        devices[deviceType].push(data.result[i]);
      }
      this.setState({deviceTypes: deviceTypes.sort(), devices: devices});
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
    const list = devices.sort((a, b) => b.Name >= a.Name ? -1 : 1).map(
        function(device) {
          const id = this.getUid(device);
          return (
            <li key={id}><label><input type="checkbox" value={id} onChange={this.handleListChange} checked={this.props.idxWhitelist.indexOf(id) >= 0}/>{device.Name}</label></li>
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
    for (let i = 0; i < this.state.deviceTypes.length; i++) {
      sections.push(this.renderDeviceTypeSection(this.state.deviceTypes[i]));
    };

    return (
      <div className="DeviceListView">
        <span>Tick the devices to show in the dashboard</span>
        <RoomplanSelector needConfirm={this.props.idxWhitelist.length > 0}
            onWhitelistChange={this.props.onWhitelistChange}/>
        {sections}
      </div>
    );
  }
}

export default DeviceListView;
