import React from "react";

class GameMatrix extends React.Component {
  body() {
    return this.props.teamScoreboardOrder.map((team) => {
      return (
        <tr key={team.name}>
          <td className="sticky-left" key={team.name}>
            {team.name}
          </td>
          {this.solvedRow(new Set(team.solves))}
        </tr>
      );
    });
  }

  header() {
    const theHeaders = this.challenges.map((id) => {
      return (
        <th key={id} scope="row">
          {id} ({this.props.solvesByChallenge[id] || 0})
        </th>
      );
    });

    return theHeaders;
  }

  solvedRow(solves) {
    return this.challenges.map((id) => {
      return <td key={id}>{solves.has(id) ? "✔" : "❌"}</td>;
    });
  }

  render() {
    this.challenges = [];
    Object.keys(this.props.challenges).map((cat) => {
      return this.props.challenges[cat].map((chall) => {
        return this.challenges.push(chall.id);
      });
    });

    this.challenges.sort();

    return (
      <div className="table-responsive bg-light">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th className="sticky-left" scope="column">
                Team
              </th>
              {this.header()}
            </tr>
          </thead>
          <tbody>{this.body()}</tbody>
        </table>
      </div>
    );
  }
}

export default GameMatrix;
