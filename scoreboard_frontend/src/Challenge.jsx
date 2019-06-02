import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function Challenge(props) {
  const { authenticated, id, points, solveCount, solved, tags } = props;

  const solve_status = `Completed by ${solveCount} team${
    solveCount === 1 ? "" : "s"
  }.`;
  let onClick = null;
  let classes = "challenge";
  if (authenticated) {
    classes += " challenge-authenticated";
    onClick = () => props.onClick(props);
  }
  if (solved) {
    classes += " challenge-solved";
  }
  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyPress={() => {}}
      role="presentation"
    >
      <h3>{id}</h3>
      <div className="d-flex justify-content-around">
        <div>
          <div>{tags}</div>
          <div>{solve_status}</div>
        </div>
        <div>{points} pts</div>
      </div>
    </div>
  );
}
Challenge.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solveCount: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired
});
export default Challenge;
