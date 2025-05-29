// frontend/src/layouts/AdminLayout.js
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container, Nav, Button, Navbar } from "react-bootstrap";
import {
  BsSpeedometer2,
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsGear,
  BsArrowLeft,
  BsList,
  BsX,
  BsTools,
  BsTag,
  BsEnvelope,
} from "react-icons/bs";
import AlertBanner from "../components/common/AlertBanner";
import "./AdminLayout.scss";

/**
 * AdminLayout Component
 *
 * Provides the layout structure for all admin pages with a collapsible sidebar
 * and full-width content area that adapts to sidebar state
 */
const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /**
   * Navigation items configuration
   */
  const navItems = [
    {
      path: "/admin",
      icon: <BsSpeedometer2 size={20} />,
      label: "Dashboard",
      exact: true,
    },
    {
      path: "/admin/articles",
      icon: <BsFileEarmarkText size={20} />,
      label: "Articles",
    },
    {
      path: "/admin/comments",
      icon: <BsChatSquareText size={20} />,
      label: "Comments",
    },
    {
      path: "/admin/tags",
      icon: <BsTag size={20} />,
      label: "Tags",
    },
    {
      path: "/admin/users",
      icon: <BsPeople size={20} />,
      label: "Users",
    },
    {
      path: "/admin/newsletter",
      icon: <BsEnvelope size={20} />,
      label: "Newsletter",
    },
    {
      path: "/admin/settings",
      icon: <BsGear size={20} />,
      label: "Settings",
    },
    {
      path: "/admin/diagnostics",
      icon: <BsTools size={20} />,
      label: "Diagnostics",
    },
  ];

  /**
   * Toggle sidebar collapse state
   */
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * Toggle mobile sidebar
   */
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  /**
   * Handle navigation for mobile
   */
  const handleMobileNavClick = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <AlertBanner />
      <div className="admin-layout">
      {/* Mobile Header */}
      <Navbar
        bg="dark"
        variant="dark"
        className="d-lg-none mobile-admin-header"
        fixed="top"
      >
        <Container fluid>
          <Button
            variant="link"
            className="text-white p-0 me-3"
            onClick={toggleMobileSidebar}
          >
            {mobileSidebarOpen ? <BsX size={24} /> : <BsList size={24} />}
          </Button>
          <Navbar.Brand>Admin Panel</Navbar.Brand>
        </Container>
      </Navbar>

      <div className="admin-layout-wrapper">
        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
            mobileSidebarOpen ? "mobile-open" : ""
          }`}
        >
          {/* Desktop Sidebar Header */}
          <div className="sidebar-header d-none d-lg-flex">
            <h5 className={`mb-0 ${sidebarCollapsed ? "d-none" : ""}`}>
              Admin Panel
            </h5>
            <Button
              variant="link"
              className="text-white ms-auto p-0"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <BsList size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <Nav className="flex-column">
            {navItems.map((item) => (
              <Nav.Item key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive && item.exact ? "active" : ""} ${
                      !item.exact &&
                      window.location.pathname.startsWith(item.path) &&
                      window.location.pathname !== "/admin"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={handleMobileNavClick}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span
                    className={`nav-label ${sidebarCollapsed ? "d-none" : ""}`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </Nav.Item>
            ))}
          </Nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer mt-auto">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate("/")}
              className={`w-100 ${sidebarCollapsed ? "px-2" : ""}`}
            >
              <BsArrowLeft className="me-2" />
              <span className={sidebarCollapsed ? "d-none" : ""}>
                Back to Site
              </span>
            </Button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div
            className="mobile-sidebar-overlay d-lg-none"
            onClick={toggleMobileSidebar}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`admin-content ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
        >
          <Container fluid className="p-4">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminLayout;
