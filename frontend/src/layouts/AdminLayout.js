// frontend/src/layouts/AdminLayout.js
import React, { useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Nav, Navbar, Button } from "react-bootstrap";
import {
  BsSpeedometer2,
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsGear,
  BsHouseDoor,
  BsTools,
} from "react-icons/bs";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import "./AdminLayout.scss";

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { themeConfig } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="admin-layout"
      style={{
        backgroundColor: themeConfig.bgColor,
        color: themeConfig.textColor,
        fontFamily: themeConfig.fontFamily,
        minHeight: "100vh",
      }}
    >
      {/* Admin Header */}
      <Navbar
        expand="lg"
        variant="dark"
        className="admin-navbar"
        style={{ backgroundColor: "#343a40" }}
      >
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin" className="fw-bold">
            🐝 BeeKeeper Admin
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="admin-navbar-nav" />

          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="d-flex align-items-center">
                <BsHouseDoor className="me-1" /> Back to Site
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              {user && (
                <>
                  <Navbar.Text className="me-3">
                    Signed in as: <strong>{user.username}</strong>
                  </Navbar.Text>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="admin-container">
        <Row>
          {/* Sidebar */}
          <Col md={3} lg={2} className="admin-sidebar px-0">
            <Nav className="flex-column py-3">
              <Nav.Link
                as={Link}
                to="/admin"
                className={`sidebar-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                <BsSpeedometer2 className="me-2" /> Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/articles"
                className={`sidebar-link ${
                  location.pathname === "/admin/articles" ? "active" : ""
                }`}
              >
                <BsFileEarmarkText className="me-2" /> Articles
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/comments"
                className={`sidebar-link ${
                  location.pathname === "/admin/comments" ? "active" : ""
                }`}
              >
                <BsChatSquareText className="me-2" /> Comments
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/users"
                className={`sidebar-link ${
                  location.pathname === "/admin/users" ? "active" : ""
                }`}
              >
                <BsPeople className="me-2" /> Users
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/settings"
                className={`sidebar-link ${
                  location.pathname === "/admin/settings" ? "active" : ""
                }`}
              >
                <BsGear className="me-2" /> Settings
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/diagnostics"
                className={`sidebar-link ${
                  location.pathname === "/admin/diagnostics" ? "active" : ""
                }`}
              >
                <BsTools className="me-2" /> Diagnostics
              </Nav.Link>
            </Nav>
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="admin-content p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;
