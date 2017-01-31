import React, { Component } from 'react';
import GenericWidget from './GenericWidget';
import './WindWidget.css';

class WindWidget extends Component {

  render() {
    return (
      <GenericWidget class="WindWidget" icon="wind"
          isOn={Number(this.props.value) > 0}
          value1={this.props.direction}
          value2={Number((this.props.speed/10)*3.6).toFixed(1)}
          {...this.props} />
    );
  }

}

export default WindWidget
