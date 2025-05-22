// ============================================================================
// frontend/src/utils/formatters.js - FORMATTING UTILITIES
// ============================================================================

import moment from "moment";

export const formatDate = (date, format = "MMM D, YYYY") => {
  if (!date) return "Unknown date";
  return moment(date).format(format);
};

export const formatRelativeTime = (date) => {
  if (!date) return "Unknown time";
  return moment(date).fromNow();
};

export const formatNumber = (num) => {
  if (typeof num !== "number") return "0";
  return new Intl.NumberFormat().format(num);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatUserName = (user) => {
  if (!user) return "Unknown User";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || user.email || "Unknown User";
};

