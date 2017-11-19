import React, { Component } from 'react';
import sanitizeHtml from 'sanitize-html';
import './GenericWidget.css';

class GenericWidget extends Component {

  sanitize(htmlString) {
    console.log(sanitizeHtml.defaults.allowedTags.concat([ 'img' ]));
    return {__html: sanitizeHtml(htmlString, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])})};
  }

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      background: this.props.readOnly ?
          theme.unlockedBackground : theme.background,
      color: theme.text,
      fill: this.props.isOn === undefined ? '' :
          (this.props.isOn ? theme.buttonOn : theme.buttonOff)
    } : {};
    const safeValue1 = this.sanitize(this.props.value1);
    const safeValue2 = this.props.value2 === undefined ?
        null : this.sanitize(this.props.value2);
    return (
      <div className={'GenericWidget '+ this.props.class} style={style}>
        {this.props.icon && <svg><use xlinkHref={'#' + this.props.icon}/></svg>}
        {this.props.children}
        <section>
          <div>{this.props.label}</div>
          <h2 className="value1" dangerouslySetInnerHTML={safeValue1}></h2>
          {safeValue2 && <div className="value2"
              dangerouslySetInnerHTML={safeValue2}></div>}
        </section>
      </div>
    );
  }

}

export default GenericWidget
