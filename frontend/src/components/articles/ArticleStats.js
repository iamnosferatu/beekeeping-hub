// frontend/src/components/articles/ArticleStats.js
import React from "react";
import { BsFillHeartFill, BsEye, BsChat } from "react-icons/bs";
import { formatCount, formatLargeNumber } from "../../utils/formatters";
import { ARIA_LABELS } from "../../constants";

/**
 * ArticleStats Component
 * Displays article statistics (views, likes, comments)
 */
const ArticleStats = ({
  viewCount,
  likeCount,
  commentCount,
  className = "",
  variant = "default", // default, compact, detailed
}) => {
  const stats = [
    {
      icon: BsEye,
      value: formatCount(viewCount),
      label: "Views",
      title: `${formatCount(viewCount)} views`,
    },
    {
      icon: BsFillHeartFill,
      value: formatCount(likeCount),
      label: "Likes",
      title: `${formatCount(likeCount)} likes`,
      className: "text-danger",
    },
    {
      icon: BsChat,
      value: formatCount(commentCount),
      label: "Comments",
      title: `${formatCount(commentCount)} comments`,
    },
  ];

  return (
    <div
      className={`article-stats d-flex ${className}`}
      aria-label={ARIA_LABELS.ARTICLE.STATS}
    >
      {stats.map((stat, index) => (
        <StatItem
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          title={stat.title}
          className={`${stat.className || "text-muted"} ${
            index < stats.length - 1 ? "me-3" : ""
          }`}
          variant={variant}
        />
      ))}
    </div>
  );
};

/**
 * StatItem Component
 * Individual statistic item
 */
const StatItem = ({ icon: Icon, value, label, title, className, variant }) => (
  <span className={className} title={title}>
    <Icon className="me-1" />
    <small>
      {variant === "detailed" ? `${formatLargeNumber(value)} ${label}` : value}
    </small>
  </span>
);

export default ArticleStats;
