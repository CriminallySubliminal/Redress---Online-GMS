import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-logo">
            <img src={logoImg} alt="Redress logo" className="footer-logo-img" />
            <h3>Redress</h3>
          </div>
          <p>Accountability Through Action. Empowering student voices with transparency.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/submit">Submit Grievance</Link></li>
            <li><Link to="/my-grievances">My Issues</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Guidelines</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 Redress. All rights reserved.</span>
        <div className="footer-social">
          <a href="#" aria-label="Share">
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>share</span>
          </a>
          <a href="#" aria-label="Email">
            <span className="material-icons-outlined" style={{ fontSize: 18 }}>mail</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
