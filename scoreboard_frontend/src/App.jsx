import React from "react";
import ReactModal from "react-modal";
import { Route } from "react-router-dom";
import ChallengeMenu from "./ChallengeMenu";
import ChallengeModal from "./ChallengeModal";
import GameMatrix from "./GameMatrix";
import Navbar from "./Navbar";
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
      openedByCategory: {},
      solvesByChallenge: {},
      pointsByTeam: {},
      showChallengeId: "",
      showModal: null,
      solvesByTeam: {},
      teams: {},
      teamScoreboardOrder: [],
      unopened: {},
    };
    this.categoryByChallenge = {};
  }

  componentDidMount() {
    this.loadChallenges();
    this.loadTeams();
  }

  handleCloseModal = () => {
    this.setState({ showModal: null });
  };

  handleOpenChallengeModal = (event) => {
    this.setState({
      showChallengeId: event.id,
      showModal: "challenge",
    });
  };

  loadChallenges = () => {
    fetch("challenges.json", { method: "GET" })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.processChallenges(body.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  loadTeams = () => {
    fetch("teams.json", { method: "GET" })
      .then((response) =>
        response.json().then((body) => ({ body, status: response.status }))
      )
      .then(({ body, status }) => {
        if (status !== 200) {
          console.log(status);
          console.log(body.message);
          return;
        }
        this.setState({ teams: body.message.teams });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  processChallenges = (data) => {
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
    data.open.forEach(([id, tags, category, _openTime]) => {
      this.categoryByChallenge[id] = tags;
      pointsByChallenge[id] = challengePoints(solvesByChallenge[id], category);

      const object = {
        id,
        points: pointsByChallenge[id],
        solved: (solvesByTeam[this.state.team] || []).includes(id),
        tags,
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

    const teamScoreboardOrder = Object.keys(pointsByTeam).map((name) => ({
      lastSolveTime: lastSolveTimeByTeam[name],
      name,
      points: pointsByTeam[name],
      solves: solvesByTeam[name],
    }));
    teamScoreboardOrder.sort((a, b) => {
      if (a.points === b.points) {
        return a.lastSolveTime - b.lastSolveTime;
      }
      return b.points - a.points;
    });

    this.setState({
      challenges,
      lastSolveTimeByTeam,
      pointsByTeam,
      teamScoreboardOrder,
      solvesByTeam,
      solvesByChallenge,
      unopened: data.unopened_by_category,
    });
  };

  render() {
    const teamSolves = this.state.solvesByTeam[this.state.team] || [];
    const solved = teamSolves.includes(this.state.showChallengeId);
    return (
      <>
        <Navbar />
        <main role="main" className="container-fluid">
          <Route
            exact
            path="/"
            render={() => (
              <ChallengeMenu
                challenges={this.state.challenges}
                onClick={this.handleOpenChallengeModal}
                onUnload={this.handleCloseModal}
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
                teams={this.state.teams}
              />
            )}
          />
          <Route
            exact
            path="/solves"
            render={() => (
              <GameMatrix
                challenges={this.state.challenges}
                solvesByChallenge={this.state.solvesByChallenge}
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
            className="anything-but-the-default"
            contentLabel="Challenge Modal"
            isOpen={this.state.showModal === "challenge"}
            onRequestClose={this.handleCloseModal}
          >
            <ChallengeModal
              challengeId={this.state.showChallengeId}
              onClose={this.handleCloseModal}
              onSolve={this.loadChallenges}
              solved={solved}
              numSolved={
                this.state.solvesByChallenge[this.state.showChallengeId] || 0
              }
            />
          </ReactModal>
        </main>
      </>
    );
  }
}
export default App;
