import PropTypes from 'prop-types';
import React from 'react';

const CATEGORY_TO_CSS_CLASS = {
  'amuse bouche': 'amuse',
  appetizers: 'appetizers',
  'from the grill': 'grill',
  'signature dishes': 'signature',
  'guest chefs': 'guest',
  'fruits and desserts': 'desserts',
};

function categoryIcons(categoryByChallenge, challengeId) {
  const cssClass = CATEGORY_TO_CSS_CLASS[categoryByChallenge[challengeId]];
  return `<span title="${challengeId}" class="category-${cssClass}"></span>`;
}

function Scoreboard(props) {
	console.log(props.teamScoreboardOrder);
  const teams = props.teamScoreboardOrder.map(team => ({
      lastSolveTime: team.lastSolveTime,
      name: team.name,
      points: props.pointsByTeam[team.name],
      solves: team.solves.map(id => categoryIcons(props.categoryByChallenge, id)),
  }));
  // no longer needed because I lifted this code up into App
  // teams.sort((a, b) => {
  //   if (a.points === b.points) {
  //     return a.lastSolveTime - b.lastSolveTime;
  //   }
  //   return b.points - a.points;
  // });

  const teamRows = teams.map(team =>
    (
      <tr key={team.name} >
        <td>{team.name}</td>
        <td dangerouslySetInnerHTML={{ __html: team.solves.join('') }} />
        <td>{team.points}</td>
      </tr>
    ));

  return (
    <table className="scoreboard">
      <thead>
        <tr><th>Team</th><th>Ordered</th><th>Points</th></tr>
      </thead>
      <tbody>
        {teamRows}
      </tbody>
    </table>
  );
}
Scoreboard.propTypes = {
  categoryByChallenge: PropTypes.objectOf(PropTypes.string).isRequired,
  lastSolveTimeByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  pointsByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  solvesByTeam: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};
export default Scoreboard;
