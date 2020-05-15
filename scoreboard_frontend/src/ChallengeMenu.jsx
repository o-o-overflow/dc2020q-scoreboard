import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import ChallengeSection from "./ChallengeSection";

class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);

    this.sectionOrder = [
      "haiku"
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
      <>
        <div className="d-flex justify-content-center"><img alt="zoom" src="/pics/zoom.png"/></div>
        <div className="d-flex footer-padding">{sections}</div>;
        <footer class="navbar navbar-dark bg-dark fixed-bottom">
          <div>
            <img alt="zoom-video" src="/pics/video_icons.png"/>
          </div>
          <div>
            <img alt="zoom-chat" src="/pics/chat.png"/>
          </div>
          <h3><span class="badge badge-danger">Leave</span></h3>
        </footer>
      </>
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
