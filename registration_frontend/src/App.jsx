import React from "react";
import { Route } from "react-router-dom";
import Confirmation from "./Confirmation";
import Registration from "./Registration";

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
          <h1>OOO --- DEF CON CTF Quals</h1>
        </div>
      </header>
      <div className="container">
        <Route exact path="/" component={Registration} />
        <Route path="/confirm/:confirmationId" component={Confirmation} />
      </div>
    </div>
  );
}
export default App;
