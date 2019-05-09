import PropTypes from 'prop-types';
import React from 'react';
import ChallengeSection from './ChallengeSection';

class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);

    this.sectionInfo = {
      'amuse bouche': {
        column: 'left',
        style: 'category-amuse',
      },
      appetizers: {
        column: 'left',
        style: 'category-appetizers',
      },
      'from the grill': {
        column: 'left',
        style: 'category-grill',
      },
      'signature dishes': {
        column: 'right',
        style: 'category-signature',
      },
      'fruits and desserts': {
        column: 'right',
        style: 'category-desserts',
      },
      'speedrun': {
        column: 'right',
        style: 'category-speedrun',
      },
    };
  }

  componentWillUnmount = () => {
    this.props.onUnload();
  }

  buildSections = (sectionTitle) => {
    const section = this.sectionInfo[sectionTitle];

    const openChallenges = this.props.challenges[sectionTitle] || [];
    const unopenedChallenges = Array.from(
      Array(this.props.unopened[sectionTitle] || 0),
      (_, i) => ({ unopened: i + 1000 }),
    );
	const isSpeedrun = sectionTitle === "speedrun";

    return (
      <ChallengeSection
        {...section}
        authenticated={this.props.authenticated}
        challenges={openChallenges.concat(unopenedChallenges)}
        key={sectionTitle}
        onClick={this.props.onClick}
        title={sectionTitle}
		isSpeedrun={isSpeedrun}
      />
    );
  }

  render() {
    const leftSections = Object.keys(this.sectionInfo).filter(sectionTitle =>
      this.sectionInfo[sectionTitle].column === 'left').map(this.buildSections);
    const rightSections = Object.keys(this.sectionInfo).filter(sectionTitle =>
      this.sectionInfo[sectionTitle].column === 'right').map(this.buildSections);

    return (
      <div>
          <h1 className="lcars-row fill">Cadet Training Program</h1>
          <div className="lcars-row fill">
			<div className="lcars-column fill">
              {leftSections}
			</div>
			<div className="lcars-column fill">
              {rightSections}
			</div>
          </div>
      </div>
    );
  }
}
ChallengeMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  challenges: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  onClick: PropTypes.func.isRequired,
  onUnload: PropTypes.func.isRequired,
  unopened: PropTypes.objectOf(PropTypes.number).isRequired,
};
export default ChallengeMenu;
