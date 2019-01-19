import React from 'react';
import { Route } from 'react-router-dom';
import Confirmation from './Confirmation';
import Registration from './Registration';

function App() {
  return (
    <div>
      <header>
        <div className="container">
          <h1><a href="http://www.oooverflow.io/">OOO</a> --- DEF CON CTF Quals 2019</h1>
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
