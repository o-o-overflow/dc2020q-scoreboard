import PropTypes from "prop-types";
import exact from "prop-types-exact";
import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar(props) {
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
            <button
                type="button"
                className="btn btn-link nav-link"
                onClick={props.handleOpenLogInModal}
            >
                Log In
            </button>
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
Navbar.propTypes = exact({
    authenticated: PropTypes.bool.isRequired,
    handleOpenLogInModal: PropTypes.func.isRequired,
    handleLogOut: PropTypes.func.isRequired,
    team: PropTypes.string.isRequired
});

export default Navbar;
