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
    status = `(Solved by ${solveCount} cadets)`;
  } else if (solveCount === 1) {
    status = '(Solved by 1 team)';
  } else {
    status = '(Be the first one to solve it)';
  }

  let onClick = null;
  let menuClasses = 'menu-item';
  if (props.authenticated) {
    onClick = () => props.onClick(props);
    menuClasses += ' logged-in';
  }
	let point_display = (
		<div className="menu-points">{points} pts</div>
	);
	if (props.isSpeedrun) {
		point_display = (
			<span></span>
		);
	}

  return (
    <div
      className={`lcars-element lcars-u-3-2 rounded ${menuClasses}`}
      onClick={onClick}
      onKeyPress={() => {}}
      role="presentation"
      >
	  {point_display}
	  <div className="menu-lower">
		<h3 className={className}>{title}</h3>
		<div className="menu-box">
          <div className="menu-text">
			{tags}
          </div>
		  <div className="menu-text">		
			{status}
		  </div>
		</div>
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
  isSpeedrun: PropTypes.bool.isRequired,
};
export default Challenge;
