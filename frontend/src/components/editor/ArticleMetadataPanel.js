// frontend/src/components/editor/ArticleMetadataPanel.js
import React from "react";
import { Card, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsQuestionCircle } from "react-icons/bs";
import TagSelector from "./TagSelector";

const ArticleMetadataPanel = ({
  formData,
  handleInputChange,
  handleTagsChange,
  placeholderImage,
}) => (
  <>
    {/* Status Card */}
    <Card className="mb-4">
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={formData.blocked}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Form.Select>
        </Form.Group>
      </Card.Body>
    </Card>

    {/* Featured Image Card */}
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Featured Image</h5>
      </Card.Header>
      <Card.Body>
        <div className="featured-image-preview mb-3">
          <img
            src={formData.featured_image || placeholderImage}
            alt="Featured preview"
            className="img-fluid rounded"
            style={{
              height: "200px",
              width: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <Form.Group>
          <Form.Label>
            Image URL
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  Enter the URL of an image to use as the featured image for
                  this article
                </Tooltip>
              }
            >
              <BsQuestionCircle className="ms-2 text-muted" />
            </OverlayTrigger>
          </Form.Label>
          <Form.Control
            type="text"
            name="featured_image"
            value={formData.featured_image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          <Form.Text className="text-muted">
            Recommended size: 1200x400 pixels
          </Form.Text>
        </Form.Group>
      </Card.Body>
    </Card>

    {/* Tags Card */}
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Tags</h5>
      </Card.Header>
      <Card.Body>
        <TagSelector selectedTags={formData.tags} onChange={handleTagsChange} />
        <Form.Text className="text-muted">
          Tags help users find your article. Add up to 5 tags.
        </Form.Text>
      </Card.Body>
    </Card>
  </>
);

export default ArticleMetadataPanel;
