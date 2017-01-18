import React, { Component } from 'react';
import './AlertWidget.css';

class AlertWidget extends Component {

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      backgroundColor: theme.background,
      color: theme.text
    } : {};
    return (
      <div className="AlertWidget" style={style}>
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
