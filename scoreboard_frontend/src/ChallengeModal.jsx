import PropTypes from 'prop-types';
import React from 'react';
import showdown from 'showdown';

class ChallengeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
      description: 'Loading...',
      flag: '',
      status: '',
    };
    this.countDown = null;
    this.hashTimestamp = null;
    this.timerID = null;
    this.worker = new Worker('worker.js');
    this.worker.onmessage = (message) => {
      if (message.data.complete) {
        this.submit(message.data.nonce);
      } else {
        this.setState({ ...this.state, status: `${this.state.status} .` });
      }
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.worker.terminate();
    if (this.timerID !== null) {
      clearInterval(this.timerID);
    }
  }

  handleFlagChange = (event) => {
    this.setState({ ...this.state, flag: event.target.value });
  }

  handleKeyPress = (event) => {
    if (!this.state.buttonDisabled && event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  handleSubmit = () => {
    let validation;
    if (this.state.flag.length < 1 || this.state.flag.length > 160) {
      validation = 'invalid flag';
    } else {
      this.hashTimestamp = parseInt(Date.now() / 1000, 10);
      this.setState({
        ...this.state,
        buttonDisabled: true,
        status: 'computing proof of work',
      });
      this.worker.postMessage({
        prefix: '0123',
        value: `${this.props.challengeId}!${this.state.flag}!${this.props.token}!${this.hashTimestamp}`,
      });
      return;
    }
    this.setState({ ...this.state, status: validation });
  }

  loadData = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/challenge/${this.props.challengeId}/${this.props.token}`, { method: 'GET' })
      .then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body, status }) => {
        if (status === 401) {
          this.props.onTokenExpired();
          console.log('Token expired. Please log in again');
          return;
        } else if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        const converter = new showdown.Converter({
          literalMidWordUnderscores: true,
          simplifiedAutoLink: true,
        });
        const description = converter.makeHtml(body.message);
        this.setState({ ...this.state, description });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  submit = (nonce) => {
    const requestData = {
      challenge_id: this.props.challengeId,
      flag: this.state.flag,
      nonce,
      timestamp: this.hashTimestamp,
      token: this.props.token,
    };
    this.setState({ ...this.state, status: 'submitting flag' });
    fetch(`${process.env.REACT_APP_BACKEND_URL}/submit`, {
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body, status }) => {
        if (status === 201) {
          this.props.onSolve();
        } else if (status === 401) {
          this.props.onTokenExpired();
          console.log('Token expired. Please log in again');
          return;
        } else if (status === 429) {
          this.countDown = Math.ceil(body.message.seconds) + 1;
          this.tick();
          this.timerID = setInterval(() => this.tick(), 1000);
          return;
        }
        this.setState({
          ...this.state,
          buttonDisabled: false,
          status: body.message,
        });
      })
      .catch((error) => {
        this.setState({ ...this.state, buttonDisabled: false, status: '(error) see console for info' });
        console.log(error);
      });
  }

  tick() {
    this.countDown -= 1;
    if (this.countDown <= 0) {
      clearInterval(this.timerID);
      this.countDown = null;
      this.timerID = null;
      this.setState({
        ...this.state,
        buttonDisabled: false,
        status: 'Okay, you may try again now.',
      });
      return;
    }
    const plural = this.countDown === 1 ? '' : 's';
    const status = `You are submitting too frequently. Try again in ${this.countDown} second${plural}.`;
    this.setState({
      ...this.state,
      status,
    });
  }

  render() {
    let status;
    const buttonText = this.state.buttonDisabled ? 'Please Wait' : 'Submit Flag';
    if (this.state.status !== '') {
      status = (<div className="wrapped">Status: {this.state.status}</div>);
    }

    let form = '';
    if (!this.props.solved) {
      form = (
        <div>
          <div className="form-group">
            <label htmlFor="flag">Flag<br />
              <input id="flag" onChange={this.handleFlagChange} onKeyPress={this.handleKeyPress} readOnly={this.state.buttonDisabled} type="text" value={this.state.flag} />
            </label>
          </div>
          <div className="form-group">
            <input className="button" disabled={this.state.buttonDisabled} onClick={this.handleSubmit} type="button" value={buttonText} />
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <button onClick={this.props.onClose}>X</button>
        <h1>{this.props.challengeTitle}</h1>
        <div dangerouslySetInnerHTML={{ __html: this.state.description }} />
        {form}
        {status}
      </div>
    );
  }
}
ChallengeModal.propTypes = {
  challengeId: PropTypes.string.isRequired,
  challengeTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSolve: PropTypes.func.isRequired,
  onTokenExpired: PropTypes.func.isRequired,
  solved: PropTypes.bool.isRequired,
  token: PropTypes.string.isRequired,
};
export default ChallengeModal;
