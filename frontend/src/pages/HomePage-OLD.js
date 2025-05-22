// frontend/src/pages/HomePage.js
import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ArticleList from "../components/articles/ArticleList";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <Card className="text-center bg-dark text-white mb-4 border-0">
        <Card.Img
          src="https://images.unsplash.com/photo-1576594770476-b1bed9a42275?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
          alt="Bees on honeycomb"
          className="hero-image"
          style={{ height: "400px", objectFit: "cover", opacity: 0.7 }}
        />
        <Card.ImgOverlay className="d-flex flex-column justify-content-center">
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h1 className="display-4 fw-bold">Welcome to BeeKeeper Blog</h1>
            <p className="lead">A modern resource for beekeeping enthusiasts</p>
            <Link to="/articles">
              <Button variant="warning" size="lg" className="mt-3">
                Explore Articles
              </Button>
            </Link>
          </div>
        </Card.ImgOverlay>
      </Card>

      {/* Introduction */}
      <div className="bg-dark p-4 rounded-3 mb-4">
        <h2>About Our Blog</h2>
        <p>
          BeeKeeper Blog is dedicated to sharing knowledge about beekeeping,
          honey production, and the crucial role of bees in our ecosystem.
          Whether you're a beginner looking to start your first hive or an
          experienced beekeeper seeking advanced techniques, our articles
          provide valuable insights from experts in the field.
        </p>
        <p className="mb-0">
          Join our community of beekeepers and enthusiasts to learn, share
          experiences, and contribute to the wonderful world of beekeeping!
        </p>
      </div>

      {/* Featured Articles */}
      <h2 className="mb-4">Latest Articles</h2>
      <ArticleList />

      {/* Call to Action */}
      <div className="text-center my-5">
        <h3>Want to share your beekeeping experience?</h3>
        <p>We welcome contributions from the community!</p>
        <Button
          variant="outline-primary"
          as={Link}
          to="/register"
          className="me-2"
        >
          Register
        </Button>
        <Button variant="primary" as={Link} to="/login">
          Login
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
