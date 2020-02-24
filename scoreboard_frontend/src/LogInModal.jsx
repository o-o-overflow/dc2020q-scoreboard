import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

const strip = text => text.replace(/^\s+|\s+$/g, "");

class LogInModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: false,
      email: "",
      password: "",
      status: ""
    };
    this.hashTimestamp = null;
    this.worker = new Worker("worker.js");
    this.worker.onmessage = message => {
      if (message.data.complete) {
        this.logIn(message.data.nonce);
      } else {
        this.setState((state, props) => ({ status: `${state.status} .` }));
      }
    };
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleEmailChange = event => {
    this.setState({ email: strip(event.target.value) });
  };

  handleKeyPress = event => {
    if (!this.state.buttonDisabled && event.key === "Enter") {
      this.handleLogIn();
    }
  };

  handleLogIn = () => {
    let validation;
    if (
      this.state.email.length < 6 ||
      this.state.email.length > 320 ||
      !this.state.email.includes("@") ||
      !this.state.email.includes(".")
    ) {
      validation = "invalid email";
    } else if (
      this.state.password.length < 10 ||
      this.state.password.length > 72
    ) {
      validation = "invalid password";
    } else {
      this.hashTimestamp = parseInt(Date.now() / 1000, 10);
      this.setState({
        buttonDisabled: true,
        status: "computing proof of work"
      });
      this.worker.postMessage({
        prefix: "0123",
        value: `${this.state.email}!${this.state.password}!${
          this.hashTimestamp
        }`
      });
      return;
    }
    this.setState({ status: validation });
  };

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };

  logIn = nonce => {
    const requestData = {
      email: this.state.email,
      nonce,
      password: this.state.password,
      timestamp: this.hashTimestamp
    };
    this.setState({ status: "logging in" });
    fetch(`${process.env.REACT_APP_BACKEND_URL}/token`, {
      body: JSON.stringify(requestData),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    })
      .then(response =>
        response.json().then(body => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status === 200) {
          this.props.setAuthentication(body.message);
          return;
        }
        this.setState({
          buttonDisabled: false,
          status: body.message
        });
      })
      .catch(error => {
        this.setState({
          buttonDisabled: false,
          status: "(error) see console for info"
        });
        console.log(error);
      });
  };

  render() {
    let status;
    const buttonText = this.state.buttonDisabled ? "Please Wait" : "Log In";
    if (this.state.status !== "") {
      status = <div>Status: {this.state.status}</div>;
    }

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Log In</h5>
            <button
              aria-label="Close"
              className="close"
              onClick={this.props.onClose}
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <label className="sr-only" htmlFor="email">
              Email Address
            </label>
            <input
              autoComplete="email"
              className="form-control"
              id="email"
              onChange={this.handleEmailChange}
              onKeyPress={this.handleKeyPress}
              placeholder="Email Address"
              readOnly={this.state.buttonDisabled}
              type="text"
              value={this.state.email}
            />
            <label className="sr-only" htmlFor="current-password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="form-control"
              id="password"
              onChange={this.handlePasswordChange}
              onKeyPress={this.handleKeyPress}
              placeholder="Password"
              type="password"
              value={this.state.password}
            />
          </div>
          <div className="modal-footer">
            {status}
            <input
              className="btn btn-primary"
              disabled={this.state.buttonDisabled}
              onClick={this.handleLogIn}
              type="button"
              value={buttonText}
            />
            <button
              className="btn btn-secondary"
              onClick={this.props.onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
LogInModal.propTypes = exact({
  onClose: PropTypes.func.isRequired,
  setAuthentication: PropTypes.func.isRequired
});
export default LogInModal;
