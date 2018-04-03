import React, { Component } from 'react';
import RoomplanSelector from './RoomplanSelector'
import JSONClientSingleton from './util/JSONClientSingleton'

import './DeviceListView.css';

class DeviceListView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deviceTypes: [],
      devices: {},
      filter: "",
      showUnused: false
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

  handleUnusedFilterChange = (event) => {
    const checkboxEl = event.target;
    this.setState({showUnused: checkboxEl && checkboxEl.checked});
  }

  handleNameChange = (event) => {
    const name = event.target.value;
    this.props.onNameChange(name);
  }

  handleFilterChange = (event) => {
    const filter = event.target.value;
    this.setState({filter: filter});
  }

  clearFilter = () => {
    this.setState({filter: ""});
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
      this.setState({deviceTypes: deviceTypes.sort(), devices: devices, name: this.props.name});
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
    let showSection = false;
    const list = devices.sort((a, b) => b.Name >= a.Name ? -1 : 1).map(
        function(device) {
          const id = this.getUid(device);
          if (escape(device.Name).toLowerCase().match(escape(this.state.filter).toLowerCase())) {
            if (!this.state.showUnused && device.Used === 0) {
              return null;
            }
            showSection = true;
            return (
              <li key={id} className={device.Used === 0 ? "unused" : ""}><label><input type="checkbox" value={id} onChange={this.handleListChange} checked={this.props.idxWhitelist.indexOf(id) >= 0}/>{device.Name}</label></li>
            );
          } else {
            return null;
          }
        }, this);
    if (!showSection) {
      return null;
    }
    return (
      <section key={type}>
        <h3>{type}</h3>
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
        <p><label>
          Dashboard name:&nbsp;
          <input type="text" value={this.props.name} name="name" placeholder="Name" onChange={this.handleNameChange} />
        </label></p>
        <span>Tick the devices to show in this dashboard</span>
        <RoomplanSelector needConfirm={this.props.idxWhitelist &&
            this.props.idxWhitelist.length > 0}
            onWhitelistChange={this.props.onWhitelistChange}/>
        <section className="searchbar">
          <div>
            <input type="text" value={this.state.filter} name="filter" placeholder="Search devices" onChange={this.handleFilterChange} /><button onClick={this.clearFilter}>Clear</button>
          </div>
          <div>
            <input type="checkbox" name="unused" id="unused" onChange={this.handleUnusedFilterChange} checked={this.state.showUnused}/><label htmlFor="unused">Show unused</label>
          </div>
        </section>
        {sections}
      </div>
    );
  }
}

export default DeviceListView;
