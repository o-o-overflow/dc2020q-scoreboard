import React from 'react';

class Challenge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      category: 'Web',
      points: 220,
      solvedBy: 0,
      title: 'Easypisy',
    };
  }

  handleClick() {
    this.setState({ solvedBy: (this.state.solvedBy + 1) % 3 });
  }

  render() {
    const {
      category, points, solvedBy, title,
    } = this.state;
    let className = 'menu-header menu-header-solved';
    let status;
    if (solvedBy > 1) {
      status = `(Ordered by ${solvedBy} teams)`;
    } else if (solvedBy === 1) {
      status = '(Ordered by 1 team)';
    } else {
      className = 'menu-header';
      status = '(Be the first one to order it)';
    }

    return (
      <div
        className="menu-item"
        onClick={() => this.handleClick()}
        onKeyPress={() => {}}
        role="presentation"
      >
        <h3 className={className}>{title}</h3>
        <div className="menu-box">
          <div className="menu-text">
            {category}<br />
            {status}
          </div>
          <span className="menu-points">{points}pt</span>
        </div>
      </div>
    );
  }
}
export default Challenge;
