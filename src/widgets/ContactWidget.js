import React, { Component } from 'react';
import GenericWidget from './helpers/GenericWidget';

class ContactWidget extends Component {

  render() {
    return (
      <GenericWidget icon={this.props.value === 0 ? 'closed' : 'open' }
          isOn={Number(this.props.value) > 0}
          value1={this.props.value === 0 ? 'Closed' : 'Open'}
          {...this.props} />
    );
  }

}

export default ContactWidget
