import React from 'react';
import ReactModal from 'react-modal';
import { Link, Route } from 'react-router-dom';
import ChallengeMenu from './ChallengeMenu';
import LogIn from './LogIn';
import Rules from './Rules';
import Scoreboard from './Scoreboard';

ReactModal.setAppElement('#root');

function challengePoints(solvers) {
  if (!Number.isInteger(solvers) || solvers < 2) return 500;
  return parseInt(100 + (400 / (1 + (0.08 * solvers * Math.log(solvers)))), 10);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: {},
      showLogInModal: false,
      openedByCategory: {},
      token: null,
      unopened: {},
    };
  }

  componentDidMount() {
    this.loadData();
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

  loadData = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/challenges`, { method: 'GET' })
      .then(response => response.json().then(body => ({ body, status: response.status })))
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.processData(body.message);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  processData = (data) => {
    const solvesByChallenge = {};
    const solvesByTeam = {};
    data.solves.forEach(([id, team]) => {
      if (id in solvesByChallenge) {
        solvesByChallenge[id] += 1;
      } else {
        solvesByChallenge[id] = 1;
      }

      if (team in solvesByTeam) {
        solvesByTeam[team].push(id);
      } else {
        solvesByTeam[team] = [id];
      }
    });

    const challenges = {};
    data.open.forEach(([id, title, tags, category]) => {
      const object = {
        id,
        points: challengePoints(solvesByChallenge[id]),
        solvedBy: solvesByChallenge[id] || 0,
        tags,
        title,
      };
      if (category in challenges) {
        challenges[category].push(object);
      } else {
        challenges[category] = [object];
      }
    });

    this.setState({ ...this.state, challenges, unopened: data.unopened_by_category });
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
              <Route exact path="/" render={() => <ChallengeMenu challenges={this.state.challenges} unopened={this.state.unopened} />} />
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
