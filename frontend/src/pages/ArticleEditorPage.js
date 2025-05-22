// frontend/src/pages/ArticleEditorPage.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";

// Component Imports
import ArticleForm from "../components/editor/ArticleForm";
import ArticleMetadata from "../components/editor/ArticleMetadata";
import ArticleActions from "../components/editor/ArticleActions";
import ArticleBlockedNotice from "../components/editor/ArticleBlockedNotice";
import ArticleDebugInfo from "../components/editor/ArticleDebugInfo";

// Custom Hooks
import useArticleForm from "../hooks/useArticleForm";
import useArticleFetch from "../hooks/useArticleFetch";

const ArticleEditorPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Custom hooks for managing article state and fetching
  const {
    formData,
    setFormData,
    handleInputChange,
    handleContentChange,
    handleTagsChange,
    generateExcerpt,
    contentChanged,
  } = useArticleForm();

  const { loading, error, debugInfo, fetchArticle } = useArticleFetch(
    user,
    isEditMode,
    id
  );

  // Save article handler
  const handleSave = useCallback(
    async (e, saveAsDraft = false) => {
      e.preventDefault();

      // Validate form
      if (!formData.title.trim()) {
        return { success: false, error: "Title is required" };
      }

      if (!formData.content.trim()) {
        return { success: false, error: "Content is required" };
      }

      // Prepare article data
      const articleData = {
        ...formData,
        status: saveAsDraft ? "draft" : formData.status,
        excerpt:
          formData.excerpt.trim() ||
          (() => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = formData.content;
            const text = tempDiv.textContent || tempDiv.innerText || "";
            return text.substring(0, 160) + (text.length > 160 ? "..." : "");
          })(),
      };

      try {
        const response = isEditMode
          ? await axios.put(`${API_URL}/articles/${id}`, articleData)
          : await axios.post(`${API_URL}/articles`, articleData);

        if (response.data.success) {
          // Navigate or show success message
          if (!isEditMode) {
            const newSlug =
              response.data.data.slug || response.data.data.id.toString();
            navigate(`/articles/${newSlug}`);
          }
          return { success: true, message: "Article saved successfully" };
        }
      } catch (err) {
        console.error("Error saving article:", err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to save article",
        };
      }
    },
    [formData, isEditMode, id, navigate]
  );

  // Handle article deletion
  const handleDelete = useCallback(async () => {
    if (!isEditMode) return;

    try {
      const response = await axios.delete(`${API_URL}/articles/${id}`);

      if (response.data.success) {
        navigate("/my-articles", {
          state: { message: "Article deleted successfully" },
        });
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      return {
        success: false,
        error: err.response?.data?.message || "Failed to delete article",
      };
    }
  }, [id, isEditMode, navigate]);

  // Initial article fetch
  useEffect(() => {
    if (isEditMode) {
      fetchArticle(id);
    }
  }, [id, isEditMode, fetchArticle]);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading article editor...</p>
      </div>
    );
  }

  return (
    <Container fluid className="article-editor py-4">
      {/* Debug Information */}
      <ArticleDebugInfo debugInfo={debugInfo} />

      {/* Error Handling */}
      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}

      {/* Blocked Article Notice */}
      <ArticleBlockedNotice article={formData} />

      {/* Main Article Form */}
      <form onSubmit={(e) => handleSave(e, false)}>
        <div className="row">
          <div className="col-lg-9">
            {/* Article Content Form */}
            <ArticleForm
              formData={formData}
              onInputChange={handleInputChange}
              onContentChange={handleContentChange}
              onGenerateExcerpt={generateExcerpt}
            />
          </div>

          <div className="col-lg-3">
            {/* Article Metadata and Actions */}
            <ArticleMetadata
              formData={formData}
              onInputChange={handleInputChange}
              onTagsChange={handleTagsChange}
            />

            <ArticleActions
              isEditMode={isEditMode}
              formData={formData}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </form>
    </Container>
  );
};

export default ArticleEditorPage;
