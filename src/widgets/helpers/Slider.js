import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Slider.css';

const HORIZONTAL_THRESHOLD_RAD = 0.8;

class Slider extends Component {

  constructor(props) {
    super(props);
    this.state = {
      throttleTimeoutId: null,
      touchStartData: null,
      fadeTimeoutId: null,
      showBar: false,
      value: this.props.value
    }
    this.touchTarget = null;
  }

  componentDidMount = () => {
    this.touchTarget = ReactDOM.findDOMNode(this);
  }

  updateValue = (value) => {
    this.setState({showBar: true});
    this.setState({value: value});
    if (this.props.throttle) {
      global.clearTimeout(this.state.throttleTimeoutId);
      this.setState({
        throttleTimeoutId: global.setTimeout(
            this.emitChange, this.props.throttle)});
    } else {
      this.emitChange(value);
    }
    global.clearTimeout(this.state.fadeTimeoutId);
    this.setState({fadeTimeoutId: global.setTimeout(this.fadeBar, 1000)});
  }

  emitChange = (opt_value) => {
    this.props.onChange(
        opt_value !== undefined ? opt_value : this.state.value);
  }

  onTouchStart = (event) => {
    if (this.props.disabled) {
      return;
    }
    this.setState({touchStartData: {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
      rect: this.touchTarget.getBoundingClientRect()
    }});
  }

  onTouchMove = (event) => {
    if (this.props.disabled) {
      return;
    }
    const touch = event.changedTouches[0];
    const angle = Math.atan2(
        touch.pageY - this.state.touchStartData.y,
        touch.pageX - this.state.touchStartData.x);
    const isVertical =
        (Math.abs(Math.abs(angle) - Math.PI / 2)) <= HORIZONTAL_THRESHOLD_RAD;
    if (isVertical) {
      return;
    }
    const pct = (touch.pageX - this.state.touchStartData.rect.left) /
        this.state.touchStartData.rect.width;
    // Clamp value in [0, 1].
    const targetValue = Math.min(1, Math.max(pct, 0));
    if (this.state.value !== targetValue) {
      this.updateValue(targetValue);
    }
  }

  onTouchEnd = () => {
    this.setState({touchStartData: null});
  }

  onClick = (event) => {
    if (this.props.disabled) {
      return;
    }
    const rect = this.touchTarget.getBoundingClientRect();
    let value = (event.pageX - rect.left) / rect.width;
    // Make slightly larger touch target for value 1 (it's hard to hit the
    // edge). Border tolerance can be anywhing between zero and 1 (in which case
    // the slider basically becomes a toggle).
    const edgeTolerance = this.props.edgeTolerance !== undefined ?
        this.props.edgeTolerance / 2 : 0.06;
    if (value >= 1 - edgeTolerance) {
      value = 1;
    }
    this.updateValue(value);
  }

  fadeBar = () => {
    this.setState({showBar: false});
  }

  render() {
    const valuePct = this.state.value * 100;
    return (
      <div className="Slider" onClick={this.onClick}
            onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd}>
        <div className="bar"
            style={{
              transform: 'translateX(' + valuePct + '%)',
              transition: this.state.touchStartData ? 'none' : undefined,
              opacity: this.state.showBar ? 1 : 0}}>
        </div>
      </div>
    );
  }
}

export default Slider
