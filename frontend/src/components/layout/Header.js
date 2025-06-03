// frontend/src/components/layout/Header.js
import React, { useContext, memo, useCallback, useEffect } from "react";
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
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import { trackNavRender } from "../../utils/navigationPerformance";

const Header = memo(() => {
  const { user, logout } = useContext(AuthContext);
  const { themeConfig } = useContext(ThemeContext);
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  // Track renders in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      trackNavRender('Header');
    }
  });

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  }, [navigate]);

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
          🐝 BeeKeeper's Blog
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
            {settings?.forum_enabled && user && (
              <Nav.Link as={Link} to="/forum">
                Forum
              </Nav.Link>
            )}
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
});

Header.displayName = 'Header';

// Memoize Header to prevent unnecessary re-renders
export default React.memo(Header);
