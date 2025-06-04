// frontend/src/components/common/EmptyState.examples.js
import React from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import EmptyState from "./EmptyState.enhanced";
import { BsRobot, BsGear } from "react-icons/bs";

/**
 * EmptyState Component Examples
 * 
 * Demonstrates various use cases for the enhanced EmptyState component
 */
export const EmptyStateExamples = () => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">Enhanced EmptyState Examples</h1>
      
      {/* Articles Empty States */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Article Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>No Articles</h5>
              <EmptyState.Articles />
            </Col>
            
            <Col md={6}>
              <h5>No Search Results</h5>
              <EmptyState.Articles 
                searchTerm="beekeeping tips"
                showSearchTips
              />
            </Col>
            
            <Col md={6}>
              <h5>No Articles in Tag</h5>
              <EmptyState.Articles 
                filterTag="equipment"
              />
            </Col>
            
            <Col md={6}>
              <h5>Combined Filters</h5>
              <EmptyState.Articles 
                searchTerm="honey"
                filterTag="harvesting"
                showSearchTips
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* My Articles Empty States */}
      <Card className="mb-4">
        <Card.Header>
          <h3>My Articles Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>No Draft Articles</h5>
              <EmptyState.MyArticles 
                filterStatus="draft"
              />
            </Col>
            
            <Col md={6}>
              <h5>No Published Articles</h5>
              <EmptyState.MyArticles 
                filterStatus="published"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Search Empty States */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Search Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>Search Results</h5>
              <EmptyState.Search 
                searchTerm="advanced beekeeping techniques"
              />
            </Col>
            
            <Col md={6}>
              <h5>User Search</h5>
              <EmptyState 
                type="users"
                searchTerm="john"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Forum Empty States */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Forum Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>No Forum Threads</h5>
              <EmptyState.Forum />
            </Col>
            
            <Col md={6}>
              <h5>No Threads in Category</h5>
              <EmptyState.Forum 
                filterCategory="General Discussion"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Interactive Features */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Interactive Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>Comments Empty State</h5>
              <EmptyState.Comments />
            </Col>
            
            <Col md={6}>
              <h5>With Suggestions</h5>
              <EmptyState 
                type="articles"
                showSuggestions
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Variants */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Display Variants</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={4}>
              <h5>Card Variant (Default)</h5>
              <EmptyState 
                type="bookmarks"
                variant="card"
              />
            </Col>
            
            <Col md={4}>
              <h5>Alert Variant</h5>
              <EmptyState 
                type="likes"
                variant="alert"
              />
            </Col>
            
            <Col md={4}>
              <h5>No Container</h5>
              <div className="border rounded p-3">
                <EmptyState 
                  type="contactMessages"
                  variant="none"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Custom Empty States */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Custom Empty States</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>Custom Icon and Message</h5>
              <EmptyState 
                icon={BsRobot}
                title="No Robots Found"
                message="Beep boop! No robots in the hive."
                actions={[
                  { label: "Build a Robot", onClick: () => alert('Building...') },
                  { label: "Import Robots", to: "/import" }
                ]}
              />
            </Col>
            
            <Col md={6}>
              <h5>Compact Mode</h5>
              <EmptyState 
                icon={BsGear}
                title="No Settings"
                message="Configure your preferences"
                compact
                primaryActionLabel="Open Settings"
                primaryActionOnClick={() => alert('Opening settings...')}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Advanced Features */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Advanced Features</h3>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <h5>With Custom Content</h5>
              <EmptyState 
                type="default"
                itemType="Notifications"
                message="You're all caught up!"
              >
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="mb-0 small text-muted">
                    Tip: Enable push notifications to stay updated
                  </p>
                </div>
              </EmptyState>
            </Col>
            
            <Col md={6}>
              <h5>With Form Integration</h5>
              <EmptyState 
                title="No Filters Applied"
                message="Use the form below to filter results"
                variant="alert"
                compact
              >
                <Form className="mt-3">
                  <Form.Group>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter search term..."
                      size="sm"
                    />
                  </Form.Group>
                </Form>
              </EmptyState>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

/**
 * Migration Examples
 * 
 * Shows how to migrate from basic to enhanced EmptyState
 */

// BEFORE - Basic EmptyState
export const BeforeEmptyState = () => {
  return (
    <EmptyState
      icon={BsFileEarmarkText}
      title="No Articles Found"
      message="Try searching with different keywords"
      action={
        <Button variant="primary">Browse All Articles</Button>
      }
    />
  );
};

// AFTER - Enhanced EmptyState
export const AfterEmptyState = () => {
  return (
    <EmptyState
      type="articles"
      searchTerm="beekeeping"
      showSearchTips
      showSuggestions
    />
  );
};

// AFTER - With Custom Actions
export const AfterWithCustomActions = () => {
  return (
    <EmptyState
      type="articles"
      searchTerm="honey production"
      actions={[
        { 
          label: "Clear Search", 
          onClick: () => console.log('Clearing...'),
          variant: "outline-secondary" 
        },
        { 
          label: "Browse Topics", 
          to: "/tags",
          icon: BsTag 
        },
        { 
          label: "Create Article", 
          to: "/editor/new",
          icon: BsPlus,
          variant: "success" 
        }
      ]}
    />
  );
};

export default EmptyStateExamples;