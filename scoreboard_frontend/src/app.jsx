import React from 'react';
import ReactModal from 'react-modal';
import { Link, Route } from 'react-router-dom';
import ChallengeMenu from './challenge_menu';
import LogIn from './LogIn';
import Rules from './rules';
import Scoreboard from './scoreboard';

ReactModal.setAppElement('#root');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showLogInModal: false, token: null };
  }

  setToken = (token) => {
    this.setState({ ...this.state, token });
    this.handleCloseLogInModal();
  }

  handleCloseLogInModal = () => {
    this.setState({ ...this.state, showLogInModal: false });
  }

  handleLogOut = () => {
    this.setState({ ...this.state, token: null });
  }

  handleOpenLogInModal = () => {
    this.setState({ ...this.state, showLogInModal: true });
  }

  render() {
    let tokenLink;
    if (this.state.token) {
      tokenLink = (<button onClick={this.handleLogOut}>Log Out</button>);
    } else {
      tokenLink = (<button onClick={this.handleOpenLogInModal}>Log In</button>);
    }

    return (
      <div>
        <nav>
          <div className="nav-title">Order-of-the-Overflow</div>
          <input type="checkbox" id="nav-toggle" />
          <label htmlFor="nav-toggle" className="label-toggle">☰</label>
          <div className="nav-items">
            {tokenLink}
            <Link to="/">A La Carte</Link>
            <Link to="/rules">Rules</Link>
            <Link to="/scoreboard">Scoreboard</Link>
          </div>
        </nav>
        <div>
          <div className="background">
            <div className="background-fade" />
            <div className="container">
              <Route exact path="/" component={ChallengeMenu} />
              <Route exact path="/rules" component={Rules} />
              <Route exact path="/scoreboard" component={Scoreboard} />
            </div>
          </div>
        </div>
        <ReactModal
          className="modal"
          contentLabel="Log In Modal"
          isOpen={this.state.showLogInModal}
          onRequestClose={this.handleCloseLogInModal}
        >
          <LogIn onCloseLogInModal={this.handleCloseLogInModal} setToken={this.setToken} />
        </ReactModal>
      </div>
    );
  }
}
export default App;
