// frontend/src/components/layout/Footer.js
import React, { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import ThemeContext from "../../contexts/ThemeContext";

const Footer = () => {
  const { themeConfig } = useContext(ThemeContext);
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto py-4"
      style={{
        backgroundColor: themeConfig.footerBg,
        color: themeConfig.footerText,
      }}
    >
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="mb-3">🐝 BeeKeeper Blog</h5>
            <p className="mb-0">
              A modern blog for beekeeping enthusiasts, sharing knowledge and
              experience about bees and honey production.
            </p>
          </Col>

          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/articles">Articles</Link>
              </li>
              <li>
                <Link to="/tags/beginner">Beginner Guides</Link>
              </li>
              <li>
                <Link to="/tags/equipment">Equipment</Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="mb-3">Contact</h5>
            <ul className="list-unstyled">
              <li>Email: info@beekeeperblog.com</li>
              <li>Twitter: @BeeKeeperBlog</li>
              <li>Facebook: /BeeKeeperBlog</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />

      <div className="footer-links">
          <Link to="/about">About Us</Link>
          <span className="mx-2">|</span>
          <Link to="/contact">Contact</Link>
          <span className="mx-2">|</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span className="mx-2">|</span>
          <Link to="/terms">Terms of Service</Link>
        </div>

        <div className="text-center">
          <p className="mb-0">
            &copy; {year} BeeKeeper Blog. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
