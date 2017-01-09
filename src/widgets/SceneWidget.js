import React, { Component } from 'react';
import SwitchOnOff from './SwitchOnOff'
import '../App.css';

class SceneWidget extends Component {

  render() {
    const scene = this.props.scene;
    switch (scene.Type) {
      case "Group" :
      case "Scene" :
        return <SwitchOnOff isScene="true" idx={scene.idx} label={scene.Name}
            valueText={scene.Status} readOnly={this.props.readOnly}
            onChange={this.props.onSceneChange} pushButton={scene.Type === "Scene"}/>;
       default:
         break;
    }
    return <div><h3>Unsupported type: {scene.Type}</h3><pre>{JSON.stringify(scene)}</pre></div>;
  }

}

export default SceneWidget
