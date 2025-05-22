// frontend/src/pages/ArticleEditorPage.js
import React, { useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Alert, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";

// Component Imports
import ArticleForm from "../components/editor/ArticleForm";
import ArticleMetadata from "../components/editor/ArticleMetadata";
import ArticleActions from "../components/editor/ArticleActions";
import ArticleBlockedNotice from "../components/editor/ArticleBlockedNotice";
import ArticleDebugInfo from "../components/editor/ArticleDebugInfo";
import ArticleExcerptEditor from "../components/editor/ArticleExcerptEditor";

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
  } = useArticleForm();

  const { loading, error, debugInfo, fetchArticle } = useArticleFetch(
    user,
    isEditMode,
    id
  );

  // Navigate back safely
  const handleBack = () => {
    navigate(-1);
  };

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
    if (isEditMode && user) {
      fetchArticle(id).then((article) => {
        if (article) {
          setFormData({
            title: article.title || "",
            content: article.content || "",
            excerpt: article.excerpt || "",
            featured_image: article.featured_image || "",
            status: article.status || "draft",
            tags: article.tags ? article.tags.map((tag) => tag.name) : [],
            blocked: article.blocked || false,
            blocked_reason: article.blocked_reason || "",
            blocked_by: article.blocked_by || null,
            blocked_at: article.blocked_at || null,
          });
        }
      });
    }
  }, [id, isEditMode, user, fetchArticle, setFormData]);

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          {isEditMode ? "Edit Article" : "Create New Article"}
        </h1>
        <Button variant="outline-secondary" onClick={handleBack}>
          Back
        </Button>
      </div>

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
              handleInputChange={handleInputChange}
              handleContentChange={handleContentChange}
            />

            {/* Article Excerpt Editor */}
            <ArticleExcerptEditor
              formData={formData}
              handleInputChange={handleInputChange}
              generateExcerpt={generateExcerpt}
            />
          </div>

          <div className="col-lg-3">
            {/* Article Metadata */}
            <ArticleMetadata
              formData={formData}
              onInputChange={handleInputChange}
              onTagsChange={handleTagsChange}
            />

            {/* Article Actions */}
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
