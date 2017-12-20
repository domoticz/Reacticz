import React from 'react';
import SwitchOnOff from './SwitchOnOff';
import './SwitchLock.css';
import './SwitchOnOff.css';

class SwitchLock extends SwitchOnOff {

  render() {
    const valueText = this.props.value === 0 ? 'Unlocked' : 'Locked';
    const iconId = this.props.value === 0 ? 'exit-to-app' : 'lock-outline';
    return (
      <button className="switch SwitchLock" style={this.getButtonStyle(true)} onClick={this.handleClick} title={valueText}>
      	{this.props.layoutWidth > 1 &&
      		<svg className="lockicon"><use xlinkHref={'#' + iconId}/></svg>}
		<div>{this.props.label}</div>
      </button>
    );
  }

}

export default SwitchLock
