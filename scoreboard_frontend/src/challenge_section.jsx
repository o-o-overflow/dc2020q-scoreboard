import PropTypes from 'prop-types';
import React from 'react';
import Challenge from './challenge';

function ChallengeSection(props) {
  const challenges = props.challenges.map((challenge, index) =>
    (
      <Challenge
        {...challenge}
        index={index}
        key={challenge.title}
        onClick={props.onClick}
        section={props.title}
      />
    ));
  return (
    <div>
      <h2 className="section-title">{props.title}</h2>
      {challenges}
    </div>
  );
}
ChallengeSection.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};
export default ChallengeSection;
