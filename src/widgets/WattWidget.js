import React, { Component } from 'react';
import './WattWidget.css';
import './TextWidget.css';

class WattWidget extends Component {

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text,
      fill: Number(this.props.powerValue) > 0 ?
          theme.buttonOn : theme.buttonOff
    } : {};
    return (
      <div className="TextWidget WattWidget" style={style}>
        <svg><use xlinkHref='#power' /></svg>
        <section>
          <div>{this.props.label}</div>
          <h2 className="watt">{Number(this.props.powerValue).toFixed(1)}</h2>
          {this.props.energyValue &&
              <div className="kwh">{Number(this.props.energyValue).toFixed(1)}
              </div>}
        </section>
      </div>
    );
  }

}

export default WattWidget
