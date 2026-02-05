import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col lg="6" md="8" sm="12" className="mb-4">
            <div className="logo">
              <img 
                src="/images/quadralogo.png" 
                alt="QUADRA COLLECTIVE" 
                className="footer__logo-image"
              />
              <p>
                QuadraCollective is a curated space for bold, original artwork and
                creative expression.
              </p>
              <p className="mb-0">
                <strong>Phone:</strong> +91 85904 66169
              </p>
              <p className="mb-0">
                <strong>Email:</strong> <a href="mailto:quadracollective@gmail.com">quadracollective@gmail.com</a>
              </p>
            </div>
          </Col>
          <Col lg="3" md="4" sm="12" className="mb-4">
            <h5>Instagram</h5>
            <div className="social__links d-flex gap-3 align-items-center">
              <span>
                <a
                  href="https://www.instagram.com/quadracollective_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="ri-instagram-line"></i>
                </a>
              </span>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
