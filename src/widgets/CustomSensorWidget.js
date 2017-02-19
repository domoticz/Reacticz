import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';
import LoadingWidget from './LoadingWidget'

class CustomSensorWidget extends Component {

  render() {
    if (!this.props.deviceSpec) {
      return <LoadingWidget />
    }
    return (
      <GenericWidget icon="information-variant"
          isOn={Number(this.props.value) > 0}
          value1={[this.props.value, " ", this.props.deviceSpec['SensorUnit']]}
          {...this.props} />
    );
  }

}

export default CustomSensorWidget
