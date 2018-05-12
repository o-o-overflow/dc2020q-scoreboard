import React from 'react';

class GameMatrix extends React.Component {

	constructor(props) {
		super(props);
	}

	header () {
		const theHeaders = this.challenges.map((id) => {
			return <th key={id}>{id}</th>;
		});

		return theHeaders;
	}

	solvedRow (solves) {
		const solved = this.challenges.map((id) => {
			const isSolved = solves.has(id);
			const theClass = isSolved ? 'solved' : 'not-solved';
			return <td className={theClass} dangerouslySetInnerHTML={ {__html: isSolved ? '&#10004;' : '&#10060;'} }></td>;
		});
		return solved;
	}

	body () {
		// Go through each team in order of score

		return this.props.teamScoreboardOrder.map((team) => {
			return <tr key={team.name}>
				<td key={team.name}>{team.name}</td>
				{this.solvedRow(new Set(team.solves))}
			</tr>;
		});
	}

	render () {
		this.challenges = [];
		Object.keys(this.props.challenges).map((cat) => {
			this.props.challenges[cat].map((chall) => {
				this.challenges.push(chall.id);
			});
		});

		this.challenges.sort();

		return (
			<table className='solves'>
			  <thead>
				<tr>
				  <th>Team</th>
				  {this.header()}
				</tr>
			  </thead>
			  <tbody>
				{this.body()}
			  </tbody>
			</table>
		);
	}
}

export default GameMatrix;
