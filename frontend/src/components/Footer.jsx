import "../styles/Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <h2>PGs Finder</h2>
          <p>
            Discover verified PGs, flats & rooms. Simplifying rentals for modern
            users.
          </p>

          <div className="social-icons">
            <span>
              <a
                href="https://www.facebook.com/avisingh.0703984786"
                target="blank"
              >
                <FaFacebookF />
              </a>
            </span>
            <span>
              <a
                href="https://www.instagram.com/whoavikashyap.73"
                target="blank"
              >
                <FaInstagram />
              </a>
            </span>
            <span>
              <a href="https://www.twitter.com/whoavikashyap.73" target="blank">
                <FaTwitter />
              </a>
            </span>
            <span>
              <a
                href="https://www.linkedin.com/in/abhigyan-kumar-2aa944234/"
                target="blank"
              >
                <FaLinkedin />
              </a>
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/listings">Listings</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <a href="/listings">Find PG</a>
          <a href="/listings">Find Flats</a>
          <a href="/login">Post Property</a>
          <a href="/login">Login</a>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact</h3>
          <p>Email: support@pgfinder.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Yoo Rental | Made with ❤️ in India</p>
      </div>
    </footer>
  );
}

export default Footer;
