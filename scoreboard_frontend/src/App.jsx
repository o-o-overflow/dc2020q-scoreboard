import React from "react";
import ReactModal from "react-modal";
import { Link, Route } from "react-router-dom";
import ChallengeMenu from "./ChallengeMenu";
import ChallengeModal from "./ChallengeModal";
import GameMatrix from "./GameMatrix";
import LogInModal from "./LogInModal";
import Rules from "./Rules";
import Scoreboard from "./Scoreboard";
import CtfTimeScoreboard from "./CtfTimeScoreboard";

ReactModal.setAppElement("#root");

function challengePoints(solvers, category) {
  if (!Number.isInteger(solvers) || solvers < 2) return 500;
  return parseInt(100 + 400 / (1 + 0.08 * solvers * Math.log(solvers)), 10);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: {},
      lastSolveTimeByTeam: {},
      pointsByTeam: {},
      teamScoreboardOrder: [],
      showChallengeId: "",
      showChallengeModal: false,
      showLogInModal: false,
      solvesByTeam: {},
      openedByCategory: {},
      team: window.localStorage.getItem("team") || "",
      token: window.localStorage.getItem("token") || "",
      intervalID: -1,
      unopened: {}
    };
    this.categoryByChallenge = {};
    this.challengeTitlesById = {};
  }

  componentDidMount() {
    this.loadData();
    const intervalId = setInterval(this.loadData, 60000);
    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  setAuthentication = data => {
    this.setState({ ...this.state, ...data });
    window.localStorage.setItem("team", data.team);
    window.localStorage.setItem("token", data.token);
    this.handleCloseLogInModal();
    this.loadData();
  };

  handleCloseChallengeModal = () => {
    this.setState({ ...this.state, showChallengeModal: false });
  };

  handleCloseLogInModal = () => {
    this.setState({ ...this.state, showLogInModal: false });
  };

  handleLogOut = () => {
    this.setState({
      ...this.state,
      showChallengeModal: false,
      team: "",
      token: ""
    });
    window.localStorage.removeItem("team");
    window.localStorage.removeItem("token");
    this.loadData();
  };

  handleOpenChallengeModal = event => {
    this.setState({
      ...this.state,
      showChallengeId: event.id,
      showChallengeModal: true
    });
  };

  handleOpenLogInModal = () => {
    this.setState({
      ...this.state,
      showLogInModal: true,
      showChallengeModal: false
    });
  };

  loadData = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/challenges`, { method: "GET" })
      .then(response =>
        response.json().then(body => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.processData(body.message);
      })
      .catch(error => {
        console.log(error);
      });
  };

  processData = data => {
    const lastSolveTimeByTeam = {};
    const solvesByChallenge = {};
    const solvesByTeam = {};
    const solvesByTeamChallengeTime = {};
    data.solves.forEach(([id, team, time]) => {
      if (id in solvesByChallenge) {
        solvesByChallenge[id] += 1;
      } else {
        solvesByChallenge[id] = 1;
      }

      if (team in solvesByTeam) {
        lastSolveTimeByTeam[team] = Math.max(lastSolveTimeByTeam[team], time);
        solvesByTeam[team].push(id);
        if (!(team in solvesByTeamChallengeTime)) {
          solvesByTeamChallengeTime[team] = {};
        }
        solvesByTeamChallengeTime[team][id] = time;
      } else {
        lastSolveTimeByTeam[team] = time;
        solvesByTeam[team] = [id];
        if (!(team in solvesByTeamChallengeTime)) {
          solvesByTeamChallengeTime[team] = {};
        }
        solvesByTeamChallengeTime[team][id] = time;
      }
    });

    const pointsByChallenge = {};
    const challenges = {};
    data.open.forEach(([id, title, tags, category, open_time]) => {
      this.categoryByChallenge[id] = category;
      this.challengeTitlesById[id] = title;
      pointsByChallenge[id] = challengePoints(solvesByChallenge[id], category);

      const object = {
        id,
        points: pointsByChallenge[id],
        solveCount: solvesByChallenge[id] || 0,
        solved: (solvesByTeam[this.state.team] || []).includes(id),
        open_time: open_time,
        category: category,
        tags,
        title
      };
      if (category in challenges) {
        challenges[category].push(object);
      } else {
        challenges[category] = [object];
      }
    });

    const pointsByTeam = {};
    Object.keys(solvesByTeam).forEach(team => {
      let points = 0;
      solvesByTeam[team].forEach(id => {
        points += pointsByChallenge[id];
      });
      pointsByTeam[team] = points;
    });

    const teamScoreboardOrder = Object.keys(pointsByTeam).map(name => ({
      lastSolveTime: lastSolveTimeByTeam[name],
      name,
      points: pointsByTeam[name],
      solves: solvesByTeam[name]
    }));
    teamScoreboardOrder.sort((a, b) => {
      if (a.points === b.points) {
        return a.lastSolveTime - b.lastSolveTime;
      }
      return b.points - a.points;
    });

    this.setState({
      ...this.state,
      challenges,
      lastSolveTimeByTeam,
      pointsByTeam,
      teamScoreboardOrder,
      solvesByTeam,
      unopened: data.unopened_by_category
    });
  };

  render() {
    let tokenLink;
    if (this.state.token !== "") {
      tokenLink = (
        <button
          className="lcars-title right lcars-black-bg"
          onClick={this.handleLogOut}
        >
          Log Out {this.state.team}
        </button>
      );
    } else {
      tokenLink = (
        <button
          className="lcars-title right lcars-black-bg"
          onClick={this.handleOpenLogInModal}
        >
          Log In
        </button>
      );
    }

    const teamSolves = this.state.solvesByTeam[this.state.team] || [];
    const solved = teamSolves.includes(this.state.showChallengeId);
    const registerLink = this.state.team ? null : (
      <div className="lcars-title left lcars-black-bg">
        <a href="https://register.oooverflow.io">Register</a>
      </div>
    );

    return (
      <div className="lcars-app-container lcars-black-bg">
        <div id="header" className="lcars-row header lcars-black-bg">
          <div className="lcars-elbow left-bottom lcars-blue-bg" />
          <div className="lcars-bar lcars-blue-bg horizontal">
            <div className="lcars-title left lcars-black-bg">DC 27 Quals</div>
            <input type="checkbox" id="nav-toggle" />
            <label htmlFor="nav-toggle" className="label-toggle">
              ☰
            </label>
            <span className="nav-items">
              {tokenLink}
              {registerLink}
              <a
                className="lcars-title right lcars-black-bg"
                href="https://twitter.com/oooverflow"
              >
                Announcements
              </a>
              <Link className="lcars-title right lcars-black-bg" to="/solves">
                Solves
              </Link>
              <Link
                className="lcars-title right lcars-black-bg"
                to="/scoreboard"
              >
                Scoreboard
              </Link>
              <Link className="lcars-title right lcars-black-bg" to="/rules">
                Rules
              </Link>
              <Link className="lcars-title right lcars-black-bg" to="/">
                Training
              </Link>
            </span>
          </div>
          <div className="lcars-bar lcars-blue-bg horizontal right-end decorated" />
        </div>
        <div id="left-menu" className="lcars-column start-space lcars-u-1">
          <div className="lcars-bar lcars-blue-bg lcars-u-1" />
        </div>
        <div id="footer" className="lcars-row ">
          <div className="lcars-elbow left-top lcars-blue-bg" />
          <div className="lcars-bar horizontal both-divider bottom lcars-blue-bg" />
          <div className="lcars-bar horizontal right-end left-divider bottom lcars-blue-bg" />
        </div>

        <div id="container">
          <div className="lcars-row fill">
            <Route
              exact
              path="/"
              render={() => (
                <ChallengeMenu
                  authenticated={this.state.token !== ""}
                  challenges={this.state.challenges}
                  onClick={this.handleOpenChallengeModal}
                  onUnload={this.handleCloseChallengeModal}
                  unopened={this.state.unopened}
                />
              )}
            />
            <Route exact path="/rules" component={Rules} />
            <Route
              exact
              path="/scoreboard"
              render={() => (
                <Scoreboard
                  categoryByChallenge={this.categoryByChallenge}
                  lastSolveTimeByTeam={this.state.lastSolveTimeByTeam}
                  pointsByTeam={this.state.pointsByTeam}
                  solvesByTeam={this.state.solvesByTeam}
                  teamScoreboardOrder={this.state.teamScoreboardOrder}
                  team={this.state.team}
                />
              )}
            />
            <Route
              exact
              path="/solves"
              render={() => (
                <GameMatrix
                  challenges={this.state.challenges}
                  teamScoreboardOrder={this.state.teamScoreboardOrder}
                />
              )}
            />
            <Route
              exact
              path="/scoreboard-ctftime"
              render={() => (
                <CtfTimeScoreboard
                  categoryByChallenge={this.categoryByChallenge}
                  lastSolveTimeByTeam={this.state.lastSolveTimeByTeam}
                  pointsByTeam={this.state.pointsByTeam}
                  solvesByTeam={this.state.solvesByTeam}
                  teamScoreboardOrder={this.state.teamScoreboardOrder}
                  team={this.state.team}
                />
              )}
            />

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
                challengeTitle={
                  this.challengeTitlesById[this.state.showChallengeId] || ""
                }
                onClose={this.handleCloseChallengeModal}
                onTokenExpired={this.handleLogOut}
                onSolve={this.loadData}
                solved={solved}
                token={this.state.token}
              />
            </ReactModal>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
