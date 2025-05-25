// frontend/src/pages/SearchResultsPage.js
import React from "react";
import { useSearchParams } from "react-router-dom";
import ArticleList from "../components/article/ArticleList";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="search-results-page">
      <h1 className="mb-4">Search Results</h1>
      <p className="lead mb-4">
        Showing results for: <strong>"{query}"</strong>
      </p>

      <ArticleList search={query} />
    </div>
  );
};

export default SearchResultsPage;
