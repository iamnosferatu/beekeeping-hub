// frontend/src/layouts/MainLayout.js
import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import ThemeSelector from "../components/theme/ThemeSelector";
import ApiStatusBar from "../components/common/ApiStatusBar";
import AlertBanner from "../components/common/AlertBanner";
import ThemeContext from "../contexts/ThemeContext";
import "./MainLayout.scss";

const MainLayout = () => {
  const { themeConfig } = useContext(ThemeContext);

  // Force re-import of components to fix "invalid element type" error
  const headerComponent = <Header />;
  const footerComponent = <Footer />;
  const sidebarComponent = <Sidebar />;
  const themeSelectorComponent = <ThemeSelector />;
  const apiStatusBarComponent = <ApiStatusBar />;
  const alertBannerComponent = <AlertBanner />;

  return (
    <div
      className="main-layout"
      style={{
        backgroundColor: themeConfig.bgColor,
        color: themeConfig.textColor,
        fontFamily: themeConfig.fontFamily,
      }}
    >
      {apiStatusBarComponent}
      {alertBannerComponent}
      {headerComponent}

      <Container fluid className="main-container py-4">
        <div className="row">
          <div className="col-lg-8 content-area">
            <Outlet />
          </div>

          <div className="col-lg-4 sidebar-area">
            {sidebarComponent}

            {/* Theme Selector */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Theme Settings</h5>
              </div>
              <div className="card-body">{themeSelectorComponent}</div>
            </div>
          </div>
        </div>
      </Container>

      {footerComponent}
    </div>
  );
};

export default MainLayout;
