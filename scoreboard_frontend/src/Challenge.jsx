import PropTypes from 'prop-types';
import React from 'react';

function Challenge(props) {
  const {
    tags, points, solvedBy, title,
  } = props;
  let className = 'menu-header menu-header-solved';
  let status;
  if (solvedBy > 1) {
    status = `(Ordered by ${solvedBy} teams)`;
  } else if (solvedBy === 1) {
    status = '(Ordered by 1 team)';
  } else {
    className = 'menu-header';
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
  solvedBy: PropTypes.number.isRequired,
  tags: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
export default Challenge;
