import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import './WindWidget.css';

class WindWidget extends Component {

  render() {
    return (
      <GenericWidget class="WindWidget"
          isOn={this.props.speed > 0}
          value1={this.props.direction}
          value2={Number((this.props.speed / 10) * 3.6).toFixed(1)}
          {...this.props}>
        <svg style={{transform:'rotateZ(' + this.props.bearing +'deg)' }}>
          <use xlinkHref="#navigation"/>
        </svg>
      </GenericWidget>
    );
  }

}

export default WindWidget
