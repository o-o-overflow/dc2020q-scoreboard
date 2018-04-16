import React from 'react';

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [
        {
          name: 'Team 1',
          points: 3456,
        },
        {
          name: 'Team 2',
          points: 3115,
        },
        {
          name: 'Team 3',
          points: 3000,
        },
        {
          name: 'Team 4',
          points: 2980,
        },
        {
          name: 'Team 5',
          points: 2560,
        },
        {
          name: 'Team 6',
          points: 2550,
        },
        {
          name: 'Team 7',
          points: 2145,
        },
        {
          name: 'Team 8',
          points: 1996,
        },
        {
          name: 'Team 9',
          points: 1912,
        },
        {
          name: 'Team 10',
          points: 1789,
        },
        {
          name: 'Team 11',
          points: 1789,
        },
      ],
    };
  }

  render() {
    const { teams } = this.state;
    const teamRows = teams.map(team =>
      (
        <tr>
          <td>{team.name}</td>
          <td>{team.name}</td>
          <td>{team.points}</td>
        </tr>
      ));

    return (
      <table className="scoreboard">
        <tr><th>Team</th><th>Menu</th><th>Points</th></tr>
        {teamRows}
      </table>
    );
  }
}
export default Scoreboard;
