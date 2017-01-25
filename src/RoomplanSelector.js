import React, { Component } from 'react';
import JSONClientSingleton from './util/JSONClientSingleton'

class RoomplanSelector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      names: [],
      idx: [],
      sceneIds: []
    };
    this.json = new JSONClientSingleton();
  }

  componentDidMount() {
    this.json.get({
      type: 'plans',
      order: 'name',
      used: 'true'
    }, (data) => {
      if (data.status !== "OK") {
        alert("Unable to get floor plans.");
        return;
      }
      if (!data.result) {
        return;
      }
      const names = [];
      const idx = [];
      for (let i = 0 ; i < data.result.length; i++) {
        names.push(data.result[i]['Name']);
        idx.push(data.result[i]['idx']);
      }
      this.setState({names: names, idx: idx});
    });
    this.json.getAllScenes((data) => {
      if (data.status !== "OK") {
        alert("Unable to get scenes status.");
        return;
      }
      const scenes = data.result;
      const sceneIds = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const fullId = (scene.Type === 'Group' ? 'g' : 's') + '|' + scene.idx;
        sceneIds.push(fullId);
      }
      this.setState({sceneIds: sceneIds});
    });
  }

  getUid(device) {
    if (device.type === 1) {
      const sceneId = 's|' + device.devidx;
      if (this.state.sceneIds.indexOf(sceneId) >= 0) {
        return sceneId;
      }
      const groupId = 'g|' + device.devidx;
      if (this.state.sceneIds.indexOf(groupId) >= 0) {
        return groupId;
      }
      alert('Unknown scene id: ' + device.devidx);
    }
    return 'd|' + device.devidx;
  }

  handleSelect = (event) => {
    if (event.target.value === "none") {
      return;
    }
    if (this.props.needConfirm &&
      !confirm('Replace current selection with the devices of this room ?')) {
      return;
    }
    // Force-reset layout.
    this.props.onWhitelistChange([]);
    const message = {
      type: 'command',
      param: 'getplandevices',
      idx: event.target.value
    };
    this.json.get(message, (data) => {
      const whitelist = [];
      if (data.result) {
        for (let i = 0 ; i < data.result.length; i++) {
          whitelist.push(this.getUid(data.result[i]));
        }
      }
      this.props.onWhitelistChange(whitelist);
    });
  }

  render() {
    const options = [];
    if (this.state.idx.length) {
      options.push(<option key='nofp' value='none'>select by room plan</option>);
      for (let i = 0; i < this.state.idx.length; i++) {
        const id = this.state.idx[i];
        options.push(
          <option key={'fp' + id} value={id}>{this.state.names[i]}</option>
        );
      };
    }
    return (
      <span>
        {options.length ? <span>, or <select value="none" onChange={this.handleSelect}>{options}</select></span> : ''}
      </span>
    );
  }

}

export default RoomplanSelector
