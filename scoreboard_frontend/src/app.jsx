import React from 'react';
import { Route } from 'react-router-dom';
import ChallengeMenu from './challenge_menu';

function App() {
  return (
    <div>
      <div>
        <Route exact path="/" component={ChallengeMenu} />
      </div>
    </div>
  );
}
export default App;
