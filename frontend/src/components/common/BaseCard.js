// frontend/src/components/common/BaseCard.js
import React from "react";
import { Card, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * BaseCard Component
 * 
 * A flexible, reusable card component that provides:
 * - Consistent styling and structure
 * - Optional header with actions
 * - Footer support
 * - Loading states
 * - Status badges
 * - Hover effects
 * - Click handling
 * - Image support
 * 
 * @component
 * @example
 * // Basic card
 * <BaseCard title="Card Title">
 *   Card content goes here
 * </BaseCard>
 * 
 * @example
 * // Card with all features
 * <BaseCard
 *   title="Article Title"
 *   subtitle="By John Doe"
 *   image="/path/to/image.jpg"
 *   badge={{ text: "New", variant: "success" }}
 *   footer="Published yesterday"
 *   onClick={handleClick}
 *   hoverable
 * >
 *   Article excerpt...
 * </BaseCard>
 */
const BaseCard = ({
  // Basic props
  children,
  className = "",
  variant,
  
  // Structure props
  title,
  subtitle,
  header,
  headerActions,
  footer,
  footerClassName = "",
  
  // Image props
  image,
  imageAlt,
  imageHeight = 200,
  imagePosition = "top", // top, left, right
  imageOverlay,
  
  // Badge props
  badge,
  badges = [],
  
  // Interaction props
  onClick,
  to, // React Router link
  href, // External link
  hoverable = false,
  clickable,
  disabled = false,
  
  // State props
  loading = false,
  loadingText = "Loading...",
  selected = false,
  
  // Style props
  border = true,
  shadow = "sm", // false, 'sm', 'md', 'lg'
  padding = true,
  height = "auto", // auto, full (h-100)
  
  // Advanced props
  as = "div",
  cardProps = {},
  bodyProps = {},
  headerProps = {},
  footerProps = {},
}) => {
  // Determine if card is clickable
  const isClickable = clickable !== undefined ? clickable : !!(onClick || to || href);
  
  // Build card classes
  const cardClasses = [
    className,
    height === "full" && "h-100",
    !border && "border-0",
    shadow && `shadow-${shadow === true ? "sm" : shadow}`,
    (hoverable || isClickable) && "base-card-hoverable",
    isClickable && !disabled && "base-card-clickable",
    selected && "base-card-selected",
    disabled && "base-card-disabled",
    imagePosition === "left" && "base-card-horizontal",
    imagePosition === "right" && "base-card-horizontal base-card-horizontal-reverse",
  ].filter(Boolean).join(" ");
  
  // Handle click
  const handleClick = (e) => {
    if (disabled || !isClickable) return;
    
    // Don't trigger if clicking on interactive elements
    if (e.target.closest("a, button, input, select, textarea")) {
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  // Wrap card content if it's a link
  const wrapWithLink = (content) => {
    if (disabled) return content;
    
    if (to) {
      return (
        <Link to={to} className="text-decoration-none text-reset d-block">
          {content}
        </Link>
      );
    }
    
    if (href) {
      return (
        <a 
          href={href} 
          className="text-decoration-none text-reset d-block"
          target="_blank" 
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }
    
    return content;
  };
  
  // Render header
  const renderHeader = () => {
    if (!header && !title && !headerActions && badges.length === 0 && !badge) {
      return null;
    }
    
    return (
      <Card.Header 
        className={`base-card-header ${!padding && "p-0"}`}
        {...headerProps}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            {header || (
              <>
                {title && (
                  <Card.Title className="mb-0">
                    {title}
                  </Card.Title>
                )}
                {subtitle && (
                  <Card.Subtitle className="text-muted mt-1">
                    {subtitle}
                  </Card.Subtitle>
                )}
              </>
            )}
          </div>
          
          {/* Badges and Actions */}
          <div className="d-flex align-items-center gap-2 ms-2">
            {/* Single badge for backward compatibility */}
            {badge && (
              <Badge 
                bg={badge.variant || "primary"} 
                className={badge.className}
              >
                {badge.text}
              </Badge>
            )}
            
            {/* Multiple badges */}
            {badges.map((b, index) => (
              <Badge 
                key={index}
                bg={b.variant || "primary"}
                className={b.className}
                pill={b.pill}
              >
                {b.icon && <span className="me-1">{b.icon}</span>}
                {b.text}
              </Badge>
            ))}
            
            {/* Header actions */}
            {headerActions}
          </div>
        </div>
      </Card.Header>
    );
  };
  
  // Render image
  const renderImage = () => {
    if (!image) return null;
    
    const imageContent = (
      <div className="position-relative">
        <Card.Img
          variant={imagePosition}
          src={image}
          alt={imageAlt || title || "Card image"}
          style={{ 
            height: imageHeight, 
            objectFit: "cover",
            ...(imagePosition !== "top" && { width: imageHeight * 1.5 })
          }}
        />
        {imageOverlay && (
          <div className="position-absolute top-0 start-0 w-100 h-100">
            {imageOverlay}
          </div>
        )}
      </div>
    );
    
    // For horizontal layouts, image is rendered differently
    if (imagePosition === "left" || imagePosition === "right") {
      return imageContent;
    }
    
    return imageContent;
  };
  
  // Render footer
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <Card.Footer 
        className={`base-card-footer ${footerClassName} ${!padding && "p-0"}`}
        {...footerProps}
      >
        {footer}
      </Card.Footer>
    );
  };
  
  // Main content
  const cardContent = (
    <>
      {imagePosition === "top" && renderImage()}
      
      <div className={imagePosition !== "top" ? "d-flex" : ""}>
        {imagePosition === "left" && renderImage()}
        
        <div className="flex-grow-1">
          {renderHeader()}
          
          <Card.Body 
            className={[
              "base-card-body",
              !padding && "p-0",
              loading && "d-flex align-items-center justify-content-center"
            ].filter(Boolean).join(" ")}
            {...bodyProps}
          >
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="text-muted">{loadingText}</span>
              </div>
            ) : (
              children
            )}
          </Card.Body>
          
          {renderFooter()}
        </div>
        
        {imagePosition === "right" && renderImage()}
      </div>
    </>
  );
  
  return (
    <Card
      as={as}
      variant={variant}
      className={cardClasses}
      onClick={handleClick}
      {...cardProps}
    >
      {(to || href) && !disabled ? wrapWithLink(cardContent) : cardContent}
    </Card>
  );
};

BaseCard.propTypes = {
  // Basic props
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.string,
  
  // Structure props
  title: PropTypes.node,
  subtitle: PropTypes.node,
  header: PropTypes.node,
  headerActions: PropTypes.node,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  
  // Image props
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  imageHeight: PropTypes.number,
  imagePosition: PropTypes.oneOf(["top", "left", "right"]),
  imageOverlay: PropTypes.node,
  
  // Badge props
  badge: PropTypes.shape({
    text: PropTypes.string.isRequired,
    variant: PropTypes.string,
    className: PropTypes.string,
  }),
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      variant: PropTypes.string,
      className: PropTypes.string,
      icon: PropTypes.node,
      pill: PropTypes.bool,
    })
  ),
  
  // Interaction props
  onClick: PropTypes.func,
  to: PropTypes.string,
  href: PropTypes.string,
  hoverable: PropTypes.bool,
  clickable: PropTypes.bool,
  disabled: PropTypes.bool,
  
  // State props
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  selected: PropTypes.bool,
  
  // Style props
  border: PropTypes.bool,
  shadow: PropTypes.oneOf([false, "sm", "md", "lg"]),
  padding: PropTypes.bool,
  height: PropTypes.oneOf(["auto", "full"]),
  
  // Advanced props
  as: PropTypes.elementType,
  cardProps: PropTypes.object,
  bodyProps: PropTypes.object,
  headerProps: PropTypes.object,
  footerProps: PropTypes.object,
};

// Export preset card types for common use cases
BaseCard.Article = ({ article, ...props }) => (
  <BaseCard
    title={article.title}
    subtitle={`By ${article.author?.username || "Unknown"}`}
    image={article.featured_image}
    to={`/articles/${article.slug}`}
    badge={article.status === "draft" && { text: "Draft", variant: "secondary" }}
    footer={
      <div className="d-flex justify-content-between text-muted small">
        <span>{new Date(article.created_at).toLocaleDateString()}</span>
        <span>{article.view_count || 0} views</span>
      </div>
    }
    hoverable
    {...props}
  >
    {article.excerpt}
  </BaseCard>
);

BaseCard.Stats = ({ title, value, icon: Icon, trend, ...props }) => (
  <BaseCard
    className="stats-card"
    height="full"
    {...props}
  >
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <h6 className="text-muted mb-1">{title}</h6>
        <h2 className="mb-0">{value}</h2>
        {trend && (
          <small className={`text-${trend > 0 ? "success" : "danger"}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </small>
        )}
      </div>
      {Icon && <Icon size={40} className="text-primary opacity-50" />}
    </div>
  </BaseCard>
);

BaseCard.User = ({ user, actions, ...props }) => (
  <BaseCard
    title={user.username}
    subtitle={user.email}
    badge={{ text: user.role, variant: getRoleVariant(user.role) }}
    headerActions={actions}
    footer={
      <small className="text-muted">
        Joined {new Date(user.created_at).toLocaleDateString()}
      </small>
    }
    {...props}
  />
);

// Helper function for role variants
function getRoleVariant(role) {
  const variants = {
    admin: "danger",
    author: "primary",
    user: "secondary",
  };
  return variants[role] || "secondary";
}

export default BaseCard;