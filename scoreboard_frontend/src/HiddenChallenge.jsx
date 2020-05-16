import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function HiddenChallenge(props) {
  return (
    <div className="challenge challenge-hidden"></div>
  );
}
HiddenChallenge.propTypes = exact({
  id: PropTypes.number.isRequired
});
export default HiddenChallenge;
