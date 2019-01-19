import React from 'react';
import Counter from './counter';

function App() {
  return (
    <div>
      <header>
        <div className="container">
          <h1><a href="http://www.oooverflow.io/">OOO</a> --- DEF CON CTF 2019</h1>
        </div>
      </header>
      <div className="container">
        <h1>Countdown to DEF CON CTF Quals</h1>
        <Counter startTime={1557532800} />
      </div>
    </div>
  );
}
export default App;
