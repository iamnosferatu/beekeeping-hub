// backend/src/utils/tokenGenerator.js
const crypto = require('crypto');

/**
 * Generate a secure random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} Hex string token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a verification token with expiry
 * @param {number} hoursValid - How many hours the token is valid (default: 24)
 * @returns {object} Token and expiry date
 */
const generateVerificationToken = (hoursValid = 24) => {
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + hoursValid);
  
  return {
    token,
    expires
  };
};

/**
 * Check if a token has expired
 * @param {Date} expiryDate - The expiry date to check
 * @returns {boolean} True if expired
 */
const isTokenExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = {
  generateToken,
  generateVerificationToken,
  isTokenExpired
};