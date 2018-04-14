import React from 'react';
import Challenge from './challenge';

class ChallengeSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: 'Amouse Bouche' };
  }
  render() {
    return (
      <div>
        <h2 className="section-title">{this.state.title}</h2>
        <Challenge />
        <Challenge />
        <Challenge />
      </div>
    );
  }
}
export default ChallengeSection;
