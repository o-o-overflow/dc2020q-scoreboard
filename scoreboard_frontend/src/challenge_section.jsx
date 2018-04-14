import React from 'react';
import Challenge from './challenge';

class ChallengeSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: [
        {
          category: 'Web',
          points: 220,
          solvedBy: 45,
          title: 'Easypisy',
        },
        {
          category: 'Shellcoding',
          points: 500,
          solvedBy: 0,
          title: 'Binary Sunny-Side-Up',
        },
        {
          category: 'Shellcoding',
          points: 130,
          solvedBy: 1,
          title: 'Technical Support',
        },
      ],
      title: 'Amouse Bouche',
    };
  }

  handleClick(index) {
    const challenges = this.state.challenges.slice();
    challenges[index].solvedBy = (challenges[index].solvedBy + 1) % 3;
    this.setState({ challenges });
  }

  render() {
    const challenges = this.state.challenges.map((challenge, index) =>
      (
        <Challenge
          {...challenge}
          key={challenge.title}
          onClick={() => this.handleClick(index)}
        />
      ));
    return (
      <div>
        <h2 className="section-title">{this.state.title}</h2>
        {challenges}
      </div>
    );
  }
}
export default ChallengeSection;
