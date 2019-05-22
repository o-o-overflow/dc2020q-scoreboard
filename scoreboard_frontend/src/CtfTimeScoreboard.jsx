import React from "react";

function CtfTimeScoreboard(props) {
  var ctfTimeOutput = {};
  ctfTimeOutput["tasks"] = Object.keys(props.categoryByChallenge);

  var num = 1;
  ctfTimeOutput["standings"] = props.teamScoreboardOrder.map(team => ({
    team: team.name,
    pos: num++,
    score: props.pointsByTeam[team.name]
  }));

  return <pre>{JSON.stringify(ctfTimeOutput, null, " ")}</pre>;
}

export default CtfTimeScoreboard;
