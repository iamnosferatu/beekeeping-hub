// frontend/src/pages/ArticleListPage.js
import React from "react";
import ArticleList from "../components/articles/ArticleList";
import BackToTopButton from "../components/common/BackToTopButton";

const ArticleListPage = () => {
  return (
    <div className="article-list-page">
      <h1 className="mb-4">All Articles</h1>
      <p className="lead mb-4">
        Browse our collection of beekeeping articles written by experienced
        beekeepers and enthusiasts.
      </p>

      <ArticleList />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default ArticleListPage;
