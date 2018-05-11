import React from 'react';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { now: parseInt(Date.now() / 1000, 10) }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  numberize(value, label) {
    if (value === 1)
      return `${value} ${label} `;
    return `${value} ${label}s `;
  }

  tick() {
    this.setState({ now: parseInt(Date.now() / 1000, 10) });
  }

  render() {
    let remainingSeconds = this.props.startTime - this.state.now;
    if (remainingSeconds <= 0) {
      clearInterval(this.timerID);
      return (
        <div className="countdown">
          Hacking will begin soon...<br />
          Please refresh, lightly.
        </div>
      )
    }

    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const days = parseInt(remainingSeconds / secondsInDay, 10);
    remainingSeconds -= days * secondsInDay;
    const hours = parseInt(remainingSeconds / secondsInHour, 10);
    remainingSeconds -= hours * secondsInHour;
    const minutes = parseInt(remainingSeconds / secondsInMinute, 10);
    remainingSeconds -= minutes * secondsInMinute;

    return (
      <div className="countdown">
        {this.numberize(days, 'Day')}
        {this.numberize(hours, 'Hour')}
        {this.numberize(minutes, 'Minute')}
        {this.numberize(remainingSeconds, 'Second')}
      </div>
    );
  }
}
export default Counter;
