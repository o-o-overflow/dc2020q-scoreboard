import PropTypes from "prop-types";
import React from "react";

function Challenge(props) {
  const { id, points, solveCount, solved, tags } = props;

  let className = "menu-header";
  if (solved) {
    className += " menu-header-solved";
  }

  let status;
  if (solveCount > 1) {
    status = `(Completed by ${solveCount} cadets)`;
  } else if (solveCount === 1) {
    status = "(Completed by 1 cadet)";
  } else {
    status = "(Be the first)";
  }

  let onClick = null;
  let menuClasses = "menu-item";
  if (props.authenticated) {
    onClick = () => props.onClick(props);
    menuClasses += " logged-in";
  }
  if (solved) {
    menuClasses += " menu-solved";
  }
  let point_display = <div className="menu-points">{points} pts</div>;

  return (
    <div
      className={menuClasses}
      onClick={onClick}
      onKeyPress={() => {}}
      role="presentation"
    >
      {point_display}
      <div className="menu-lower">
        <h3 className={className}>{id}</h3>
        <div className="menu-box">
          <div className="menu-text">{tags}</div>
          <div className="menu-text">{status}</div>
        </div>
      </div>
    </div>
  );
}
Challenge.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solveCount: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired
};
export default Challenge;
