import PropTypes from 'prop-types';
import React from 'react';

const CATEGORY_TO_CSS_CLASS = {
  'amuse bouche': 'first-contact',
  appetizers: 'space',
  'from the grill': 'weapons',
  'signature dishes': 'science',
  'fruits and desserts': 'diplomacy',
};

function categoryIcons(categoryByChallenge, challengeId) {
  const cssClass = CATEGORY_TO_CSS_CLASS[categoryByChallenge[challengeId]];
  return `<span title="${challengeId}" class="category-${cssClass}"></span>`;
}

function CtfTimeScoreboard(props) {

	var ctfTimeOutput = {};
	ctfTimeOutput["tasks"] = Object.keys(props.categoryByChallenge);

	var num = 1;
	ctfTimeOutput["standings"] = props.teamScoreboardOrder.map(team => ({
		team: team.name,
		pos: num++,
		score: props.pointsByTeam[team.name],
	}));


	return (
		<pre>{JSON.stringify(ctfTimeOutput, null, ' ')}</pre>
	);

}

export default CtfTimeScoreboard;
