import React from 'react';
import Counter from './counter';

function App() {
  return (
    <div>
      <header>
        <div className="container">
          <h1><a href="http://www.oooverflow.io/">OOO</a> --- DEF CON CTF 2018</h1>
        </div>
      </header>
      <div className="container">
        <h1>Countdown to DEF CON Quals 2018</h1>
        <Counter startTime={1526083200} />
      </div>
    </div>
  );
}
export default App;
