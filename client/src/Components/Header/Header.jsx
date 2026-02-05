import React, { useRef, useEffect, useState } from "react";
import "./header.css";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const NAV__LINKS = [
  {
    display: "Home",
    url: "/",
  },
];

const Header = () => {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
      window.addEventListener("scroll", () => {
        if (
          document.body.scrollTop > 80 ||
          document.documentElement.scrollTop > 80
        ) {
          document.getElementById("head").classList.add("header__shrink");
        } else {
          document.getElementById("head").classList.remove("header__shrink");
        }
    });
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle("active__menu");

  return (
    <header className="header" id="head" ref={headerRef}>
      <Container>
        <div className="navigation">
          <div className="logo">
            <img 
              src="/images/quadralogo.png" 
              alt="QUADRA COLLECTIVE" 
              className="logo__image"
            />
          </div>

          <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
            <ul className="nav__list">
              {NAV__LINKS.map((item, index) => (
                <li className="nav__item" key={index}>
                  <NavLink
                    to={item.url}
                    className={(navClass) =>
                      navClass.isActive ? "active" : ""
                    }
                  >
                    {item.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <span className="mobile__menu">
            <i className="ri-menu-line" onClick={toggleMenu}></i>
          </span>
        </div>
      </Container>
    </header>
  );
};

export default Header;
