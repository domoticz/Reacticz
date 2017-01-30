import React, { Component } from 'react';
import GenericWidget from './GenericWidget';
import './AlertWidget.css';

class AlertWidget extends Component {

  render() {
    return (
      <GenericWidget class={'AlertWidget level' + this.props.level} icon="warning"
          value1={this.props.value} {...this.props} />
    );
  }

}

export default AlertWidget
