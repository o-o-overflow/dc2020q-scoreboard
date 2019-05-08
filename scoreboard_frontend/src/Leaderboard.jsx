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
				  <td>{team.overallSpeedrun.toFixed(2)} seconds</td>
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
				<li>
				  <Link to={`/leaderboard/${race.id}`}>{race.id}</Link> started at {race.open_time}
				</li>
			);
		});
	}
	
	render () {
		const current_header = this.props.currentRace ?
			  (
				  <h1>Live race <Link to={`/leaderboard/${this.props.currentRace.id}`}>{this.props.currentRace.id}</Link></h1>
			  ) :
			  (
				  <h1>Racetrack is currently closed</h1>
			  );

		return (
			<div id="leaderboard">
			  {current_header}
			  <h2>Overall Leaderboard</h2>
			  {this.overallLeaders()}
			  <ul className="race-list">
				{this.raceList()}
			  </ul>
			  <Route path="/leaderboard/:race" render={(props) =>
													   (
														   <RaceResults teamSpeedrunSolveOrder={this.props.teamSpeedrunSolveOrder[props.match.params.race] || []} race={props.match.params.race}/>
													   )}/>
			</div>
		);
	}
}

export default Leaderboard;
