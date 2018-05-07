import PropTypes from 'prop-types';
import React from 'react';
import Challenge from './Challenge';
import HiddenChallenge from './HiddenChallenge';


function ChallengeSection(props) {
  const challenges = props.challenges.map((challenge, index) => {
    if (challenge.unopened) {
      return <HiddenChallenge id={challenge.unopened} key={challenge.unopened} />;
    }
    return (
      <Challenge
        {...challenge}
        index={index}
        key={challenge.id}
        onClick={props.onClick}
        section={props.title}
      />
    );
  });
  const classes = `section-title ${props.style}`;
  return (
    <div>
      <h2 className={classes}>{props.title}</h2>
      {challenges}
    </div>
  );
}
ChallengeSection.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
export default ChallengeSection;
