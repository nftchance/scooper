import React from "react";
import { Link } from "react-router-dom";

import logoImg from "../../images/logo.svg";

import "./Footer.css";

const Footer = () => { 
    return (
        <div className="container footer">
            <Link to="/" className="brand"><strong>
                <img src={logoImg} alt="logo" />
                Scooper
            </strong></Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/contact">Contact</Link>
            <a 
                href="https://twitter.com/nftchance" 
                target="_blank"
                rel="noreferrer"
            >A solution by <strong>CHANCE</strong></a>
        </div>
    )
}

export default Footer;