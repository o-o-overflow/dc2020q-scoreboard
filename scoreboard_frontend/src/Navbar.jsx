import PropTypes from "prop-types";
import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar(context, props) {
    const registerLink = props.team ? null : (
        <a className="nav-link" href="https://register.oooverflow.io">
            Register
        </a>
    );

    let tokenLink;

    if (props.authenticated) {
        tokenLink = (
            <Link className="nav-link" onClick={props.handleLogOut} to="#">
                Log Out {props.team}
            </Link>
        );
    } else {
        tokenLink = (
            <Link
                className="nav-link"
                onClick={props.handleOpenLogInModal}
                to="#"
            >
                Log In
            </Link>
        );
    }

    const leftLinks = [
        ["Challenges", "/", true],
        ["Rules", "/rules"],
        ["Scoreboard", "/scoreboard"],
        ["Solves", "/solves"]
    ].map(item => (
        <li className="nav-item" key={item[0]}>
            <NavLink className="nav-link" exact={item[2]} to={item[1]}>
                {item[0]}
            </NavLink>
        </li>
    ));

    const rightLinks = [tokenLink, registerLink].map((link, index) => (
        <li className="nav-item" key={`rn-${index}`}>
            {link}
        </li>
    ));

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
            <Link className="navbar-brand" to="/">
                DC28 Quals
            </Link>
            <div className="navbar-collapse">
                <ul className="navbar-nav mr-auto">{leftLinks}</ul>
                <ul className="navbar-nav ml-auto">{rightLinks}</ul>
            </div>
        </nav>
    );
}
Navbar.propTypes = {
    authenticated: PropTypes.bool.isRequired
};

export default Navbar;
