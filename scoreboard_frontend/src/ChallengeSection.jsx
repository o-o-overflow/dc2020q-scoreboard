import PropTypes from "prop-types";
import exact from "prop-types-exact";
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
        key={challenge.id}
        onClick={props.onClick}
      />
    );
  });
  const cssClass = props.title.replace(/ /g, "-");
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 challenge-section">
      <h2 className={`category-${cssClass}`}>{props.title}</h2>
      {challenges}
    </div>
  );
}
ChallengeSection.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
});
export default ChallengeSection;
