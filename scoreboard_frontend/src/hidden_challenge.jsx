import PropTypes from 'prop-types';
import React from 'react';

function HiddenChallenge(props) {
  return (
    <div className="hidden-menu-item">
      <h3 className="menu-header">{props.id}</h3>
      <div className="menu-box">
        <div className="menu-text">
          {props.id + 13}<br />
          c id {props.id}
        </div>
        <span className="menu-points">?</span>
      </div>
    </div>
  );
}
HiddenChallenge.propTypes = {
  id: PropTypes.number.isRequired,
};
export default HiddenChallenge;
