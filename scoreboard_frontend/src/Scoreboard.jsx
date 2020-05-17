import PropTypes from "prop-types";
import React from "react";

function categoryIcon(categoryByChallenge, challengeId) {
  const cssClass = categoryByChallenge[challengeId].split(",")[0].replace(/ /g, "-");
  return (
    <span
      className={`category-${cssClass}`}
      key={challengeId}
      title={challengeId}
    />
  );
}

function Scoreboard(props) {
  var num = 1;
  const teams = props.teamScoreboardOrder.map(team => ({
    lastSolveTime: team.lastSolveTime,
    name: team.name,
    num: num++,
    points: props.pointsByTeam[team.name],
    solves: team.solves.map(id => categoryIcon(props.categoryByChallenge, id))
  }));

  function ctfTimeLink(teamName) {
    const ctfTimeTeamID = props.teams[teamName];
    if (ctfTimeTeamID !== undefined) {
      return <a href={`https://ctftime.org/team/${ctfTimeTeamID}`} target="_blank" rel="noopener noreferrer">{teamName}</a>
    }
    return teamName;
  }

  const teamRows = teams.map(team => (
    <tr key={team.name} id={team.name}>
      <td>{team.num}</td>
      <td>{team.points}</td>
      <td>{ctfTimeLink(team.name)}</td>
      <td>{team.solves}</td>
    </tr>
  ));

  function handleClick() {
    const element = document.getElementById(props.team);
    if (element) {
      window.scroll({
        behavior: "smooth",
        top: element.offsetTop
      });
    }
  }

  const teamLink = props.team ? (
    <button type="button" className="btn btn-link" onClick={handleClick}>
      (My Team)
    </button>
  ) : null;

  return (
    <div className="table-responsive bg-light">
      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th scope="col">Place</th>
            <th scope="col">Points</th>
            <th scope="col">Team {teamLink}</th>
            <th scope="col">Completed</th>
          </tr>
        </thead>
        <tbody>{teamRows}</tbody>
      </table>
    </div>
  );
}
Scoreboard.propTypes = {
  categoryByChallenge: PropTypes.objectOf(PropTypes.string).isRequired,
  lastSolveTimeByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  pointsByTeam: PropTypes.objectOf(PropTypes.number).isRequired,
  solvesByTeam: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))
    .isRequired,
  teams: PropTypes.objectOf(PropTypes.number).isRequired
};
export default Scoreboard;
