import PropTypes from 'prop-types';
import React from 'react';

const CATEGORY_TO_CSS_CLASS = {
  'amuse bouche': 'amuse',
  appetizers: 'appetizers',
  'from the grill': 'grill',
  'signature dishes': 'signature',
  'fruits and desserts': 'desserts',
};

function categoryIcons(categoryByChallenge, challengeId) {
  const cssClass = CATEGORY_TO_CSS_CLASS[categoryByChallenge[challengeId]];
  return `<span title="${challengeId}" class="category-${cssClass}"></span>`;
}

function Scoreboard(props) {
  var num = 1;
  const teams = props.teamScoreboardOrder.map(team => ({
      lastSolveTime: team.lastSolveTime,
      name: team.name,
	  num: num++,
      points: props.pointsByTeam[team.name],
      solves: team.solves.filter(id => props.categoryByChallenge[id] !== "speedrun").map(id => categoryIcons(props.categoryByChallenge, id)),
	  speedrunOverall: team.speedrunOverall,
	  speedrunIndividual: team.speedrunIndividual,
  }));

  const teamRows = teams.map(team =>
    (
		<tr key={team.name} id={team.name} >
        <td>{team.num}</td>
        <td>{team.name}</td>
        <td dangerouslySetInnerHTML={{ __html: team.solves.join('') }} />
		<td>{team.speedrunIndividual}</td>
		<td>{team.speedrunOverall}</td>
        <td>{team.points}</td>
      </tr>
    ));

	function handleClick() {
		const element = document.getElementById(props.team);
		if (element) {
			element.scrollIntoView();
		}
	}

	const youLink = props.team ? <a className="toTeam" onClick={handleClick}>YOU</a> : null;

	return (
		<div>
		  <div>{youLink}</div>
		  <table className="scoreboard">
			<thead>
			  <tr><th>#</th><th>Team</th><th>Ordered</th><th>Speedrun Individual</th><th>Speedrun Overall</th><th>Points</th></tr>
			</thead>
			<tbody>
			  {teamRows}
			</tbody>
		  </table>
		</div>
  );
}
Scoreboard.propTypes = {
  categoryByChallenge: PropTypes.objectOf(PropTypes.string).isRequired,
  lastSolveTimeByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  pointsByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  solvesByTeam: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};
export default Scoreboard;
