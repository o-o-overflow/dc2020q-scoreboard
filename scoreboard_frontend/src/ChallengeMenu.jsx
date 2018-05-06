import React from 'react';
import update from 'immutability-helper';
import ChallengeSection from './ChallengeSection';

class ChallengeMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: {
        'Amuse Bouche': {
          challenges: [
            {
              category: 'Web',
              id: 0,
              points: 220,
              solvedBy: 45,
              title: 'Easypisy',
            },
            {
              category: 'Shellcoding',
              id: 1,
              points: 500,
              solvedBy: 0,
              title: 'Binary Sunny-Side-Up',
            },
            {
              category: 'Shellcoding',
              id: 2,
              points: 130,
              solvedBy: 1,
              title: 'Technical Support',
            },
          ],
          column: 'left',
          style: 'category-amuse',
        },
        Appetizers: {
          challenges: [
            {
              category: 'Exploitation',
              id: 3,
              points: 220,
              solvedBy: 23,
              title: 'IoT Skewers',
            },
          ],
          column: 'left',
          style: 'category-appetizers',
        },
        'From the Grill': {
          challenges: [
            { id: 4 },
            { id: 5 },
            { id: 6 },
          ],
          column: 'left',
          style: 'category-grill',
        },
        'Signature Dishes': {
          challenges: [
            { id: 7 },
            { id: 8 },
            { id: 9 },
          ],
          column: 'right',
          style: 'category-signature',
        },
        'Guest Chefs': {
          challenges: [
            { id: 10 },
            { id: 11 },
            { id: 12 },

          ],
          column: 'right',
          style: 'category-guest',
        },
        'Fruits and Desserts': {
          challenges: [
            { id: 13 },
            { id: 14 },
            { id: 15 },
          ],
          column: 'right',
          style: 'category-desserts',
        },
      },
    };
  }

  buildSections = (sectionTitle) => {
    const section = this.state.sections[sectionTitle];
    return (
      <ChallengeSection
        {...section}
        key={sectionTitle}
        onClick={this.handleClick}
        title={sectionTitle}
      />
    );
  }

  handleClick = (sourceProps) => {
    const { index, section } = sourceProps;
    const { challenges } = this.state.sections[section];

    const solvedBy = (challenges[index].solvedBy + 1) % 3;
    const state = update(this.state, {
      sections: {
        [section]: {
          challenges: {
            [index]: {
              solvedBy: { $set: solvedBy },
            },
          },
        },
      },
    });
    this.setState(state);
  }

  render() {
    const leftSections = Object.keys(this.state.sections).filter(sectionTitle =>
      this.state.sections[sectionTitle].column === 'left').map(this.buildSections);
    const rightSections = Object.keys(this.state.sections).filter(sectionTitle =>
      this.state.sections[sectionTitle].column === 'right').map(this.buildSections);

    return (
      <div>
        <div className="center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 133 20" height="20" width="150" fill="#ffbc00">
            <g><path d="M127.18,6.19C121-.05,109.94-.24,101.84.1,90.84.56,80,3.3,69.32,5.77c-8,1.86-16,3.63-24,5.72-9.21,2.41-18.6,4.72-28.14,5.19-4.1.2-8.48,0-12.16-2a6.6,6.6,0,0,1-2.7-9A5.46,5.46,0,0,1,7.07,2.77c4-.22,6.73,8.39-.08,4.58a.49.49,0,0,0-.49.84c4.88,3,10.8,0,5.4-4.91C7.6-.63.4,2.06,0,8-1,24,28.25,17,36.29,15.24,53.74,11.37,70.9,6.44,88.53,3.33c11.1-2,24.75-3.54,35.06,2.19a16,16,0,0,1,6.86,8.85c1.29,4.31-4.35,4.2-7,3.52-4.84-1.26-2.42-8,1.22-3,.61.83,2,0,1.4-.82-2.15-2.93-6.71-4.9-7.12.35s8.36,7.24,11.72,4.47C135,15.32,129.91,9,127.18,6.19Z" /></g>
          </svg>
          <h1 className="menu-title">Discover Our Unique Challenges Menu</h1>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 133 20" height="20" width="150" fill="#ffbc00">
            <g><path d="M127.18,6.19C121-.05,109.94-.24,101.84.1,90.84.56,80,3.3,69.32,5.77c-8,1.86-16,3.63-24,5.72-9.21,2.41-18.6,4.72-28.14,5.19-4.1.2-8.48,0-12.16-2a6.6,6.6,0,0,1-2.7-9A5.46,5.46,0,0,1,7.07,2.77c4-.22,6.73,8.39-.08,4.58a.49.49,0,0,0-.49.84c4.88,3,10.8,0,5.4-4.91C7.6-.63.4,2.06,0,8-1,24,28.25,17,36.29,15.24,53.74,11.37,70.9,6.44,88.53,3.33c11.1-2,24.75-3.54,35.06,2.19a16,16,0,0,1,6.86,8.85c1.29,4.31-4.35,4.2-7,3.52-4.84-1.26-2.42-8,1.22-3,.61.83,2,0,1.4-.82-2.15-2.93-6.71-4.9-7.12.35s8.36,7.24,11.72,4.47C135,15.32,129.91,9,127.18,6.19Z" /></g>
          </svg>
        </div>

        <div className="row">
          <div className="column">
            {leftSections}
          </div>
          <div className="column">
            {rightSections}
          </div>
        </div>
      </div>
    );
  }
}
export default ChallengeMenu;
