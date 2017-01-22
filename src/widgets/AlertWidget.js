import React, { Component } from 'react';
import './AlertWidget.css';
import './TextWidget.css';

class AlertWidget extends Component {

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: this.props.readOnly ? '' : theme.background,
      color: theme.text
    } : {};
    return (
      <div className="TextWidget AlertWidget" style={style}>
        <svg className={'level' + this.props.level}><use xlinkHref='#warning' /></svg>
        <section>
          <div>{this.props.label}</div>
          <h2>{this.props.value}</h2>
        </section>
      </div>
    );
  }

}

export default AlertWidget
