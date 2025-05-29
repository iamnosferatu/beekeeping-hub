// frontend/src/components/common/BackToTopButton.js
import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsArrowUp } from "react-icons/bs";
import "./BackToTopButton.scss";

/**
 * Back to Top Button Component
 * 
 * A floating button that appears when user scrolls down
 * and smoothly scrolls back to top when clicked.
 */
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    
    // Clean up
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    setIsAnimating(true);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Reset animation state after scroll completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <>
      {isVisible && (
        <Button
          className={`back-to-top-button ${isAnimating ? "animating" : ""}`}
          onClick={scrollToTop}
          variant="primary"
          size="lg"
          aria-label="Back to top"
        >
          <BsArrowUp size={24} />
        </Button>
      )}
    </>
  );
};

export default BackToTopButton;