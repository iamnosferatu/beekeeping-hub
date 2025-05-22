// frontend/src/hooks/useArticleForm.js
import { useState, useCallback } from "react";

const useArticleForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    status: "draft",
    tags: [],
    blocked: false,
    blocked_reason: "",
    blocked_by: null,
    blocked_at: null,
    ...initialData,
  });

  const [contentChanged, setContentChanged] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setContentChanged(true);
  }, []);

  const handleContentChange = useCallback((content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
    setContentChanged(true);
  }, []);

  const handleTagsChange = useCallback((tags) => {
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
    setContentChanged(true);
  }, []);

  const generateExcerpt = useCallback(() => {
    if (!formData.content) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formData.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt = text.substring(0, 160) + (text.length > 160 ? "..." : "");

    setFormData((prev) => ({
      ...prev,
      excerpt,
    }));
  }, [formData.content]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleContentChange,
    handleTagsChange,
    generateExcerpt,
    contentChanged,
  };
};

export default useArticleForm;
