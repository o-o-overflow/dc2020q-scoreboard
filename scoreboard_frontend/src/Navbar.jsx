import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar(props) {
  const leftLinks = [
    ["Challenges", "/", true],
    ["Rules", "/rules"],
    ["Scoreboard", "/scoreboard"],
    ["Solves", "/solves"],
  ].map((item) => (
    <li className="nav-item" key={item[0]}>
      <NavLink className="nav-link" exact={item[2]} to={item[1]}>
        {item[0]}
      </NavLink>
    </li>
  ));

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
      <Link className="navbar-brand" to="/">
        DC28 Quals
      </Link>
      <div className="navbar-collapse">
        <ul className="navbar-nav mr-auto">{leftLinks}</ul>
      </div>
    </nav>
  );
}

export default Navbar;
