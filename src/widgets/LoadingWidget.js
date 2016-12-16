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
    return (
      <div className="loadingMessage">{this.state.failed ? 'Offline ?' : 'Loading...'}</div>
    );
  }

}

export default LoadingWidget
