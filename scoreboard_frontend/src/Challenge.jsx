import PropTypes from 'prop-types';
import React from 'react';

function Challenge(props) {
  const {
    tags, points, solveCount, solved, title,
  } = props;

  let className = 'menu-header';
  if (solved) {
    className += ' menu-header-solved';
  }

  let status;
  if (solveCount > 1) {
    status = `(Ordered by ${solveCount} teams)`;
  } else if (solveCount === 1) {
    status = '(Ordered by 1 team)';
  } else {
    status = '(Be the first one to order it)';
  }

  let onClick = null;
  let menuClasses = 'menu-item';
  if (props.authenticated) {
    onClick = () => props.onClick(props);
    menuClasses += ' logged-in';
  }

  return (
    <div
      className={menuClasses}
      onClick={onClick}
      onKeyPress={() => {}}
      role="presentation"
    >
      <h3 className={className}>{title}</h3>
      <div className="menu-box">
        <div className="menu-text">
          {tags}<br />
          {status}
        </div>
        <span className="menu-points">{points}pt</span>
      </div>
    </div>
  );
}
Challenge.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solveCount: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
export default Challenge;
