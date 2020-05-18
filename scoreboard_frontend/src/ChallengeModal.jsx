import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import showdown from "showdown";

class ChallengeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      description: "",
      flag: "",
      flagHash: "",
      status: "",
    };
    this.worker = new Worker("worker.js");
    this.worker.onmessage = (message) => {
      if (message.data.complete) {
        const status =
          message.data.digest === this.state.flagHash
            ? "success!"
            : "incorrect flag";
        this.setState({ status });
      }
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleFlagChange = (event) => {
    this.setState({ flag: event.target.value });
  };

  handleKeyPress = (event) => {
    if (event.key === "Enter") {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    if (this.state.flag.length < 1 || this.state.flag.length > 160) {
      this.setState({ status: "invalid flag" });
    } else {
      this.worker.postMessage(this.state.flag);
    }
  };

  loadData = () => {
    this.setState({ description: "Loading..." });
    fetch("scoreboard.json", { method: "GET" })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        const converter = new showdown.Converter({
          literalMidWordUnderscores: true,
          simplifiedAutoLink: true,
        });
        const description = converter.makeHtml(
          body[this.props.challengeId]["description"]
        );
        const flagHash = body[this.props.challengeId]["flag_hash"];
        this.setState({ description, flagHash });
      });
  };

  render() {
    let status;
    if (this.state.status !== "") {
      status = (
        <div className="alert alert-secondary">Status: {this.state.status}</div>
      );
    }

    let form_submission = "";

    if (!this.props.solved) {
      form_submission = (
        <>
          <label htmlFor="flag" className="sr-only">
            Flag
          </label>
          <input
            id="flag"
            className="form-control"
            placeholder="flag (format: OOO{…})"
            onChange={this.handleFlagChange}
            onKeyPress={this.handleKeyPress}
            type="text"
            value={this.state.flag}
          />
          <input
            className="btn btn-primary"
            onClick={this.handleSubmit}
            type="button"
            value="Submit Flag"
          />
        </>
      );
    }

    const solve_string =
      this.props.numSolved === 1 ? "1 solve" : `${this.props.numSolved} solves`;

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{`${this.props.challengeId} (${solve_string})`}</h5>
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
            <div dangerouslySetInnerHTML={{ __html: this.state.description }} />
            {status}
          </div>
          <div className="modal-footer">
            {form_submission}
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
ChallengeModal.propTypes = exact({
  challengeId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSolve: PropTypes.func.isRequired,
  solved: PropTypes.bool.isRequired,
  numSolved: PropTypes.number.isRequired,
});
export default ChallengeModal;
