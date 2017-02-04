import React, { Component } from 'react';
import GenericWidget from './GenericWidget';

class MeterWidget extends Component {

  render() {
    return (
      <GenericWidget class="MeterWidget" icon="equalizer"
          isOn={Number(this.props.value) > 0 }
          value1={this.props.value +
              (this.props.unit ? ' ' + this.props.unit : '')}
          {...this.props} />
    );
  }

}

export default MeterWidget
