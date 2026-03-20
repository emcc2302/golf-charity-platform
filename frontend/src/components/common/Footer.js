import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">⛳ GOLF<span>GIVES</span></div>
          <p>Play golf. Support charities. Win prizes. A platform where every swing creates impact.</p>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/charities">Charities</Link>
          <Link to="/register">Join Now</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Log In</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/subscribe">Subscribe</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/rules">Draw Rules</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GolfGives. All rights reserved.</p>
        <p className="footer-tagline">Every subscription. Every swing. Every win — gives back.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
