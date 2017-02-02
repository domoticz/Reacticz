import React, { Component } from 'react';
import './GenericWidget.css';

class GenericWidget extends Component {

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text,
      fill: this.props.isOn === undefined ? '' :
          (this.props.isOn ? theme.buttonOn : theme.buttonOff)
    } : {};
    return (
      <div className={'GenericWidget '+ this.props.class} style={style}>
        {this.props.icon && <svg><use xlinkHref={'#' + this.props.icon}/></svg>}
        {this.props.children}
        <section>
          <div>{this.props.label}</div>
          <h2>{this.props.value1}</h2>
          {this.props.value2 !== undefined &&
              <div className="value2">{this.props.value2}</div>}
        </section>
      </div>
    );
  }

}

export default GenericWidget
