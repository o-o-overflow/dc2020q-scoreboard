import PropTypes from "prop-types";
import React from "react";
import Challenge from "./Challenge";
import HiddenChallenge from "./HiddenChallenge";

function ChallengeSection(props) {
  const challenges = props.challenges.map((challenge, index) => {
    if (challenge.unopened) {
      return (
        <HiddenChallenge id={challenge.unopened} key={challenge.unopened} />
      );
    }
    return (
      <Challenge
        {...challenge}
        authenticated={props.authenticated}
        index={index}
        key={challenge.id}
        onClick={props.onClick}
        section={props.title}
      />
    );
  });
  return (
    <div>
      <h2 className={props.style}>{props.title}</h2>
      {challenges}
    </div>
  );
}
ChallengeSection.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
export default ChallengeSection;
