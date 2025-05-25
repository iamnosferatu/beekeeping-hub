// frontend/src/components/article/CommentItem.js
import React from "react";
import { ListGroup } from "react-bootstrap";
import moment from "moment";

const CommentItem = ({ comment }) => {
  return (
    <ListGroup.Item className="py-4 px-0 border-bottom">
      <div className="d-flex">
        <img
          src={comment.author?.avatar || "https://via.placeholder.com/40"}
          alt={comment.author?.username || "Anonymous"}
          className="rounded-circle me-3"
          width="40"
          height="40"
        />
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="mb-0">
              {comment.author?.first_name}{" "}
              {comment.author?.last_name || "Anonymous"}
            </h6>
            <small className="text-muted">
              {moment(comment.created_at).fromNow()}
            </small>
          </div>
          <p className="mb-0">{comment.content}</p>
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default CommentItem;
