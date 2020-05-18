import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function Challenge(props) {
  const { id, points, solved, tags, item_index } = props;

  let onClick = () => props.onClick(props);
  let classes = "challenge";

  var styles;
  if (solved) {
    classes += "challenge-solved";
    styles = {
      backgroundImage: `url('pics/d/${item_index}.gif')`,
    };
  } else {
    styles = {
      backgroundImage: `url('pics/a/${item_index}.gif')`,
    };
  }

  const tag_divs = tags.split(",").map((tag, index) => {
    return (
      <div
        title={`${tag.trim()}`}
        className={`category category-${tag.trim()}`}
        key={index}
      />
    );
  });

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyPress={() => {}}
      style={styles}
    >
      <div>{tag_divs}</div>
      <div className="challenge-title">
        <img src="/pics/nomic.png" alt="no microphone" />
        {id}
      </div>
      <div className="challenge-score">{points}</div>
    </div>
  );
}
Challenge.propTypes = exact({
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired,
  item_index: PropTypes.number.isRequired,
});
export default Challenge;
