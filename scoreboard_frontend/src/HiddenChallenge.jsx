import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function HiddenChallenge(props) {
  return (
      <td  >
          <div
              className={"challenge closechall"}
              onKeyPress={() => {}}
              role="presentation"
          >
              <div className="challtitle" >

              </div>
              <div >
                  <div>

                  </div>
                  <div className={"challscore"}> </div>
              </div>
          </div>
      </td>
  );
}
HiddenChallenge.propTypes = exact({
  id: PropTypes.number.isRequired
});
export default HiddenChallenge;
