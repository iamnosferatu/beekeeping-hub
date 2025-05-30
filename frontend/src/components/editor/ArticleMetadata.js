// frontend/src/components/editor/ArticleMetadata.js
import React, { useState, useEffect } from "react";
import { Card, Form, Badge, InputGroup } from "react-bootstrap";
import { BsX } from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import ImageUploadButton from "./ImageUploadButton";
import { getImageUrl } from "../../utils/imageHelpers";

/**
 * ArticleMetadata Component
 *
 * Manages article metadata including featured image, status, and tags
 */
const ArticleMetadata = ({ formData, onInputChange, onTagsChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Fetch available tags from the backend
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_URL}/tags`);
        if (response.data.success) {
          setAvailableTags(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  /**
   * Add tag to article
   */
  const addTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      onTagsChange([...formData.tags, trimmedTag]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  /**
   * Remove tag from article
   */
  const removeTag = (tagToRemove) => {
    onTagsChange(formData.tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * Handle tag input key press
   */
  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  /**
   * Filter tag suggestions based on input
   */
  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !formData.tags.includes(tag.name)
  );

  /**
   * Handle featured image upload
   */
  const handleFeaturedImageUploaded = ({ url }) => {
    onInputChange({ target: { name: 'featured_image', value: url } });
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Article Settings</h5>
      </Card.Header>
      <Card.Body>
        {/* Featured Image URL */}
        <Form.Group className="mb-4">
          <Form.Label>Featured Image</Form.Label>
          <InputGroup>
            <Form.Control
              type="url"
              name="featured_image"
              value={formData.featured_image}
              onChange={onInputChange}
              placeholder="https://example.com/image.jpg or upload"
            />
            <ImageUploadButton 
              onImageUploaded={handleFeaturedImageUploaded}
              variant="outline-secondary"
            />
          </InputGroup>
          {formData.featured_image && (
            <div className="mt-2">
              <img
                src={getImageUrl(formData.featured_image)}
                alt="Featured"
                className="img-fluid rounded"
                style={{ maxHeight: "150px" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </Form.Group>

        {/* Article Status */}
        <Form.Group className="mb-4">
          <Form.Label>Status</Form.Label>
          <Form.Select
            name="status"
            value={formData.status}
            onChange={onInputChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Form.Select>
        </Form.Group>

        {/* Tags */}
        <Form.Group>
          <Form.Label>Tags</Form.Label>

          {/* Display selected tags */}
          <div className="mb-2">
            {formData.tags.map((tag) => (
              <Badge
                key={tag}
                bg="secondary"
                className="me-2 mb-2"
                style={{ cursor: "pointer" }}
              >
                {tag}
                <BsX
                  className="ms-1"
                  onClick={() => removeTag(tag)}
                  style={{ marginBottom: "-2px" }}
                />
              </Badge>
            ))}
          </div>

          {/* Tag input */}
          <div className="position-relative">
            <Form.Control
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(true);
              }}
              onKeyPress={handleTagKeyPress}
              onFocus={() => setShowTagSuggestions(true)}
              placeholder="Add tags..."
            />

            {/* Tag suggestions dropdown */}
            {showTagSuggestions && tagInput && filteredTags.length > 0 && (
              <div
                className="position-absolute w-100 bg-white border rounded-bottom shadow-sm"
                style={{ top: "100%", zIndex: 1000 }}
              >
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-2 cursor-pointer hover-bg-light"
                    onClick={() => addTag(tag.name)}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => e.target.classList.add("bg-light")}
                    onMouseLeave={(e) => e.target.classList.remove("bg-light")}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ArticleMetadata;
