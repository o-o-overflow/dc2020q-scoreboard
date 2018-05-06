import PropTypes from 'prop-types';
import React from 'react';

const strip = text => text.replace(/^\s+|\s+$/g, '');

class LogIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
      email: '',
      password: '',
      status: '',
    };
    this.hashTimestamp = null;
    this.worker = new Worker('worker.js');
    this.worker.onmessage = (message) => {
      if (message.data.complete) {
        this.logIn(message.data.nonce);
      } else {
        this.setState({ ...this.state, status: `${this.state.status} .` });
      }
    };
  }

  handleEmailChange = (event) => {
    this.setState({ ...this.state, email: strip(event.target.value) });
  }

  handleKeyPress = (event) => {
    if (!this.state.buttonDisabled && event.key === 'Enter') {
      this.handleLogIn();
    }
  }

  handleLogIn = () => {
    let validation;
    if (this.state.email.length < 6 || this.state.email.length > 320
      || !this.state.email.includes('@') || !this.state.email.includes('.')) {
      validation = 'invalid email';
    } else if (this.state.password.length < 10 || this.state.password.length > 72) {
      validation = 'invalid password';
    } else {
      this.hashTimestamp = parseInt(Date.now() / 1000, 10);
      this.setState({
        ...this.state,
        buttonDisabled: true,
        status: 'computing proof of work',
      });
      this.worker.postMessage({
        prefix: '00c7f',
        value: `${this.state.email}!${this.state.password}!${this.hashTimestamp}`,
      });
      return;
    }
    this.setState({ ...this.state, status: validation });
  }

  handlePasswordChange = (event) => {
    this.setState({ ...this.state, password: event.target.value });
  }

  logIn = (nonce) => {
    const requestData = {
      email: this.state.email,
      nonce,
      password: this.state.password,
      timestamp: this.hashTimestamp,
    };
    this.setState({ ...this.state, status: 'logging in' });
    fetch(`${process.env.REACT_APP_BACKEND_URL}/token`, {
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body, status }) => {
        if (status === 200) {
          this.props.setToken(body.message.token);
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

  render() {
    let status;
    const buttonText = this.state.buttonDisabled ? 'Please Wait' : 'LogIn';
    if (this.state.status !== '') {
      status = (<div className="wrapped">Status: {this.state.status}</div>);
    }

    return (
      <div className="container">
        <button onClick={this.props.onCloseLogInModal}>X</button>
        <h1>Log In</h1>
        <div className="form-group">
          <label htmlFor="email">Email Address<br />
            <input id="email" onChange={this.handleEmailChange} onKeyPress={this.handleKeyPress} readOnly={this.state.buttonDisabled} type="text" value={this.state.email} />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password<br />
            <input id="password" onChange={this.handlePasswordChange} onKeyPress={this.handleKeyPress} type="password" value={this.state.password} />
          </label>
        </div>
        <div className="form-group">
          <input className="button" disabled={this.state.buttonDisabled} onClick={this.handleLogIn} type="button" value={buttonText} />
        </div>
        {status}
      </div>
    );
  }
}
LogIn.propTypes = {
  onCloseLogInModal: PropTypes.func.isRequired,
  setToken: PropTypes.func.isRequired,
};
export default LogIn;
