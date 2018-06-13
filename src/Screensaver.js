import React, { Component } from 'react';
import Clock from 'react-clock';

import './Screensaver.css';

const MONITORED_EVENTS = ["touchstart", "touchmove", "mousedown", "mousemove", "click"];
const DEBOUNCE_DELAY_MS = 350;

export const TYPE = {
  CLOCK: "clock",
  BLANK: "blank"
};

class Screensaver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      activityTimeoutId: null,
      date: new Date(),
      dateIntervalId: null,
      debounceTimeoutId: null,
      size: Math.min(window.innerHeight, window.innerWidth) * .6
    }
    this.unmounted = false;
  }

  stopTimer = () => {
    window.clearTimeout(this.state.activityTimeoutId);
  }

  restartTimer = () => {
    this.stopTimer();
    if (this.props.delay) {
      this.setState({activityTimeoutId: window.setTimeout(this.show, this.props.delay * 1000)});
    }
  }

  componentWillMount() {
    for (let i in MONITORED_EVENTS) {
      window.addEventListener(MONITORED_EVENTS[i], this.onMove, { passive: false });
    }
    this.setState({dateIntervalId: window.setInterval(() => this.setState({ date: new Date() }), 1000)});
    this.restartTimer();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopTimer();
    window.clearTimeout(this.state.debounceTimeoutId);
    window.clearInterval(this.state.dateIntervalId);
    for (let i in MONITORED_EVENTS) {
      window.removeEventListener(MONITORED_EVENTS[i], this.onMove, { passive: false });
    }
  }

  show = () => {
    this.setState({visible: true});
  }

  onMove = (event) => {
    if (this.state.visible) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.stopTimer();
    this.setState({debounceTimeoutId: window.setTimeout(() => {
      if (this.unmounted) {
        return;
      }
      this.restartTimer();
      this.setState({visible: false});
    }, DEBOUNCE_DELAY_MS)});
  }

  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <div className="Screensaver" style={{backgroundColor: this.props.type === TYPE.CLOCK ? this.props.theme.appBackground : ''}}>
        {this.props.type === TYPE.CLOCK && <Clock className="Clock"
            value={this.state.date} 
            size={this.state.size} 
            hourHandLength={60}
            hourHandOppositeLength={20}
            hourHandWidth={8}
            hourMarksLength={20}
            hourMarksWidth={8}
            minuteHandLength={90}
            minuteHandOppositeLength={20}
            minuteHandWidth={6}
            minuteMarksLength={6}
            minuteMarksWidth={3}
            secondHandLength={75}
            secondHandOppositeLength={25}
            secondHandWidth={3}
          />}
      </div>
    );
  }

}

export default Screensaver
