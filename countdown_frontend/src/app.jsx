import React from "react";
import Counter from "./counter";

function App() {
  return (
    <div>
      <header>
        <div className="container">
          <a href="http://www.oooverflow.io/">
            <img
              alt="OOO logo"
              src={process.env.PUBLIC_URL + "ooo-logo-175.png"}
            />
          </a>
          <h1>OOO --- DEF CON CTF 2019</h1>
        </div>
      </header>
      <div className="container">
        <h1>Countdown to DEF CON CTF Quals</h1>
        <Counter startTime={1585353600} />
      </div>
    </div>
  );
}
export default App;
