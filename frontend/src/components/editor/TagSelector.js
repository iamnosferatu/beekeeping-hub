// frontend/src/components/editor/TagSelector.js
import React, { useState, useEffect } from "react";
import { Form, Badge, ListGroup } from "react-bootstrap";
import { BsX, BsPlus } from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import "./TagSelector.scss";

const TagSelector = ({ selectedTags = [], onChange, maxTags = 5 }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/tags`);

        if (response.data.success) {
          setAvailableTags(response.data.data.map((tag) => tag.name));
        } else {
          throw new Error("Failed to fetch tags");
        }
      } catch (err) {
        console.error("Error fetching tags:", err);

        // Fallback to mock data
        setAvailableTags([
          "Beginner",
          "Advanced",
          "Equipment",
          "Honey",
          "Health",
          "Seasonal",
          "Winter",
          "Summer",
          "Diseases",
          "Pests",
          "Hive Management",
          "Queen Bees",
          "Harvesting",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.toLowerCase().includes(tagInput.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, availableTags, selectedTags]);

  // Handle selecting a tag
  const handleSelectTag = (tag) => {
    if (selectedTags.length < maxTags && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      onChange(newTags);
      setTagInput("");
      setSuggestions([]);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    onChange(newTags);
  };

  // Handle creating a new tag
  const handleCreateTag = () => {
    if (
      tagInput.trim() &&
      selectedTags.length < maxTags &&
      !selectedTags.includes(tagInput.trim())
    ) {
      const newTag = tagInput.trim();
      const newTags = [...selectedTags, newTag];
      onChange(newTags);
      setTagInput("");
      setSuggestions([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Handle input keydown
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="tag-selector">
      {/* Selected Tags */}
      <div className="selected-tags mb-2">
        {selectedTags.length > 0 ? (
          <div className="d-flex flex-wrap">
            {selectedTags.map((tag, index) => (
              <Badge key={index} bg="secondary" className="tag-badge me-2 mb-2">
                {tag}
                <span
                  className="ms-2"
                  onClick={() => handleRemoveTag(tag)}
                  style={{ cursor: "pointer" }}
                >
                  <BsX />
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-muted mb-2">No tags selected</div>
        )}
      </div>

      {/* Tag Input */}
      <div className="tag-input-container position-relative">
        <Form.Control
          type="text"
          placeholder={
            selectedTags.length >= maxTags
              ? `Maximum ${maxTags} tags`
              : "Add a tag..."
          }
          value={tagInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => tagInput.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={selectedTags.length >= maxTags}
        />

        {/* Tag Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <ListGroup className="tag-suggestions position-absolute w-100 shadow-sm">
            {suggestions.map((tag, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleSelectTag(tag)}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{tag}</span>
                <BsPlus />
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Create Tag Message */}
        {showSuggestions && tagInput.trim() && suggestions.length === 0 && (
          <ListGroup className="tag-suggestions position-absolute w-100 shadow-sm">
            <ListGroup.Item
              action
              onClick={handleCreateTag}
              className="d-flex justify-content-between align-items-center"
            >
              <span>Create tag "{tagInput}"</span>
              <BsPlus />
            </ListGroup.Item>
          </ListGroup>
        )}
      </div>

      {/* Tag count indicator */}
      <div className="d-flex justify-content-end mt-2">
        <small className="text-muted">
          {selectedTags.length} of {maxTags} tags
        </small>
      </div>
    </div>
  );
};

export default TagSelector;
