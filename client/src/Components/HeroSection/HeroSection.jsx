import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./hero-section.css";

const HeroSection = () => {
  return (
    <section className="hero__section">
      <Container>
        <Row>
          <Col lg="9" md="9">
            <div className="hero__content">
              <h2>
                Quadra Collective is an intimate art workspace by Anandhu, where emotions are sculpted into frames, forms, and handcrafted pieces that speak directly to the spaces they inhabit.
                <span>Every piece is collectable</span>, born from genuine feeling—crafted with intention, shaped by hand, and infused with soul.
              </h2>
              <p>
                Each artwork is entirely unique. These creations fill the silent voids of empty spaces, giving them personality, warmth, and story. Quadra is not just art—it's emotion made tangible, crafted to transform space into meaning.
              </p>

              <div className="hero__btns d-flex align-items-center gap-4">
                <button className=" explore__btn d-flex align-items-center gap-2">
                  <i className="ri-arrow-down-line"></i>{" "}
                  <a href="#artwork" style={{ textDecoration: 'none', color: 'inherit' }}>View Artwork</a>
                </button>
              </div>
            </div>
          </Col>

          <Col lg="6" md="6">
           
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
