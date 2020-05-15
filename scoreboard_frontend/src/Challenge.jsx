import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";

function Challenge(props) {
  const { authenticated, id, points, solveCount, solved, tags, item_index} = props;


  let onClick = null;
  let classes = "challenge";
  if (authenticated) {
    classes += " challenge-authenticated";
    onClick = () => props.onClick(props);
  }

  var styles;
  if (solved) {
    classes += " closechall";
    styles = {
      backgroundImage: `url('pics/s/${item_index}.gif')`,
    };
  } else {
    classes += " openchall";
    styles = {
      backgroundImage: `url('pics/a/${item_index}.gif')`,
    };
  }
  classes += " zoom-frame ";
  const arrtags = tags.split(",");

  const tagclass = arrtags.map((tag, index) => {
    return (
        <div className={`category-${tag.trim()}`}/>
    );
  });

  return (
      <td  >
        <div
          className={classes}
          onClick={onClick}
          onKeyPress={() => {}}
          role="presentation"
          style={styles}
        >

          <div className="challtitle" >
            <img src={"/pics/nomic.png"} alt={"nomic"}/> {id}
          </div>
          <div >
            <div>
              {tagclass}
            </div>
            <div className={"challscore"}>{points}</div>
          </div>
        </div>
      </td>
  );
}
Challenge.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  solveCount: PropTypes.number.isRequired,
  solved: PropTypes.bool.isRequired,
  tags: PropTypes.string.isRequired,
  item_index: PropTypes.number.isRequired,
});
export default Challenge;
