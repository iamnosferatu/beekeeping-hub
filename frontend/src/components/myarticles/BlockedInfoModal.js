// components/MyArticles/BlockedInfoModal.js
/**
 * Modal for displaying blocked article information
 * Shows detailed information about why an article was blocked
 */
import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsShieldExclamation, BsInfoCircleFill } from "react-icons/bs";
import moment from "moment";

const BlockedInfoModal = ({ show, article, onHide }) => {
  if (!article) return null;

  /**
   * Format admin name for display
   */
  const getAdminName = () => {
    if (!article.blocked_by) return "Unknown Administrator";

    const admin = article.blocked_by;
    const fullName = `${admin.first_name || ""} ${
      admin.last_name || ""
    }`.trim();
    return fullName || admin.username || "Unknown Administrator";
  };

  /**
   * Format blocked date
   */
  const getBlockedDate = () => {
    if (!article.blocked_at) return "Unknown date";
    return moment(article.blocked_at).format("MMMM D, YYYY [at] h:mm A");
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <BsShieldExclamation className="me-2" />
          Article Blocked
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          {/* Article Title */}
          <h5 className="mb-3">{article.title}</h5>

          {/* Block Reason */}
          <div className="border-top border-bottom py-3 mb-3">
            <h6 className="text-danger mb-2">Reason for blocking:</h6>
            <p className="mb-0">
              {article.blocked_reason || "No specific reason provided."}
            </p>
          </div>

          {/* Block Details */}
          <div className="mb-3">
            <div className="row">
              <div className="col-sm-4">
                <strong>Blocked by:</strong>
              </div>
              <div className="col-sm-8">{getAdminName()}</div>
            </div>
            <div className="row">
              <div className="col-sm-4">
                <strong>Blocked on:</strong>
              </div>
              <div className="col-sm-8">{getBlockedDate()}</div>
            </div>
          </div>

          {/* Information Alert */}
          <Alert variant="info">
            <BsInfoCircleFill className="me-2" />
            <strong>What you can do:</strong>
            <ul className="mb-0 mt-2">
              <li>Edit this article to address the issues mentioned above</li>
              <li>Contact an administrator after making changes</li>
              <li>Only administrators can remove the block status</li>
            </ul>
          </Alert>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          as={Link}
          to={`/editor/${article.id}`}
          onClick={onHide}
        >
          Edit Article
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlockedInfoModal;
