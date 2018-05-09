import React from 'react';
import ReactModal from 'react-modal';
import { Link, Route } from 'react-router-dom';
import ChallengeMenu from './ChallengeMenu';
import ChallengeModal from './ChallengeModal';
import LogInModal from './LogInModal';
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
      lastSolveTimeByTeam: {},
      pointsByTeam: {},
      showChallengeId: '',
      showChallengeModal: false,
      showLogInModal: false,
      solvesByTeam: {},
      openedByCategory: {},
      team: window.localStorage.getItem('team') || '',
      token: window.localStorage.getItem('token') || '',
      unopened: {},
    };
    this.categoryByChallenge = {};
    this.challengeTitlesById = {};
  }

  componentDidMount() {
    this.loadData();
  }

  setAuthentication = (data) => {
    this.setState({ ...this.state, ...data });
    window.localStorage.setItem('team', data.team);
    window.localStorage.setItem('token', data.token);
    this.handleCloseLogInModal();
    this.loadData();
  }

  handleCloseChallengeModal = () => {
    this.setState({ ...this.state, showChallengeModal: false });
  }

  handleCloseLogInModal = () => {
    this.setState({ ...this.state, showLogInModal: false });
  }


  handleLogOut = () => {
    this.setState({ ...this.state, team: '', token: '' });
    window.localStorage.removeItem('team');
    window.localStorage.removeItem('token');
    this.loadData();
  }

  handleOpenChallengeModal = (event) => {
    this.setState({ ...this.state, showChallengeId: event.id, showChallengeModal: true });
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
    const lastSolveTimeByTeam = {};
    const solvesByChallenge = {};
    const solvesByTeam = {};
    data.solves.forEach(([id, team, time]) => {
      if (id in solvesByChallenge) {
        solvesByChallenge[id] += 1;
      } else {
        solvesByChallenge[id] = 1;
      }

      if (team in solvesByTeam) {
        lastSolveTimeByTeam[team] = Math.max(lastSolveTimeByTeam[team], time);
        solvesByTeam[team].push(id);
      } else {
        lastSolveTimeByTeam[team] = time;
        solvesByTeam[team] = [id];
      }
    });

    const pointsByChallenge = {};
    const challenges = {};
    data.open.forEach(([id, title, tags, category]) => {
      this.categoryByChallenge[id] = category;
      this.challengeTitlesById[id] = title;
      pointsByChallenge[id] = challengePoints(solvesByChallenge[id]);

      const object = {
        id,
        points: pointsByChallenge[id],
        solveCount: solvesByChallenge[id] || 0,
        solved: (solvesByTeam[this.state.team] || []).includes(id),
        tags,
        title,
      };
      if (category in challenges) {
        challenges[category].push(object);
      } else {
        challenges[category] = [object];
      }
    });

    const pointsByTeam = {};
    Object.keys(solvesByTeam).forEach((team) => {
      let points = 0;
      solvesByTeam[team].forEach((id) => {
        points += pointsByChallenge[id];
      });
      pointsByTeam[team] = points;
    });

    this.setState({
      ...this.state,
      challenges,
      lastSolveTimeByTeam,
      pointsByTeam,
      solvesByTeam,
      unopened: data.unopened_by_category,
    });
  }

  render() {
    let tokenLink;
    if (this.state.token !== '') {
      tokenLink = (<button onClick={this.handleLogOut}>Log Out {this.state.team}</button>);
    } else {
      tokenLink = (<button onClick={this.handleOpenLogInModal}>Log In</button>);
    }

    const teamSolves = this.state.solvesByTeam[this.state.team] || [];
    const solved = teamSolves.includes(this.state.showChallengeId);

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
              <Route exact path="/" render={() => <ChallengeMenu authenticated={this.state.token !== ''} challenges={this.state.challenges} onClick={this.handleOpenChallengeModal} unopened={this.state.unopened} />} />
              <Route exact path="/rules" component={Rules} />
              <Route exact path="/scoreboard" render={() => <Scoreboard categoryByChallenge={this.categoryByChallenge} lastSolveTimeByTeam={this.state.lastSolveTimeByTeam} pointsByTeam={this.state.pointsByTeam} solvesByTeam={this.state.solvesByTeam} />} />
            </div>
          </div>
        </div>
        <ReactModal
          className="modal"
          contentLabel="Log In Modal"
          isOpen={this.state.showLogInModal}
          onRequestClose={this.handleCloseLogInModal}
        >
          <LogInModal
            onClose={this.handleCloseLogInModal}
            setAuthentication={this.setAuthentication}
          />
        </ReactModal>
        <ReactModal
          className="modal"
          contentLabel="Challenge Modal"
          isOpen={this.state.showChallengeModal}
          onRequestClose={this.handleCloseChallengeModal}
        >
          <ChallengeModal
            challengeId={this.state.showChallengeId}
            challengeTitle={this.challengeTitlesById[this.state.showChallengeId] || ''}
            onClose={this.handleCloseChallengeModal}
            onSolve={this.loadData}
            solved={solved}
            token={this.state.token}
          />
        </ReactModal>

      </div>
    );
  }
}
export default App;
