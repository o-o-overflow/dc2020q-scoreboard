import React from 'react';
import ReactModal from 'react-modal';
import { Link, Route } from 'react-router-dom';
import ChallengeMenu from './ChallengeMenu';
import ChallengeModal from './ChallengeModal';
import GameMatrix from './GameMatrix';
import LogInModal from './LogInModal';
import Rules from './Rules';
import Scoreboard from './Scoreboard';
import Leaderboard from './Leaderboard';

ReactModal.setAppElement('#root');

function challengePoints(solvers, category) {
	if (category === "speedrun") {
		return 0;
	}
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
      teamScoreboardOrder: [],
	  teamSpeedrunSolveOrder: {},
	  teamOverallSpeedrunOrder: [],
      showChallengeId: '',
      showChallengeModal: false,
      showLogInModal: false,
      solvesByTeam: {},
      openedByCategory: {},
      team: window.localStorage.getItem('team') || '',
      token: window.localStorage.getItem('token') || '',
      intervalID: -1,
      unopened: {},
	  currentRace: false,
	  races: [],
    };
    this.categoryByChallenge = {};
    this.challengeTitlesById = {};
  }

  componentDidMount() {
    this.loadData();
	  const intervalId = setInterval(this.loadData, 60000);
	  this.setState({intervalId: intervalId});
  }

  componentWillUnmount () {
	  clearInterval(this.state.intervalId);
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
    this.setState({ ...this.state, showChallengeModal: false, team: '', token: '' });
    window.localStorage.removeItem('team');
    window.localStorage.removeItem('token');
    this.loadData();
  }

  handleOpenChallengeModal = (event) => {
    this.setState({ ...this.state, showChallengeId: event.id, showChallengeModal: true });
  }

  handleOpenLogInModal = () => {
    this.setState({ ...this.state, showLogInModal: true, showChallengeModal: false });
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
		  if (!(team in solvesByTeamChallengeTime))
		  {
			  solvesByTeamChallengeTime[team] = {};
		  }
		  solvesByTeamChallengeTime[team][id] = time;
      } else {
          lastSolveTimeByTeam[team] = time;
          solvesByTeam[team] = [id];
		  if (!(team in solvesByTeamChallengeTime))
		  {
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
			  title,
		  };
		  if (category in challenges) {
			  challenges[category].push(object);
		  } else {
			  challenges[category] = [object];
		  }
      });

	  const teamSpeedrunSolveOrder = {};
	  const teamOverallSpeedrunOrder = [];
	  Object.keys(solvesByTeam).forEach((team) => {
		  let overall_time = 0;
		  if (! ("speedrun" in challenges)) {
			  return;
		  }
		  challenges["speedrun"].forEach((chal) => {
			  let time_for_overall = 60*60*2;
			  if (solvesByTeam[team].includes(chal.id)) {
				  let solve_time = solvesByTeamChallengeTime[team][chal.id];
				  let open_time = chal.open_time;
				  let diff = solve_time - open_time;
				  if ((diff) < time_for_overall) {
					  time_for_overall = diff;
				  }
				  
				  if (! (chal.id in teamSpeedrunSolveOrder))
				  {
					  teamSpeedrunSolveOrder[chal.id] = [];
				  }
				  teamSpeedrunSolveOrder[chal.id].push({
					  name: team,
					  solve_time: diff,
					  points: 0,
				  });
			  }
			  overall_time += time_for_overall;
		  });
		  teamOverallSpeedrunOrder.push({
			  name: team,
			  overallSpeedrun: overall_time,
		  });
	  });

	  teamOverallSpeedrunOrder.sort((a, b) => {
		  return a.overallSpeedrun - b.overallSpeedrun;
	  });

	  const individual_place_points = {
		  1: 25,
		  2: 20,
		  3: 15,
		  4: 10,
		  default: 5,
	  };

	  const speedrunPointsByTeam = {overall: {},
									individual: {},
								   };

	  Object.keys(teamSpeedrunSolveOrder).forEach((chal) => {
		  teamSpeedrunSolveOrder[chal].sort((a, b) => {
			  return a.time_for_overall - b.time_for_overall;
		  });

		  teamSpeedrunSolveOrder[chal].forEach((solve, idx) => {
			  solve.points = individual_place_points[idx+1] || individual_place_points.default;

			  if (! (solve.name in speedrunPointsByTeam.individual)) {
				  speedrunPointsByTeam.individual[solve.name] = 0;
			  }
			  speedrunPointsByTeam.individual[solve.name] += solve.points;
		  });
	  });

      const pointsByTeam = {};
      Object.keys(solvesByTeam).forEach((team) => {
		  let points = 0;
		  solvesByTeam[team].forEach((id) => {
			  points += pointsByChallenge[id];
		  });
		  pointsByTeam[team] = points;
      });

	  const overall_place_points = {
		  1: 300,
		  2: 200,
		  3: 100,
		  default: 0,
	  };

	  teamOverallSpeedrunOrder.forEach((team, idx) => {
		  const place = idx+1;
		  if (place in overall_place_points) {
			  speedrunPointsByTeam.overall[team.name] = overall_place_points[place];
		  }
	  });

	  // increase points by the speedrun overall
	  Object.keys(speedrunPointsByTeam.overall).map((team, index) => {
		  pointsByTeam[team] += speedrunPointsByTeam.overall[team];
	  });

	  // increase points by the speedrun individual
	  Object.keys(speedrunPointsByTeam.individual).map((team, index) => {
		  pointsByTeam[team] += speedrunPointsByTeam.individual[team];
	  });

	const teamScoreboardOrder = Object.keys(pointsByTeam).map(name => ({
		lastSolveTime: lastSolveTimeByTeam[name],
		name,
		points: pointsByTeam[name],
		solves: solvesByTeam[name],
		speedrunOverall: name in speedrunPointsByTeam.overall ?	speedrunPointsByTeam.overall[name] : 0,
		speedrunIndividual: name in speedrunPointsByTeam.individual ? speedrunPointsByTeam.individual[name] : 0,
	}));
	teamScoreboardOrder.sort((a, b) => {
		if (a.points === b.points) {
			return a.lastSolveTime - b.lastSolveTime;
		}
		return b.points - a.points;
	});


	  const races = "speedrun" in challenges ?
			challenges["speedrun"].concat().sort((a, b) => {
				return b.open_time - a.open_time;
			})
			: [];

	  const currentRace = races[0];
	  

    this.setState({
      ...this.state,
      challenges,
      lastSolveTimeByTeam,
      pointsByTeam,
	  teamScoreboardOrder,
      solvesByTeam,
      currentRace,
	  races,
      teamOverallSpeedrunOrder,
	  teamSpeedrunSolveOrder,
      unopened: data.unopened_by_category,
    });
  }

  render() {
    let tokenLink;
    if (this.state.token !== '') {
      tokenLink = (<button className="lcars-title right lcars-black-bg" onClick={this.handleLogOut}>Log Out {this.state.team}</button>);
    } else {
      tokenLink = (<button className="lcars-title right lcars-black-bg" onClick={this.handleOpenLogInModal}>Log In</button>);
    }

    const teamSolves = this.state.solvesByTeam[this.state.team] || [];
    const solved = teamSolves.includes(this.state.showChallengeId);
    const registerLink = this.state.team ? null : <div className="lcars-title left lcars-black-bg"><a href="https://register.oooverflow.io">Register</a></div>;

    return (
      <div className="lcars-app-container lcars-black-bg">
        <div id="header" className="lcars-row header lcars-black-bg">
		  <div className="lcars-elbow left-bottom lcars-blue-bg">
		  </div>
		  <div className="lcars-bar lcars-blue-bg horizontal">
			<div className="lcars-title left lcars-black-bg">DC 27 Quals</div>
			<input type="checkbox" id="nav-toggle" />
			<label htmlFor="nav-toggle" className="label-toggle">☰</label>
			<span className="nav-items">
            {tokenLink}
			{registerLink}
              <a className="lcars-title right lcars-black-bg" href="https://twitter.com/oooverflow">Announcements</a>
              <Link className="lcars-title right lcars-black-bg" to={`/leaderboard/${this.state.currentRace ? this.state.currentRace.id : ''}`}>Leaderboard</Link>
              <Link className="lcars-title right lcars-black-bg" to="/solves">Solves</Link>			
              <Link className="lcars-title right lcars-black-bg" to="/scoreboard">Scoreboard</Link>			
              <Link className="lcars-title right lcars-black-bg" to="/rules">Rules</Link>			
              <Link className="lcars-title right lcars-black-bg" to="/">Training</Link>
			</span>
		  </div>
		  <div className="lcars-bar lcars-blue-bg horizontal right-end decorated"></div>
		</div>
		<div id="left-menu" className="lcars-column start-space lcars-u-1">
			<div className="lcars-bar lcars-blue-bg lcars-u-1"></div>
		</div>
		<div id="footer" className="lcars-row ">
			<div className="lcars-elbow left-top lcars-blue-bg"></div>
			<div className="lcars-bar horizontal both-divider bottom lcars-blue-bg"></div>
			<div className="lcars-bar horizontal right-end left-divider bottom lcars-blue-bg"></div>
		</div>
		
		
        <div id="container">
		  <div className="lcars-row fill">
          <Route exact path="/" render={() => <ChallengeMenu authenticated={this.state.token !== ''} challenges={this.state.challenges} onClick={this.handleOpenChallengeModal} onUnload={this.handleCloseChallengeModal} unopened={this.state.unopened} />} />
            <Route exact path="/rules" component={Rules} />
            <Route exact path="/scoreboard" render={() => <Scoreboard categoryByChallenge={this.categoryByChallenge} lastSolveTimeByTeam={this.state.lastSolveTimeByTeam} pointsByTeam={this.state.pointsByTeam} solvesByTeam={this.state.solvesByTeam} teamScoreboardOrder={this.state.teamScoreboardOrder} team={this.state.team} />} />
			<Route exact path="/solves" render={() => <GameMatrix challenges={this.state.challenges} teamScoreboardOrder={this.state.teamScoreboardOrder}/>}/>
			<Route path="/leaderboard" render={() => <Leaderboard races={this.state.races} currentRace={this.state.currentRace} teamOverallSpeedrunOrder={this.state.teamOverallSpeedrunOrder} teamSpeedrunSolveOrder={this.state.teamSpeedrunSolveOrder} />}/>

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
