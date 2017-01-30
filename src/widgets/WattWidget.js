import React, { Component } from 'react';
import GenericWidget from './GenericWidget';
import './WattWidget.css';

class WattWidget extends Component {

  render() {
    return (
      <GenericWidget class="WattWidget" icon="power"
          isOn={Number(this.props.powerValue) > 0 }
          value1={Number(this.props.powerValue).toFixed(1)}
          value2={Number(this.props.energyValue/1000).toFixed(3)}
          {...this.props} />
    );
  }

}

export default WattWidget
