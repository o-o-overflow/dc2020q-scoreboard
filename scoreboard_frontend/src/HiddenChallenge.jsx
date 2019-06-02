import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function HiddenChallenge(props) {
  return (
    <div className="challenge challenge-hidden">
      <h3>CHALLENGE{props.id}</h3>
      <div className="d-flex justify-content-around">
        <div>
          <div>tags</div>
          <div>Access denied{props.id + 13}</div>
        </div>
        <div>some pts</div>
      </div>
    </div>
  );
}
HiddenChallenge.propTypes = exact({
  id: PropTypes.number.isRequired
});
export default HiddenChallenge;
