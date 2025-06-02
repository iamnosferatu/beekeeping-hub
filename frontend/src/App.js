// frontend/src/App.js
import React, { useContext, useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useSiteSettings } from "./contexts/SiteSettingsContext";
import AuthContext from "./contexts/AuthContext";
import MaintenanceMode from "./components/MaintenanceMode";

// Loading component for Suspense fallback
import LoadingSpinner from "./components/common/LoadingSpinner";
import RoutePreloader from "./components/common/RoutePreloader";
import PerformanceMonitor from "./components/common/PerformanceMonitor";
import ErrorBoundary from "./components/common/ErrorBoundary";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import { shouldLoadAdminComponents, logAdminOptimizationStatus } from "./utils/adminOptimization";

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
const AdminAdsPage = lazy(() => import("./pages/admin/AdsPage"));

// Lazy loaded static pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));

// Lazy loaded debug pages (low priority)
const AuthDebugPage = lazy(() => import("./pages/AuthDebugPage"));
const DebugPage = lazy(() => import("./pages/DebugPage"));
const RelatedArticlesDebugger = lazy(() => import('./components/debug/RelatedArticlesDebugger'));
const ArticlePageDebug = lazy(() => import('./pages/ArticlePageDebug'));

function App() {
  const { settings, loading } = useSiteSettings();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  // Log admin optimization status in development
  useEffect(() => {
    if (!authLoading) {
      logAdminOptimizationStatus(user);
    }
  }, [user, authLoading]);
  
  // Check if site is in maintenance mode
  const isInMaintenance = settings?.maintenance_mode;
  const isAdmin = user?.role === 'admin';
  
  // Determine if admin components should be loaded
  const shouldLoadAdmin = shouldLoadAdminComponents(user, authLoading);
  
  // Show maintenance page for non-admin users when maintenance is active
  if (!loading && isInMaintenance && !isAdmin) {
    return <MaintenanceMode settings={settings} />;
  }

  return (
    <ErrorBoundary level="app" userId={user?.id}>
      <RoutePreloader />
      <PerformanceMonitor />
      <CookieConsentBanner />
      <Suspense 
        fallback={
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <LoadingSpinner />
          </div>
        }
      >
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <ErrorBoundary level="layout">
            <MainLayout />
          </ErrorBoundary>
        }>
          <Route index element={
            <ErrorBoundary level="page">
              <HomePage />
            </ErrorBoundary>
          } />
          <Route path="articles" element={
            <ErrorBoundary level="page">
              <ArticleListPage />
            </ErrorBoundary>
          } />
          <Route path="articles/:slug" element={
            <ErrorBoundary level="page">
              <ArticlePage />
            </ErrorBoundary>
          } />
          <Route path="search" element={
            <ErrorBoundary level="page">
              <SearchResultsPage />
            </ErrorBoundary>
          } />
          <Route path="tags/:slug" element={
            <ErrorBoundary level="page">
              <TagPage />
            </ErrorBoundary>
          } />
          <Route path="login" element={
            <ErrorBoundary level="page">
              <LoginPage />
            </ErrorBoundary>
          } />
          <Route path="register" element={
            <ErrorBoundary level="page">
              <RegisterPage />
            </ErrorBoundary>
          } />
          <Route path="verify-email" element={
            <ErrorBoundary level="page">
              <VerifyEmailPage />
            </ErrorBoundary>
          } />
          <Route path="forgot-password" element={
            <ErrorBoundary level="page">
              <ForgotPasswordPage />
            </ErrorBoundary>
          } />
          <Route path="reset-password" element={
            <ErrorBoundary level="page">
              <ResetPasswordPage />
            </ErrorBoundary>
          } />

          {/* Protected Routes */}
          <Route
            path="profile"
            element={
              <ErrorBoundary level="page">
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="my-articles"
            element={
              <ErrorBoundary level="page">
                <PrivateRoute>
                  <MyArticlesPage />
                </PrivateRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="editor"
            element={
              <ErrorBoundary level="page">
                <RoleRoute roles={["author", "admin"]}>
                  <ArticleEditorPage />
                </RoleRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="editor/:id"
            element={
              <ErrorBoundary level="page">
                <RoleRoute roles={["author", "admin"]}>
                  <ArticleEditorPage />
                </RoleRoute>
              </ErrorBoundary>
            }
          />

          {/* Debug Routes */}
          <Route path="/auth-debug" element={
            <ErrorBoundary level="page">
              <AuthDebugPage />
            </ErrorBoundary>
          } />
          <Route path="/debug" element={
            <ErrorBoundary level="page">
              <DebugPage />
            </ErrorBoundary>
          } />
          <Route path="/debug/related-articles" element={
            <ErrorBoundary level="page">
              <RelatedArticlesDebugger />
            </ErrorBoundary>
          } />
          <Route path="/debug/article/:slug" element={
            <ErrorBoundary level="page">
              <ArticlePageDebug />
            </ErrorBoundary>
          } />
          
          {/* Static page routes */}
          <Route path="about" element={
            <ErrorBoundary level="page">
              <AboutPage />
            </ErrorBoundary>
          } />
          <Route path="contact" element={
            <ErrorBoundary level="page">
              <ContactPage />
            </ErrorBoundary>
          } />
          <Route path="privacy" element={
            <ErrorBoundary level="page">
              <PrivacyPage />
            </ErrorBoundary>
          } />
          <Route path="privacy-policy" element={
            <ErrorBoundary level="page">
              <PrivacyPage />
            </ErrorBoundary>
          } />
          <Route path="cookie-policy" element={
            <ErrorBoundary level="page">
              <CookiePolicyPage />
            </ErrorBoundary>
          } />
          <Route path="terms" element={
            <ErrorBoundary level="page">
              <TermsPage />
            </ErrorBoundary>
          } />
          <Route path="sitemap" element={
            <ErrorBoundary level="page">
              <SitemapPage />
            </ErrorBoundary>
          } />

          {/* 404 Page */}
          <Route path="*" element={
            <ErrorBoundary level="page">
              <NotFoundPage />
            </ErrorBoundary>
          } />
        </Route>

        {/* Admin Routes - Only render for admin users or when auth is loading */}
        {shouldLoadAdmin && (
          <Route
            path="/admin"
            element={
              <ErrorBoundary level="layout">
                <RoleRoute roles={["admin"]}>
                  <AdminLayout />
                </RoleRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={
              <ErrorBoundary level="page">
                <AdminDashboardPage />
              </ErrorBoundary>
            } />
            <Route path="articles" element={
              <ErrorBoundary level="page">
                <AdminArticlesPage />
              </ErrorBoundary>
            } />
            <Route path="comments" element={
              <ErrorBoundary level="page">
                <AdminCommentsPage />
              </ErrorBoundary>
            } />
            <Route path="tags" element={
              <ErrorBoundary level="page">
                <AdminTagsPage />
              </ErrorBoundary>
            } />
            <Route path="users" element={
              <ErrorBoundary level="page">
                <AdminUsersPage />
              </ErrorBoundary>
            } />
            <Route path="newsletter" element={
              <ErrorBoundary level="page">
                <AdminNewsletterPage />
              </ErrorBoundary>
            } />
            <Route path="contact" element={
              <ErrorBoundary level="page">
                <AdminContactMessagesPage />
              </ErrorBoundary>
            } />
            <Route path="settings" element={
              <ErrorBoundary level="page">
                <AdminSiteSettingsPage />
              </ErrorBoundary>
            } />
            <Route path="diagnostics" element={
              <ErrorBoundary level="page">
                <AdminDiagnosticsPage />
              </ErrorBoundary>
            } />
            <Route path="ads" element={
              <ErrorBoundary level="page">
                <AdminAdsPage />
              </ErrorBoundary>
            } />
          </Route>
        )}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
