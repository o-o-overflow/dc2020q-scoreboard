import PropTypes from "prop-types";
import React from "react";

function HiddenChallenge(props) {
  return (
    <div className="lcars-element lcars-u-3-2 lcars-hopbush-bg rounded hidden-menu-item menu-item">
      <div className="menu-points">some pts</div>
      <div className="menu-lower">
        <h3 className="menu-header">CHALLANGE{props.id}</h3>
        <div className="menu-box">
          <div className="menu-text">tags</div>
          <div className="menu-text">Access denied{props.id + 13}</div>
        </div>
      </div>
    </div>
  );
}
HiddenChallenge.propTypes = {
  id: PropTypes.number.isRequired
};
export default HiddenChallenge;
