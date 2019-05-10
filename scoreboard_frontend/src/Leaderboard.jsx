import React from 'react';
import { Link, Route } from 'react-router-dom';
import RaceResults from './RaceResults';

class Leaderboard extends React.Component {

	body () {

		return this.props.teamOverallSpeedrunOrder.map((team, idx) => {
			return (
				<tr key={team.name}>
				  <td>{idx+1}</td>
				  <td key={team.name}>{team.name}</td>
				  <td>{team.overallSpeedrun.toFixed(2)} s</td>
				</tr>
			);
		});
		
	}

	overallLeaders() {
		return (
			<table className="overall-leaders">
			  <thead>
				<tr>
				  <th>Pos</th>
				  <th>Team</th>
				  <th>Time</th>
				</tr>
			  </thead>
			  <tbody>
				{this.body()}
			  </tbody>
			</table>
			  
		);
	}

	raceList() {
		return this.props.races.map((race) => {
			return (
				<Link to={`/leaderboard/${race.id}`}>
				  <div className="race-log-element lcars-element button rounded lcars-u-2-2">
					<div className="race-name">{race.id}</div>
					<div className="race-open">Stardate {race.open_time.toFixed(0)}</div>
				  </div>
				</Link>
			);
		});
	}
	
	render () {

		return (
			<div id="leaderboard">
			  <div className="overall-leaderboard lcars-u-3 lcars-column">
				<h2>Overall Leaderboard</h2>
				{this.overallLeaders()}
			  </div>
			  <div className="race-log lcars-u-3 lcars-column">
				<h2>Race Log</h2>
				{this.raceList()}
			  </div>
			  <Route path="/leaderboard/:race" render={(props) =>
													   (
														   <RaceResults teamSpeedrunSolveOrder={this.props.teamSpeedrunSolveOrder[props.match.params.race] || []} race={props.match.params.race}/>
													   )}/>
				</div>
		);
	}
}

export default Leaderboard;
