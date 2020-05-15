import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import ChallengeSection from "./ChallengeSection";

class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);

    this.sectionOrder = [
      "haiku",
      "sonnet",
      "balad",
      "epic",
      "epitaph",
      "limerick"
    ];
  }

  componentWillUnmount = () => {
    this.props.onUnload();
  };

  buildSections = sectionTitle => {
    const openChallenges = this.props.challenges[sectionTitle] || [];
    const unopenedChallenges = Array.from(
      Array(this.props.unopened[sectionTitle] || 0),
      (_, i) => ({ unopened: i + 1000 })
    );
    return (
      <ChallengeSection
        authenticated={this.props.authenticated}
        challenges={openChallenges.concat(unopenedChallenges)}
        key={sectionTitle}
        onClick={this.props.onClick}
        title={sectionTitle}
      />
    );
  };

  render() {
    const sections = this.sectionOrder.map(this.buildSections);
    return (
        <div className={"zoom-contents"}>
          <div className={"mainTitle content"}> <img alt="zoom" height="58px" src="/pics/zoom.png"/></div>
          <div className="zoom-elements">
            <div className={"zoom-center"}>
            {sections}
            </div>
          </div>
          <div className={"zoom-footer"}>
            <div className={"zoom-video-footer"}>
                <img alt={"video"} src={"/pics/video_icons.png"}/>
            </div>
            <div className={"zoom-leave-footer"}>
              Leave Meeting
            </div>
            <div className={"zoom-chat-footer"}>
              <img alt={"video"} src={"/pics/chat.png"}/>
            </div>

          </div>
        </div>
  )
  }
}
ChallengeMenu.propTypes = exact({
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.object))
    .isRequired,
  onClick: PropTypes.func.isRequired,
  onUnload: PropTypes.func.isRequired,
  unopened: PropTypes.objectOf(PropTypes.number).isRequired
});
export default ChallengeMenu;
