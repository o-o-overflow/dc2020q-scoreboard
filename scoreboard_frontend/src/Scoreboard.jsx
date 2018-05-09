import PropTypes from 'prop-types';
import React from 'react';

function Scoreboard(props) {
  const teams = Object.keys(props.pointsByTeam).map(name => ({
    lastSolveTime: props.lastSolveTimeByTeam[name],
    name,
    points: props.pointsByTeam[name],
    solves: props.solvesByTeam[name],
  }));
  teams.sort((a, b) => {
    if (a.points === b.points) {
      return a.lastSolveTime - b.lastSolveTime;
    }
    return b.points - a.points;
  });

  const teamRows = teams.map(team =>
    (
      <tr key={team.name} >
        <td>{team.name}</td>
        <td>{team.solves.join(', ')}</td>
        <td>{team.points}</td>
      </tr>
    ));

  return (
    <table className="scoreboard">
      <thead>
        <tr><th>Team</th><th>Menu</th><th>Points</th></tr>
      </thead>
      <tbody>
        {teamRows}
      </tbody>
    </table>
  );
}
Scoreboard.propTypes = {
  lastSolveTimeByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  pointsByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  solvesByTeam: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};
export default Scoreboard;
