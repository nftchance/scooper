import React from "react";
import { Link } from "react-router-dom";

import logoImg from "../../images/logo.svg";

import "./Navbar.css";

const Navbar = () => {
    return (
        <div className="container navbar">
            <Link to="/" className="brand"><strong>
                <img src={logoImg} alt="logo" />
                Scooper
            </strong></Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/dashboard">Dashboard</Link>
        </div>
    )
}

export default Navbar;