import React from 'react';
import { Link, Route } from 'react-router-dom';
import ChallengeMenu from './challenge_menu';
import Scoreboard from './scoreboard';

function App() {
  return (
    <div>
      <nav>
        <div className="nav-title">Order-of-the-Overflow</div>
        <input type="checkbox" id="nav-toggle" />
        <label htmlFor="nav-toggle" className="label-toggle">☰</label>
        <div className="nav-items">
          <Link to="/">A La Carte</Link>
          <Link to="/">Rules</Link>
          <Link to="/scoreboard">Scoreboard</Link>
        </div>
      </nav>
      <div>
        <div className="background">
          <div className="background-fade" />
          <div className="container">
            <Route exact path="/" component={ChallengeMenu} />
            <Route exact path="/scoreboard" component={Scoreboard} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
