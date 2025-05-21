// frontend/src/pages/TagPage.js
import React from "react";
import { useParams } from "react-router-dom";
import ArticleList from "../components/articles/ArticleList";

const TagPage = () => {
  const { slug } = useParams();

  // Map tag slugs to names for display
  const tagNames = {
    beginner: "Beginner",
    advanced: "Advanced",
    equipment: "Equipment",
    honey: "Honey",
    health: "Health",
    seasonal: "Seasonal",
  };

  const tagName = tagNames[slug] || slug;

  return (
    <div className="tag-page">
      <h1 className="mb-4">Articles Tagged: {tagName}</h1>
      <p className="lead mb-4">
        Browse all articles related to {tagName.toLowerCase()} beekeeping
        topics.
      </p>

      <ArticleList tag={slug} />
    </div>
  );
};

export default TagPage;
