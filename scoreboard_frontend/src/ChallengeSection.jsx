import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import Challenge from "./Challenge";
import HiddenChallenge from "./HiddenChallenge";

function ChallengeSection(props) {
  const challenges = props.challenges.map((challenge, index) => {
      if (challenge.unopened) {
        return (
            <HiddenChallenge id={challenge.unopened} key={challenge.unopened}/>
        );
      }

      return (
            <Challenge
                {...challenge}
                authenticated={props.authenticated}
                key={challenge.id}
                onClick={props.onClick}
                item_index={index}
            />
      );
    });

  return <div>{challenges}</div>;
}
ChallengeSection.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
});
export default ChallengeSection;
