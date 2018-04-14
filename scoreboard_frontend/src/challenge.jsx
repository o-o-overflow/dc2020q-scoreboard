import PropTypes from 'prop-types';
import React from 'react';

function Challenge(props) {
  const {
    category, points, onClick, solvedBy, title,
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

  return (
    <div
      className="menu-item"
      onClick={onClick}
      onKeyPress={() => {}}
      role="presentation"
    >
      <h3 className={className}>{title}</h3>
      <div className="menu-box">
        <div className="menu-text">
          {category}<br />
          {status}
        </div>
        <span className="menu-points">{points}pt</span>
      </div>
    </div>
  );
}
Challenge.propTypes = {
  category: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solvedBy: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};
export default Challenge;
