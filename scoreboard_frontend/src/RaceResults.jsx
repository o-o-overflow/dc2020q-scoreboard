import React from 'react';

class RaceResults extends React.Component {

	body () {
		return this.props.teamSpeedrunSolveOrder.map((team, idx) => {
			return (
				<tr key={team.name}>
				  <td>{idx+1}</td>
				  <td key={team.name}>{team.name}</td>
				  <td>{team.solve_time.toFixed(2)} s</td>
				  <td>{team.points}</td>				  
				</tr>
			);
		});
	}
	
	render () {
		return (
			<div id="race-results">
			  <h2>{this.props.race}</h2>
			  <table className="overall-leaders">
				<thead>
				  <tr>
					<th>Pos</th>
					<th>Team</th>
					<th>Time</th>
					<th>Points</th>
				  </tr>
				</thead>
				<tbody>
				  {this.body()}
				</tbody>
			  </table>
			</div>
		);
	}
}

export default RaceResults;
