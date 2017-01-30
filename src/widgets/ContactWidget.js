import React, { Component } from 'react';
import './WattWidget.css';
import './TextWidget.css';

class ContactWidget extends Component {

  render() {
    const theme = this.props.theme;
    const valueContact = (this.props.value === "0" ? 'Closed' : 'Open');
	const valueIcon = (this.props.value === "0" ? <svg><use xlinkHref='#closed' /></svg> : <svg><use xlinkHref='#open' /></svg>);
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text,
      fill: Number(this.props.value) > 0 ?
          theme.buttonOn : theme.buttonOff
    } : {};
    return (
      <div className="TextWidget WattWidget" style={style}>
        {valueIcon}
        <section>
          <div>{this.props.label}</div>
          <h2>{valueContact}</h2>
        </section>
      </div>
    );
  }

}

export default ContactWidget
