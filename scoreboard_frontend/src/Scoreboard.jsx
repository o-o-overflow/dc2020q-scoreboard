import PropTypes from "prop-types";
import React from "react";

const CATEGORY_TO_CSS_CLASS = {
  "amuse bouche": "first-contact",
  appetizers: "space",
  "from the grill": "weapons",
  "signature dishes": "science",
  "fruits and desserts": "diplomacy"
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
    solves: team.solves.map(id => categoryIcons(props.categoryByChallenge, id))
  }));

  const teamRows = teams.map(team => (
    <tr key={team.name} id={team.name}>
      <td>{team.num}</td>
      <td>{team.name}</td>
      <td dangerouslySetInnerHTML={{ __html: team.solves.join("") }} />
      <td>{team.points}</td>
    </tr>
  ));

  function handleClick() {
    const element = document.getElementById(props.team);
    if (element) {
      element.scrollIntoView();
    }
  }

  const youLink = props.team ? (
    <div className="toTeam" href="#" onClick={handleClick}>
      YOUR TEAM
    </div>
  ) : null;

  return (
    <div>
      <div>{youLink}</div>
      <table className="scoreboard">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Completed</th>
            <th>Points</th>
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
    .isRequired
};
export default Scoreboard;
