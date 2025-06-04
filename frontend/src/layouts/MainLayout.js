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
import AdBlock from "../components/ads/AdBlock";
import EnhancedBreadcrumbs from "../components/common/EnhancedBreadcrumbs";
import { AD_PLACEMENTS } from "../utils/adManager";
import ThemeContext from "../contexts/ThemeContext";
import "./MainLayout.scss";
import "../components/ads/AdBlock.scss";
import "../components/common/Breadcrumbs.scss";

const MainLayout = () => {
  const { themeConfig } = useContext(ThemeContext) || {};

  // Provide default theme config if undefined
  const theme = themeConfig || {
    bgColor: "#ffffff",
    textColor: "#212529",
    fontFamily: "'Open Sans', sans-serif",
  };

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
        backgroundColor: theme.bgColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      {apiStatusBarComponent}
      
      {/* Top banner advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.BANNER_TOP}
        className="container-fluid"
        pageType="general"
      />
      
      {headerComponent}

      <Container fluid className="main-container py-4">
        <div className="row">
          <div className="col-lg-8 content-area">
            {alertBannerComponent}
            <EnhancedBreadcrumbs />
            <Outlet />
          </div>

          <div className="col-lg-4 sidebar-area">
            {/* Top sidebar advertisement */}
            <AdBlock 
              placement={AD_PLACEMENTS.SIDEBAR_TOP}
              className="mb-4"
              pageType="general"
            />
            
            {sidebarComponent}

            {/* Theme Selector */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Theme Settings</h5>
              </div>
              <div className="card-body">{themeSelectorComponent}</div>
            </div>
            
            {/* Bottom sidebar advertisement */}
            <AdBlock 
              placement={AD_PLACEMENTS.SIDEBAR_BOTTOM}
              pageType="general"
            />
          </div>
        </div>
      </Container>
      
      {/* Bottom banner advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.BANNER_BOTTOM}
        className="container-fluid"
        pageType="general"
      />

      {footerComponent}
      
      {/* Mobile sticky advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.MOBILE_STICKY}
        pageType="general"
      />
    </div>
  );
};

export default MainLayout;
