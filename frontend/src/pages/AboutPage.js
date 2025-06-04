// frontend/src/pages/AboutPage.js
import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BsHeart,
  BsPeople,
  BsAward,
  BsGlobe,
  BsTreeFill,
  BsShieldCheck,
} from "react-icons/bs";
import { SEO } from "../contexts/SEOContext";
import "./AboutPage.scss";

/**
 * AboutPage Component
 *
 * Displays information about the BeeKeeper's Blog, including mission,
 * values, team, and history. Uses Bootstrap components for consistent
 * styling with the rest of the application.
 */
const AboutPage = () => {
  // Update page title when component mounts
  useEffect(() => {
    document.title = "About Us - BeeKeeper's Blog";
  }, []);

  // Team members data - in a real app, this might come from an API
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & Master Beekeeper",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      bio: "With over 20 years of beekeeping experience, Sarah founded BeeKeeper's Blog to share knowledge with the community.",
    },
    {
      name: "Michael Chen",
      role: "Head of Content",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Michael ensures all our content is accurate, engaging, and helpful for beekeepers at all levels.",
    },
    {
      name: "Emma Williams",
      role: "Community Manager",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Emma connects with our community, organizing events and managing our social presence.",
    },
  ];

  // Values data
  const values = [
    {
      icon: <BsHeart size={40} />,
      title: "Passion for Bees",
      description:
        "We're driven by our love for bees and their crucial role in our ecosystem.",
    },
    {
      icon: <BsPeople size={40} />,
      title: "Community First",
      description:
        "Building a supportive community where beekeepers help each other succeed.",
    },
    {
      icon: <BsAward size={40} />,
      title: "Quality Content",
      description:
        "Providing accurate, research-based information you can trust.",
    },
    {
      icon: <BsGlobe size={40} />,
      title: "Environmental Impact",
      description:
        "Promoting sustainable beekeeping practices for a healthier planet.",
    },
  ];

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about BeeKeeper's Hub - your trusted resource for beekeeping knowledge. Discover our mission, values, and the passionate team dedicated to supporting beekeepers worldwide."
        type="website"
      />
      <div className="about-page">
        {/* Hero Section */}
      <div className="hero-section text-center py-5 mb-5">
        <Container>
          <h1 className="display-4 mb-4">About BeeKeeper's Blog</h1>
          <p className="lead">
            Connecting beekeepers worldwide through knowledge, experience, and
            passion
          </p>
        </Container>
      </div>

      <Container>
        {/* Mission Section */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <BsTreeFill size={50} className="text-warning mb-3" />
                  <h2>Our Mission</h2>
                </div>
                <p className="lead text-center">
                  To empower beekeepers of all experience levels with the
                  knowledge, resources, and community support they need to
                  maintain healthy, productive hives while contributing to
                  environmental conservation.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Story Section */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">Our Story</h2>
            <Row>
              <Col lg={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h4>The Beginning</h4>
                    <p>
                      BeeKeeper's Blog started in 2018 when a group of passionate
                      beekeepers realized there was a need for a centralized
                      platform where both beginners and experienced beekeepers
                      could share knowledge, ask questions, and learn from each
                      other's experiences.
                    </p>
                    <p>
                      What began as a simple blog has grown into a thriving
                      community of thousands of beekeepers from around the
                      world, all united by their love for these remarkable
                      insects.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h4>Today</h4>
                    <p>
                      Today, BeeKeeper's Blog is one of the most trusted resources
                      for beekeeping information online. We publish articles on
                      everything from hive management and honey harvesting to
                      bee health and environmental conservation.
                    </p>
                    <p>
                      Our community includes hobbyists with a single hive in
                      their backyard to commercial beekeepers managing hundreds
                      of colonies. What unites us all is our commitment to the
                      welfare of bees and the environment.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Values Section */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">Our Values</h2>
            <Row>
              {values.map((value, index) => (
                <Col md={6} lg={3} key={index} className="mb-4">
                  <Card className="h-100 text-center shadow-sm value-card">
                    <Card.Body>
                      <div className="text-warning mb-3">{value.icon}</div>
                      <h5>{value.title}</h5>
                      <p className="text-muted">{value.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Team Section */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">Meet Our Team</h2>
            <Row>
              {teamMembers.map((member, index) => (
                <Col lg={4} key={index} className="mb-4">
                  <Card className="h-100 shadow-sm team-card">
                    <div className="team-member-image">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-100"
                      />
                    </div>
                    <Card.Body className="text-center">
                      <h4>{member.name}</h4>
                      <p className="text-warning mb-3">{member.role}</p>
                      <p className="text-muted">{member.bio}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Community Impact Section */}
        <Row className="mb-5">
          <Col>
            <Card className="bg-light border-0 shadow-sm">
              <Card.Body className="p-5 text-center">
                <BsShieldCheck size={50} className="text-success mb-3" />
                <h3>Our Impact</h3>
                <Row className="mt-4">
                  <Col md={3} className="mb-3">
                    <h2 className="text-primary mb-0">10,000+</h2>
                    <p className="text-muted">Active Members</p>
                  </Col>
                  <Col md={3} className="mb-3">
                    <h2 className="text-primary mb-0">500+</h2>
                    <p className="text-muted">Articles Published</p>
                  </Col>
                  <Col md={3} className="mb-3">
                    <h2 className="text-primary mb-0">50+</h2>
                    <p className="text-muted">Expert Contributors</p>
                  </Col>
                  <Col md={3} className="mb-3">
                    <h2 className="text-primary mb-0">1M+</h2>
                    <p className="text-muted">Bees Protected</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="mb-5">
          <Col className="text-center">
            <h3>Join Our Community</h3>
            <p className="lead mb-4">
              Whether you're just starting out or have years of experience,
              there's a place for you in our community.
            </p>
            <div>
              <a href="/register" className="btn btn-primary btn-lg me-3">
                Get Started
              </a>
              <a href="/articles" className="btn btn-outline-primary btn-lg">
                Browse Articles
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
    </>
  );
};

export default AboutPage;
