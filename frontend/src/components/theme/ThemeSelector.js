// frontend/src/components/theme/ThemeSelector.js
import React, { useContext } from "react";
import { Row, Col } from "react-bootstrap";
import ThemeContext from "../../contexts/ThemeContext";

const ThemeSelector = () => {
  const { currentTheme, themes, changeTheme } = useContext(ThemeContext);

  return (
    <div className="theme-selector">
      <p className="mb-3">Choose a theme for the blog:</p>

      <Row xs={2} md={4} className="g-3">
        {Object.keys(themes).map((themeName) => (
          <Col key={themeName}>
            <div
              className={`theme-option p-2 text-center ${
                currentTheme === themeName ? "active" : ""
              }`}
              onClick={() => changeTheme(themeName)}
            >
              <div
                className="theme-preview mb-2"
                style={{
                  height: "30px",
                  backgroundColor: themes[themeName].primaryColor,
                  borderRadius: themes[themeName].borderRadius,
                }}
              ></div>
              <small>{themes[themeName].name}</small>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ThemeSelector;
