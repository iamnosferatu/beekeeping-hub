// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import ArticleListPage from "./pages/ArticleListPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import TagPage from "./pages/TagPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import AuthDebugPage from "./pages/AuthDebugPage";
import DebugPage from "./pages/DebugPage";

// Protected Pages
import ProfilePage from "./pages/ProfilePage";
import MyArticlesPage from "./pages/MyArticlesPage";
import ArticleEditorPage from "./pages/ArticleEditorPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminArticlesPage from "./pages/admin/ArticlesPage";
import AdminCommentsPage from "./pages/admin/CommentsPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminTagsPage from "./pages/admin/TagsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminDiagnosticsPage from "./pages/admin/DiagnosticsPage";

// Auth Guards
import PrivateRoute from "./components/auth/PrivateRoute";
import RoleRoute from "./components/auth/RoleRoute";

// Import the new static pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticleListPage />} />
        <Route path="articles/:slug" element={<ArticlePage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="tags/:slug" element={<TagPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="profile"
          element={
            <PrivateRoute>
              {" "}
              <ProfilePage />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="my-articles"
          element={
            <PrivateRoute>
              {" "}
              <MyArticlesPage />{" "}
            </PrivateRoute>
          }
        />
        <Route
          path="editor"
          element={
            <RoleRoute roles={["author", "admin"]}>
              {" "}
              <ArticleEditorPage />{" "}
            </RoleRoute>
          }
        />
        <Route
          path="editor/:id"
          element={
            <RoleRoute roles={["author", "admin"]}>
              {" "}
              <ArticleEditorPage />{" "}
            </RoleRoute>
          }
        />

        {/* Debug Routes */}
        <Route path="/auth-debug" element={<AuthDebugPage />} />
        <Route path="/debug" element={<DebugPage />} />
        
        {/* Add the new static page routes here */}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute roles={["admin"]}>
            {" "}
            <AdminLayout />{" "}
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="articles" element={<AdminArticlesPage />} />
        <Route path="comments" element={<AdminCommentsPage />} />
        <Route path="tags" element={<AdminTagsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="diagnostics" element={<AdminDiagnosticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
