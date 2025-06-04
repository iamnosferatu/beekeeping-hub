// frontend/src/components/common/EmptyState.enhanced.js
import React, { useContext } from "react";
import { Card, Alert, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { 
  BsFileEarmarkText, 
  BsSearch, 
  BsTag, 
  BsFolderX,
  BsInbox,
  BsPeople,
  BsChatSquare,
  BsEnvelope,
  BsBookmark,
  BsHeart,
  BsExclamationCircle,
  BsPlus,
  BsArrowRight,
  BsLightbulb
} from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";
import PropTypes from "prop-types";

/**
 * Enhanced EmptyState Component
 * 
 * A comprehensive empty state component that provides:
 * - Context-aware messaging based on the feature area
 * - Role-based action suggestions
 * - Customizable icons, messages, and actions
 * - Pre-built templates for common scenarios
 * - Search tips and helpful suggestions
 * 
 * @component
 * @example
 * // Basic usage
 * <EmptyState 
 *   type="articles"
 *   message="No articles found"
 * />
 * 
 * @example
 * // With search context
 * <EmptyState 
 *   type="search"
 *   searchTerm="beekeeping"
 *   showSearchTips
 * />
 * 
 * @example
 * // Custom empty state
 * <EmptyState
 *   icon={BsCustomIcon}
 *   title="Custom Title"
 *   message="Custom message"
 *   actions={[
 *     { label: "Action 1", to: "/path", variant: "primary" }
 *   ]}
 * />
 */
const EmptyState = ({
  // Context type
  type,
  
  // Basic props
  icon: CustomIcon,
  title: customTitle,
  message: customMessage,
  variant = "light",
  className = "",
  
  // Context data
  searchTerm,
  filterTag,
  filterCategory,
  filterStatus,
  itemType = "items",
  
  // Actions
  actions: customActions,
  showDefaultActions = true,
  primaryActionLabel,
  primaryActionTo,
  primaryActionOnClick,
  
  // Features
  showSearchTips = false,
  showSuggestions = false,
  showIllustration = false,
  compact = false,
  
  // Component customization
  cardProps = {},
  children
}) => {
  const { user } = useContext(AuthContext);
  
  // Get configuration based on type
  const config = getEmptyStateConfig(type, {
    searchTerm,
    filterTag,
    filterCategory,
    filterStatus,
    itemType,
    userRole: user?.role
  });
  
  // Use custom values or defaults from config
  const icon = CustomIcon || config.icon;
  const title = customTitle || config.title;
  const message = customMessage || config.message;
  const defaultActions = showDefaultActions ? config.actions : [];
  const actions = customActions || defaultActions;
  
  // Render search tips if applicable
  const renderSearchTips = () => {
    if (!showSearchTips || !searchTerm) return null;
    
    return (
      <div className="mt-3 mb-4">
        <h6 className="text-muted mb-2">
          <BsLightbulb className="me-1" />
          Search Tips:
        </h6>
        <ul className="list-unstyled text-muted small mb-0">
          <li>• Try different or more general keywords</li>
          <li>• Check your spelling</li>
          <li>• Use fewer search terms</li>
          {filterTag && <li>• Try searching without tag filters</li>}
          {type === 'articles' && <li>• Browse articles by topic instead</li>}
        </ul>
      </div>
    );
  };
  
  // Render suggestions based on context
  const renderSuggestions = () => {
    if (!showSuggestions) return null;
    
    const suggestions = getSuggestions(type, { user, searchTerm, filterTag });
    if (!suggestions || suggestions.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h6 className="text-muted mb-3">You might want to:</h6>
        <Row className="g-3">
          {suggestions.map((suggestion, index) => (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card className="h-100 border-light shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="text-primary mb-2">{suggestion.icon}</div>
                  <h6 className="mb-2">{suggestion.title}</h6>
                  <p className="small text-muted mb-3 flex-grow-1">
                    {suggestion.description}
                  </p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    as={suggestion.onClick ? undefined : Link}
                    to={suggestion.to}
                    onClick={suggestion.onClick}
                  >
                    {suggestion.actionLabel}
                    <BsArrowRight className="ms-1" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Main render
  const content = (
    <>
      {/* Icon */}
      {icon && (
        <div className="empty-state-icon mb-3">
          {React.createElement(icon, { 
            size: compact ? 40 : 60, 
            className: "text-muted" 
          })}
        </div>
      )}
      
      {/* Title */}
      {title && (
        <h4 className={`empty-state-title ${compact ? 'h5' : ''} mb-2`}>
          {title}
        </h4>
      )}
      
      {/* Message */}
      {message && (
        <p className={`empty-state-message text-muted ${compact ? 'small' : ''} mb-0`}>
          {message}
        </p>
      )}
      
      {/* Search Tips */}
      {renderSearchTips()}
      
      {/* Actions */}
      {actions.length > 0 && (
        <div className="empty-state-actions mt-4 d-flex flex-wrap justify-content-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === 0 ? 'primary' : 'outline-secondary')}
              size={compact ? 'sm' : undefined}
              as={action.onClick ? undefined : Link}
              to={action.to}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && React.createElement(action.icon, { className: 'me-1' })}
              {action.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Primary action override */}
      {primaryActionLabel && !actions.length && (
        <div className="mt-4">
          <Button
            variant="primary"
            size={compact ? 'sm' : undefined}
            as={primaryActionOnClick ? undefined : Link}
            to={primaryActionTo}
            onClick={primaryActionOnClick}
          >
            <BsPlus className="me-1" />
            {primaryActionLabel}
          </Button>
        </div>
      )}
      
      {/* Suggestions */}
      {renderSuggestions()}
      
      {/* Custom content */}
      {children}
    </>
  );
  
  // Return based on variant
  if (variant === 'none') {
    return <div className={`empty-state text-center py-${compact ? 3 : 5} ${className}`}>{content}</div>;
  }
  
  if (variant === 'alert') {
    return (
      <Alert variant="info" className={`empty-state text-center py-${compact ? 3 : 5} ${className}`}>
        {content}
      </Alert>
    );
  }
  
  return (
    <Card className={`empty-state shadow-sm ${className}`} {...cardProps}>
      <Card.Body className={`text-center py-${compact ? 3 : 5}`}>
        {content}
      </Card.Body>
    </Card>
  );
};

/**
 * Get empty state configuration based on type
 */
function getEmptyStateConfig(type, context = {}) {
  const { searchTerm, filterTag, filterCategory, filterStatus, itemType, userRole } = context;
  
  const configs = {
    // Articles empty state
    articles: {
      icon: searchTerm ? BsSearch : filterTag ? BsTag : BsFileEarmarkText,
      title: getArticlesTitle(searchTerm, filterTag),
      message: getArticlesMessage(searchTerm, filterTag),
      actions: getArticlesActions(searchTerm, filterTag, userRole)
    },
    
    // Search results
    search: {
      icon: BsSearch,
      title: `No results for "${searchTerm}"`,
      message: "Try different keywords or browse by category",
      actions: [
        { label: "Browse All", to: "/articles" },
        { label: "View Topics", to: "/tags", icon: BsTag }
      ]
    },
    
    // Comments
    comments: {
      icon: BsChatSquare,
      title: "No Comments Yet",
      message: "Be the first to share your thoughts on this article",
      actions: userRole ? [
        { label: "Add Comment", icon: BsPlus, variant: "primary" }
      ] : [
        { label: "Login to Comment", to: "/login", variant: "primary" }
      ]
    },
    
    // User's articles
    myArticles: {
      icon: filterStatus ? BsExclamationCircle : BsFileEarmarkText,
      title: getMyArticlesTitle(filterStatus),
      message: getMyArticlesMessage(filterStatus, userRole),
      actions: userRole === 'author' || userRole === 'admin' ? [
        { label: "Create New Article", to: "/editor/new", icon: BsPlus }
      ] : []
    },
    
    // Bookmarks/Favorites
    bookmarks: {
      icon: BsBookmark,
      title: "No Bookmarks Yet",
      message: "Start bookmarking articles to read them later",
      actions: [
        { label: "Browse Articles", to: "/articles" }
      ]
    },
    
    // Liked articles
    likes: {
      icon: BsHeart,
      title: "No Liked Articles",
      message: "Articles you like will appear here",
      actions: [
        { label: "Discover Articles", to: "/articles" }
      ]
    },
    
    // Forum categories
    forumCategories: {
      icon: BsFolderX,
      title: "No Forum Categories",
      message: "Forum categories will be added soon",
      actions: userRole === 'admin' ? [
        { label: "Create Category", icon: BsPlus }
      ] : []
    },
    
    // Forum threads
    forumThreads: {
      icon: BsChatSquare,
      title: filterCategory ? `No Threads in ${filterCategory}` : "No Forum Threads",
      message: "Start a discussion by creating the first thread",
      actions: userRole === 'author' || userRole === 'admin' ? [
        { label: "Create Thread", icon: BsPlus }
      ] : []
    },
    
    // Contact messages
    contactMessages: {
      icon: BsEnvelope,
      title: filterStatus ? `No ${filterStatus} Messages` : "No Contact Messages",
      message: "Contact messages will appear here",
      actions: []
    },
    
    // Users
    users: {
      icon: BsPeople,
      title: searchTerm ? `No Users Found for "${searchTerm}"` : "No Users Found",
      message: searchTerm ? "Try different search terms" : "No users match your filters",
      actions: []
    },
    
    // Generic/fallback
    default: {
      icon: BsInbox,
      title: `No ${itemType}`,
      message: `${itemType} will appear here when available`,
      actions: []
    }
  };
  
  return configs[type] || configs.default;
}

// Helper functions for dynamic content
function getArticlesTitle(searchTerm, filterTag) {
  if (searchTerm && filterTag) {
    return `No Articles Found for "${searchTerm}" in "${filterTag}"`;
  }
  if (searchTerm) {
    return `No Articles Found for "${searchTerm}"`;
  }
  if (filterTag) {
    return `No Articles Tagged "${filterTag}"`;
  }
  return "No Articles Available";
}

function getArticlesMessage(searchTerm, filterTag) {
  if (searchTerm && filterTag) {
    return "Try different keywords or browse articles in other categories";
  }
  if (searchTerm) {
    return "Try different keywords or browse all articles";
  }
  if (filterTag) {
    return `No articles have been tagged with "${filterTag}" yet`;
  }
  return "No articles have been published yet. Check back later for new content.";
}

function getArticlesActions(searchTerm, filterTag, userRole) {
  const actions = [];
  
  if (searchTerm || filterTag) {
    actions.push({ label: "Browse All Articles", to: "/articles" });
  }
  
  if (!filterTag) {
    actions.push({ label: "Browse by Topic", to: "/tags", icon: BsTag });
  }
  
  if (userRole === 'author' || userRole === 'admin') {
    actions.push({ 
      label: "Write Article", 
      to: "/editor/new", 
      icon: BsPlus,
      variant: "success" 
    });
  }
  
  return actions;
}

function getMyArticlesTitle(filterStatus) {
  const statusTitles = {
    draft: "No Draft Articles",
    published: "No Published Articles",
    blocked: "No Blocked Articles"
  };
  return statusTitles[filterStatus] || "No Articles Yet";
}

function getMyArticlesMessage(filterStatus, userRole) {
  const statusMessages = {
    draft: "Your draft articles will appear here",
    published: "Articles you've published will appear here",
    blocked: "Articles that have been blocked will appear here"
  };
  
  if (filterStatus) {
    return statusMessages[filterStatus];
  }
  
  if (userRole === 'author' || userRole === 'admin') {
    return "Start writing your first article to share your knowledge";
  }
  
  return "You haven't written any articles yet";
}

function getSuggestions(type, context) {
  const { user, searchTerm, filterTag } = context;
  
  if (type === 'articles' && !searchTerm && !filterTag) {
    const suggestions = [];
    
    if (!user) {
      suggestions.push({
        icon: <BsPeople size={24} />,
        title: "Join the Community",
        description: "Create an account to write articles and engage with other beekeepers",
        actionLabel: "Sign Up",
        to: "/register"
      });
    }
    
    if (user && user.role === 'user') {
      suggestions.push({
        icon: <BsFileEarmarkText size={24} />,
        title: "Become an Author",
        description: "Apply to become an author and share your beekeeping knowledge",
        actionLabel: "Apply Now",
        to: "/author-application"
      });
    }
    
    suggestions.push({
      icon: <BsTag size={24} />,
      title: "Explore Topics",
      description: "Browse articles organized by beekeeping topics and categories",
      actionLabel: "View Topics",
      to: "/tags"
    });
    
    return suggestions;
  }
  
  return [];
}

EmptyState.propTypes = {
  // Type presets
  type: PropTypes.oneOf([
    'articles', 'search', 'comments', 'myArticles',
    'bookmarks', 'likes', 'forumCategories', 'forumThreads',
    'contactMessages', 'users', 'default'
  ]),
  
  // Basic customization
  icon: PropTypes.elementType,
  title: PropTypes.string,
  message: PropTypes.string,
  variant: PropTypes.oneOf(['card', 'alert', 'none']),
  className: PropTypes.string,
  
  // Context data
  searchTerm: PropTypes.string,
  filterTag: PropTypes.string,
  filterCategory: PropTypes.string,
  filterStatus: PropTypes.string,
  itemType: PropTypes.string,
  
  // Actions
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.elementType,
    variant: PropTypes.string,
    disabled: PropTypes.bool
  })),
  showDefaultActions: PropTypes.bool,
  primaryActionLabel: PropTypes.string,
  primaryActionTo: PropTypes.string,
  primaryActionOnClick: PropTypes.func,
  
  // Features
  showSearchTips: PropTypes.bool,
  showSuggestions: PropTypes.bool,
  showIllustration: PropTypes.bool,
  compact: PropTypes.bool,
  
  // Component props
  cardProps: PropTypes.object,
  children: PropTypes.node
};

// Export preset components for common use cases
EmptyState.Articles = (props) => <EmptyState type="articles" {...props} />;
EmptyState.Search = (props) => <EmptyState type="search" showSearchTips {...props} />;
EmptyState.Comments = (props) => <EmptyState type="comments" {...props} />;
EmptyState.MyArticles = (props) => <EmptyState type="myArticles" {...props} />;
EmptyState.Forum = (props) => <EmptyState type="forumThreads" {...props} />;

export default EmptyState;