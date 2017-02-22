import React, { Component } from 'react';
import './LoadingWidget.css';
import '../App.css';

class LoadingWidget extends Component {

  constructor(props) {
    super(props);
    this.state = {
      failed: false,
      timeout: null
    }
  }

  componentWillMount() {
    this.setState({ timeout:
        window.setTimeout(() => this.setState({failed: true}), 5000) });
  }

  componentWillUnmount() {
    window.clearTimeout(this.state.timeout);
  }

  render() {
    const theme = this.props.theme;
    const style = theme ? {
      background: this.props.readOnly ? theme.unlockedBackground : theme.background,
      color: theme.text
    } : {};
    return (
      <div className="LoadingWidget" style={style}>
        {this.state.failed ? 'Offline ?' : 'Loading...'}
        {this.state.failed && <button
            onClick={this.props.onRemove}>Remove</button>}
      </div>
    );
  }

}

export default LoadingWidget
