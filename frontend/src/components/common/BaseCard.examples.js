// frontend/src/components/common/BaseCard.examples.js
import React, { useState } from "react";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import { 
  BsFileEarmarkText, 
  BsChatSquare, 
  BsPeople, 
  BsGear,
  BsHeart,
  BsEye,
  BsThreeDots,
  BsDownload,
  BsShare
} from "react-icons/bs";
import BaseCard from "./BaseCard";
import "./BaseCard.scss";

/**
 * BaseCard Component Examples
 * 
 * Demonstrates various use cases for the BaseCard component
 */
export const BaseCardExamples = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Sample data
  const sampleArticle = {
    id: 1,
    title: "Getting Started with Beekeeping",
    slug: "getting-started-with-beekeeping",
    excerpt: "Learn the basics of beekeeping, from choosing the right equipment to setting up your first hive. This comprehensive guide covers everything beginners need to know.",
    featured_image: "https://via.placeholder.com/400x300",
    author: { username: "JohnDoe", id: 1 },
    created_at: new Date().toISOString(),
    view_count: 1234,
    status: "published"
  };
  
  const sampleUser = {
    id: 1,
    username: "jane_beekeeper",
    email: "jane@example.com",
    role: "author",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">BaseCard Component Examples</h1>
      
      {/* Basic Cards */}
      <section className="mb-5">
        <h2 className="mb-3">Basic Cards</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Simple Card</h5>
            <BaseCard>
              This is a simple card with just content.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Card with Title</h5>
            <BaseCard title="Card Title">
              Card content goes here. It can be any React content.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Card with Title & Subtitle</h5>
            <BaseCard 
              title="Main Title" 
              subtitle="Supporting subtitle text"
            >
              Card body content with more details.
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Cards with Images */}
      <section className="mb-5">
        <h2 className="mb-3">Cards with Images</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Image Top</h5>
            <BaseCard
              title="Beautiful Landscape"
              image="https://via.placeholder.com/400x200"
              imageAlt="Landscape"
            >
              Card with image at the top. Perfect for blog posts or galleries.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Image Left</h5>
            <BaseCard
              title="Horizontal Card"
              image="https://via.placeholder.com/150x150"
              imagePosition="left"
              imageHeight={150}
            >
              Content flows to the right of the image in this layout.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Image with Overlay</h5>
            <BaseCard
              title="Featured Content"
              image="https://via.placeholder.com/400x200"
              imageOverlay={
                <div className="p-3 text-white bg-dark bg-opacity-50">
                  <h5 className="mb-0">Overlay Text</h5>
                </div>
              }
            >
              Image with custom overlay content.
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Interactive Cards */}
      <section className="mb-5">
        <h2 className="mb-3">Interactive Cards</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Clickable Card</h5>
            <BaseCard
              title="Click Me!"
              onClick={() => alert('Card clicked!')}
              hoverable
            >
              This entire card is clickable. Try hovering and clicking.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Link Card</h5>
            <BaseCard
              title="React Router Link"
              to="/articles/sample"
              hoverable
              badge={{ text: "New", variant: "success" }}
            >
              This card navigates using React Router when clicked.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>External Link</h5>
            <BaseCard
              title="External Website"
              href="https://example.com"
              hoverable
              badge={{ text: "External", variant: "info" }}
            >
              Opens in a new tab with proper security attributes.
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Cards with Badges */}
      <section className="mb-5">
        <h2 className="mb-3">Cards with Badges</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Single Badge</h5>
            <BaseCard
              title="Special Offer"
              badge={{ text: "Limited Time", variant: "danger" }}
            >
              Card with a single badge in the header.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Multiple Badges</h5>
            <BaseCard
              title="Premium Content"
              badges={[
                { text: "Featured", variant: "primary" },
                { text: "Popular", variant: "success", pill: true },
                { text: "5", variant: "danger", icon: <BsHeart /> }
              ]}
            >
              Card can display multiple badges with icons.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Header Actions</h5>
            <BaseCard
              title="With Actions"
              headerActions={
                <ButtonGroup size="sm">
                  <Button variant="outline-secondary">
                    <BsDownload />
                  </Button>
                  <Button variant="outline-secondary">
                    <BsShare />
                  </Button>
                  <Button variant="outline-secondary">
                    <BsThreeDots />
                  </Button>
                </ButtonGroup>
              }
            >
              Header can include action buttons.
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Card States */}
      <section className="mb-5">
        <h2 className="mb-3">Card States</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Loading State</h5>
            <BaseCard
              title="Loading Card"
              loading
              loadingText="Fetching data..."
            >
              This content won't show while loading.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Selected State</h5>
            <BaseCard
              title="Selectable Card"
              selected={selectedCard === 1}
              onClick={() => setSelectedCard(selectedCard === 1 ? null : 1)}
              hoverable
            >
              Click to select/deselect this card.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Disabled State</h5>
            <BaseCard
              title="Disabled Card"
              subtitle="Cannot be clicked"
              disabled
              onClick={() => alert('This won\'t fire')}
              badge={{ text: "Disabled", variant: "secondary" }}
            >
              This card is disabled and cannot be interacted with.
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Styling Options */}
      <section className="mb-5">
        <h2 className="mb-3">Styling Options</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>No Border</h5>
            <BaseCard
              title="Borderless"
              border={false}
              className="bg-light"
            >
              Card without border, with light background.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>Large Shadow</h5>
            <BaseCard
              title="Elevated Card"
              shadow="lg"
            >
              Card with large shadow for more elevation.
            </BaseCard>
          </Col>
          
          <Col md={4}>
            <h5>No Padding</h5>
            <BaseCard
              title="Full Width Content"
              padding={false}
              footer={
                <div className="p-3 bg-light">
                  Custom padded footer
                </div>
              }
            >
              <div className="p-3 bg-primary text-white">
                Content with custom padding
              </div>
            </BaseCard>
          </Col>
        </Row>
      </section>
      
      {/* Preset Cards */}
      <section className="mb-5">
        <h2 className="mb-3">Preset Card Types</h2>
        <Row className="g-4">
          <Col md={4}>
            <h5>Article Card</h5>
            <BaseCard.Article 
              article={sampleArticle}
              height="full"
            />
          </Col>
          
          <Col md={4}>
            <h5>Stats Card</h5>
            <BaseCard.Stats
              title="Total Articles"
              value="1,234"
              icon={BsFileEarmarkText}
              trend={12.5}
            />
          </Col>
          
          <Col md={4}>
            <h5>User Card</h5>
            <BaseCard.User
              user={sampleUser}
              actions={
                <Button size="sm" variant="outline-primary">
                  View Profile
                </Button>
              }
            />
          </Col>
        </Row>
      </section>
      
      {/* Complex Examples */}
      <section className="mb-5">
        <h2 className="mb-3">Complex Examples</h2>
        <Row className="g-4">
          <Col md={6}>
            <h5>Dashboard Stats Card</h5>
            <BaseCard
              header={
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Monthly Overview</h5>
                  <select className="form-select form-select-sm w-auto">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
              }
              footer={
                <div className="d-flex justify-content-around text-center">
                  <div>
                    <h6 className="mb-0">234</h6>
                    <small className="text-muted">Articles</small>
                  </div>
                  <div>
                    <h6 className="mb-0">1.2k</h6>
                    <small className="text-muted">Comments</small>
                  </div>
                  <div>
                    <h6 className="mb-0">5.6k</h6>
                    <small className="text-muted">Views</small>
                  </div>
                </div>
              }
            >
              <div className="text-center py-4">
                <h2 className="display-4 mb-0">89%</h2>
                <p className="text-muted">Engagement Rate</p>
              </div>
            </BaseCard>
          </Col>
          
          <Col md={6}>
            <h5>Feature Card</h5>
            <BaseCard
              image="https://via.placeholder.com/600x200"
              imageHeight={200}
              badges={[
                { text: "Premium", variant: "warning" },
                { text: "Trending", variant: "danger" }
              ]}
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-3">
                    <span><BsEye /> 1.2k views</span>
                    <span><BsHeart /> 234 likes</span>
                    <span><BsChatSquare /> 45 comments</span>
                  </div>
                  <Button size="sm" variant="primary">
                    Read More
                  </Button>
                </div>
              }
            >
              <h4>Advanced Beekeeping Techniques</h4>
              <p className="text-muted">
                Discover professional methods for managing your hives and maximizing honey production.
              </p>
              <div className="d-flex gap-2">
                <Badge bg="light" text="dark">Beekeeping</Badge>
                <Badge bg="light" text="dark">Advanced</Badge>
                <Badge bg="light" text="dark">Tutorial</Badge>
              </div>
            </BaseCard>
          </Col>
        </Row>
      </section>
    </Container>
  );
};

export default BaseCardExamples;