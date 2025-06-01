// backend/src/middleware/sanitizer.js
const xss = require('xss');

// XSS sanitization options
const xssOptions = {
  whiteList: {
    // Allow basic HTML tags for content
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    ul: [], ol: [], li: [],
    blockquote: [],
    code: [],
    pre: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
};

// Recursively sanitize object properties
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return xss(obj, xssOptions);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Middleware to sanitize request body
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

module.exports = { sanitizeInput };