import React from 'react';

const strip = text => text.replace(/^\s+|\s+$/g, '');

class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
      ctfTimeTeamId: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      status: '',
      teamName: '',
    };
    this.hashTimestamp = null;
    this.worker = new Worker('worker.js');
    this.worker.onmessage = (message) => {
      if (message.data.complete) {
        this.register(message.data.nonce);
      } else {
        this.setState({ ...this.state, status: `${this.state.status} .` });
      }
    };
  }

  handleCtfTimeTeamIdChange = (event) => {
    this.setState({ ...this.state, ctfTimeTeamId: strip(event.target.value) });
  }

  handleEmailChange = (event) => {
    this.setState({ ...this.state, email: strip(event.target.value) });
  }

  handleKeyPress = (event) => {
    if (!this.state.buttonDisabled && event.key === 'Enter') {
      this.handleRegister();
    }
  }

  handlePasswordChange = (event) => {
    this.setState({ ...this.state, password: event.target.value });
  }

  handlePasswordConfirmationChange = (event) => {
    this.setState({ ...this.state, passwordConfirmation: event.target.value });
  }

  handleRegister = () => {
    let validation;
    const teamId = parseInt(this.state.ctfTimeTeamId, 10);
    if (this.state.teamName.length === 0 || this.state.teamName.length > 80) {
      validation = 'invalid team name';
    } else if (!Number.isNaN(teamId) && (teamId <= 0 || teamId > 100000)) {
      validation = 'invalid CTF Time Team ID';
    } else if (this.state.email.length < 6 || this.state.email.length > 320
      || !this.state.email.includes('@') || !this.state.email.includes('.')) {
      validation = 'invalid email';
    } else if (this.state.password.length < 10 || this.state.password.length > 72) {
      validation = 'invalid password';
    } else if (this.state.password !== this.state.passwordConfirmation) {
      validation = 'password mismatch';
    } else {
      this.hashTimestamp = parseInt(Date.now() / 1000, 10);
      this.setState({
        ...this.state,
        buttonDisabled: true,
        status: 'computing proof of work',
      });
      this.worker.postMessage({
        prefix: '012345',
        value: `${this.state.email}!${this.hashTimestamp}`,
      });
      return;
    }
    this.setState({ ...this.state, status: validation });
  }

  handleTeamNameChange = (event) => {
    this.setState({ ...this.state, teamName: strip(event.target.value) });
  }


  register = (nonce) => {
    const requestData = {
      ctf_time_team_id: this.state.ctfTimeTeamId,
      email: this.state.email,
      nonce,
      password: this.state.password,
      team_name: this.state.teamName,
      timestamp: this.hashTimestamp,
    };
    this.setState({ ...this.state, status: 'submitting registration' });
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user_register`, {
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body, status }) => {
        let message;
        let reset = {};
        if (status === 201) {
          message = `Registration for ${this.state.email} received. Please follow the link in your email to complete the registration process.`;
          reset = {
            ctfTimeTeamId: '', email: '', password: '', passwordConfirmation: '', teamName: '',
          };
        } else {
          message = body.message;
        }
        this.setState({
          ...this.state,
          ...reset,
          buttonDisabled: false,
          status: message,
        });
      })
      .catch((error) => {
        this.setState({ ...this.state, buttonDisabled: false, status: '(error) see console for info' });
        console.log(error);
      });
  }

  render() {
    let status;
    const buttonText = this.state.buttonDisabled ? 'Please Wait' : 'Register';
    if (this.state.status !== '') {
      status = (<div className="wrapped">Status: {this.state.status}</div>);
    }

    return (
      <div>
        <h1>Registration</h1>
        <p>Note: Please only register a single account per team.</p>
        <div className="form-group">
          <label htmlFor="team-name">Team Name<br />
            <input id="team-name" onChange={this.handleTeamNameChange} onKeyPress={this.handleKeyPress} readOnly={this.state.buttonDisabled} type="text" value={this.state.teamName} />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="ctf-time-team-id">CTF Time Team ID<br />
            <input id="ctf-time-team-id" onChange={this.handleCtfTimeTeamIdChange} onKeyPress={this.handleKeyPress} max="100000" min="1" placeholder="optional" readOnly={this.state.buttonDisabled} type="number" value={this.state.ctfTimeTeamId} />
          </label>
          <div className="small">The 762 part of a URL like: <a href="https://ctftime.org/team/762">https://ctftime.org/team/762</a></div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address<br />
            <input id="email" onChange={this.handleEmailChange} onKeyPress={this.handleKeyPress} readOnly={this.state.buttonDisabled} type="text" value={this.state.email} />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password<br />
            <input id="password" onChange={this.handlePasswordChange} onKeyPress={this.handleKeyPress} placeholder="10 to 72 characters" readOnly={this.state.buttonDisabled} type="password" value={this.state.password} />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="passwordConfirmation">Password Confirmation<br />
            <input id="passwordConfirmation" onChange={this.handlePasswordConfirmationChange} onKeyPress={this.handleKeyPress} placeholder="10 to 72 characters" readOnly={this.state.buttonDisabled} type="password" value={this.state.passwordConfirmation} />
          </label>
        </div>
        <div className="form-group">
          <input className="button" disabled={this.state.buttonDisabled} onClick={this.handleRegister} type="button" value={buttonText} />
        </div>
        {status}
      </div>
    );
  }
}
export default Registration;
