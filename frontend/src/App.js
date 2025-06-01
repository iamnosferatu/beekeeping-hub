// frontend/src/App.js
import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useSiteSettings } from "./contexts/SiteSettingsContext";
import AuthContext from "./contexts/AuthContext";
import MaintenanceMode from "./components/MaintenanceMode";

// Loading component for Suspense fallback
import LoadingSpinner from "./components/common/LoadingSpinner";
import RoutePreloader from "./components/common/RoutePreloader";
import PerformanceMonitor from "./components/common/PerformanceMonitor";

// Eagerly loaded components (small, always needed)
import PrivateRoute from "./components/auth/PrivateRoute";
import RoleRoute from "./components/auth/RoleRoute";

// Lazy loaded layouts
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Lazy loaded public pages
const HomePage = lazy(() => import("./pages/HomePage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ArticleListPage = lazy(() => import("./pages/ArticleListPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Lazy loaded protected pages
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MyArticlesPage = lazy(() => import("./pages/MyArticlesPage"));
const ArticleEditorPage = lazy(() => import("./pages/ArticleEditorPage"));

// Lazy loaded admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminArticlesPage = lazy(() => import("./pages/admin/ArticlesPage"));
const AdminCommentsPage = lazy(() => import("./pages/admin/CommentsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminTagsPage = lazy(() => import("./pages/admin/TagsPage"));
const AdminDiagnosticsPage = lazy(() => import("./pages/admin/DiagnosticsPage"));
const AdminSiteSettingsPage = lazy(() => import("./pages/admin/SiteSettingsPage"));
const AdminNewsletterPage = lazy(() => import("./pages/admin/NewsletterPage"));
const AdminContactMessagesPage = lazy(() => import("./pages/admin/ContactMessagesPage"));

// Lazy loaded static pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));

// Lazy loaded debug pages (low priority)
const AuthDebugPage = lazy(() => import("./pages/AuthDebugPage"));
const DebugPage = lazy(() => import("./pages/DebugPage"));
const RelatedArticlesDebugger = lazy(() => import('./components/debug/RelatedArticlesDebugger'));
const ArticlePageDebug = lazy(() => import('./pages/ArticlePageDebug'));

function App() {
  const { settings, loading } = useSiteSettings();
  const { user } = useContext(AuthContext);
  
  // Check if site is in maintenance mode
  const isInMaintenance = settings?.maintenance_mode;
  const isAdmin = user?.role === 'admin';
  
  // Show maintenance page for non-admin users when maintenance is active
  if (!loading && isInMaintenance && !isAdmin) {
    return <MaintenanceMode settings={settings} />;
  }

  return (
    <>
      <RoutePreloader />
      <PerformanceMonitor />
      <Suspense 
        fallback={
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <LoadingSpinner />
          </div>
        }
      >
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
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="my-articles"
            element={
              <PrivateRoute>
                <MyArticlesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="editor"
            element={
              <RoleRoute roles={["author", "admin"]}>
                <ArticleEditorPage />
              </RoleRoute>
            }
          />
          <Route
            path="editor/:id"
            element={
              <RoleRoute roles={["author", "admin"]}>
                <ArticleEditorPage />
              </RoleRoute>
            }
          />

          {/* Debug Routes */}
          <Route path="/auth-debug" element={<AuthDebugPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/debug/related-articles" element={<RelatedArticlesDebugger />} />
          <Route path="/debug/article/:slug" element={<ArticlePageDebug />} />
          
          {/* Static page routes */}
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="sitemap" element={<SitemapPage />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
          <Route path="contact" element={<AdminContactMessagesPage />} />
          <Route path="settings" element={<AdminSiteSettingsPage />} />
          <Route path="diagnostics" element={<AdminDiagnosticsPage />} />
        </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
