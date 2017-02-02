import React, { Component } from 'react';
import GenericWidget from './GenericWidget';
import './WattWidget.css';

class WattWidget extends Component {

  render() {
    let prod = this.props.prodValue !== undefined;
    return (
      <GenericWidget class={'WattWidget' + (prod ? ' withProd' : '')}
          icon="power"
          isOn={Number(this.props.powerValue) > 0 }
          value1={Number(this.props.powerValue).toFixed(1)}
          value2={prod ?
            Number(this.props.prodValue).toFixed(1) :
            Number(this.props.energyValue/1000).toFixed(3)}
          {...this.props} />
    );
  }

}

export default WattWidget
