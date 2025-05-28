// frontend/src/components/layout/Header.js
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";
import ThemeContext from "../../contexts/ThemeContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { themeConfig } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Navbar
      expand="lg"
      className="navbar-light shadow-sm"
      style={{
        backgroundColor: themeConfig.navbarBg,
        color: themeConfig.navbarText,
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🐝 BeeKeeper Blog
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/articles">
              Articles
            </Nav.Link>
            {/* Add these new navigation items */}
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact
            </Nav.Link>
            {user && user.role === "author" && (
              <Nav.Link as={Link} to="/my-articles">
                My Articles
              </Nav.Link>
            )}
            {user && user.role === "admin" && (
              <Nav.Link as={Link} to="/admin">
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Form className="d-flex mx-auto" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search articles..."
              className="me-2"
              aria-label="Search"
              name="search"
            />
            <Button variant="outline-dark" type="submit">
              <BsSearch />
            </Button>
          </Form>

          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
