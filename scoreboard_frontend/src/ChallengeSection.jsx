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
  const classes = `lcars-title center lcars-black-bg ${props.style}`;
  return (
    <div className="lcars-column lcars-u-4">
      <div className="lcars-row fill">
        <div className="lcars-bar lcars-lilac-bg horizontal left-end decorated" />
        <div className="lcars-bar horizontal round lcars-lilac-bg">
          <h2 className={classes}>{props.title}</h2>
        </div>
        <div className="lcars-bar lcars-lilac-bg horizontal right-end decorated" />
      </div>
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
