// components/MyArticles/ArticleTable.js
/**
 * Table component for displaying user's articles
 * Handles complex table rendering and user interactions
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  BsEye,
  BsFillHeartFill,
  BsChat,
  BsCalendar3,
  BsPencilSquare,
  BsTrash,
  BsShieldExclamation,
  BsInfoCircleFill,
} from "react-icons/bs";
import moment from "moment";

const ArticleTable = ({ articles, onDeleteClick, onBlockedInfoClick }) => {
  /**
   * Get status badge configuration based on article state
   */
  const getStatusBadge = (article) => {
    if (article.blocked) {
      return { variant: "danger", text: "Blocked" };
    }
    if (article.status === "published") {
      return { variant: "success", text: "Published" };
    }
    if (article.status === "draft") {
      return { variant: "secondary", text: "Draft" };
    }
    return { variant: "warning", text: article.status };
  };

  /**
   * Format date for display in table
   */
  const formatTableDate = (date, fallback = "Not published") => {
    if (!date) return fallback;
    return moment(date).format("MMM D, YYYY");
  };

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-dark">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const statusBadge = getStatusBadge(article);

                return (
                  <tr
                    key={article.id}
                    className={article.blocked ? "table-danger" : ""}
                  >
                    {/* Title Column */}
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <div>
                          <h6 className="mb-0">
                            {article.title}
                            {article.blocked && (
                              <span className="ms-2">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      This article has been blocked by an
                                      administrator. Click for details.
                                    </Tooltip>
                                  }
                                >
                                  <BsShieldExclamation
                                    className="text-danger"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onBlockedInfoClick(article)}
                                  />
                                </OverlayTrigger>
                              </span>
                            )}
                          </h6>

                          {/* Tags */}
                          <div className="text-muted small">
                            {article.tags?.map((tag) => (
                              <Badge
                                bg="secondary"
                                key={tag.id}
                                className="me-1"
                                style={{ opacity: 0.7 }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="align-middle">
                      <Badge bg={statusBadge.variant} className="p-2">
                        {statusBadge.text}
                      </Badge>
                    </td>

                    {/* Date Column */}
                    <td className="align-middle">
                      {article.published_at ? (
                        <span
                          title={moment(article.published_at).format(
                            "MMMM D, YYYY h:mm A"
                          )}
                        >
                          <BsCalendar3 className="me-1" />
                          {formatTableDate(article.published_at)}
                        </span>
                      ) : (
                        <span className="text-muted">
                          <BsCalendar3 className="me-1" />
                          Not published
                        </span>
                      )}
                    </td>

                    {/* Stats Columns */}
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsEye className="me-1 text-muted" />
                        {article.view_count || 0}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsFillHeartFill className="me-1 text-danger" />
                        {article.like_count || 0}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsChat className="me-1 text-info" />
                        {article.comments?.length || 0}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="align-middle text-end">
                      <div className="d-flex justify-content-end">
                        {/* View Button - only for published, non-blocked articles */}
                        {article.status === "published" && !article.blocked && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/articles/${article.slug}`}
                            title="View Article"
                          >
                            <BsEye />
                          </Button>
                        )}

                        {/* Blocked Info Button */}
                        {article.blocked && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="me-2"
                            onClick={() => onBlockedInfoClick(article)}
                            title="View Block Reason"
                          >
                            <BsInfoCircleFill />
                          </Button>
                        )}

                        {/* Edit Button */}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          as={Link}
                          to={`/editor/${article.id}`}
                          title={
                            article.blocked
                              ? "Edit (Blocked Article)"
                              : "Edit Article"
                          }
                        >
                          <BsPencilSquare />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDeleteClick(article)}
                          title="Delete Article"
                        >
                          <BsTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleTable;
