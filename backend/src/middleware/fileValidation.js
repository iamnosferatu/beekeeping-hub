// backend/src/middleware/fileValidation.js
const fs = require('fs');
const path = require('path');
const { logWarn, logError } = require('../utils/logger');

// MIME type to file signature mapping for validation
const FILE_SIGNATURES = {
  // JPEG
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1],
    [0xFF, 0xD8, 0xFF, 0xE2],
    [0xFF, 0xD8, 0xFF, 0xE3],
    [0xFF, 0xD8, 0xFF, 0xE8],
    [0xFF, 0xD8, 0xFF, 0xDB]
  ],
  // PNG
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  ],
  // GIF
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ],
  // WebP
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]
  ]
};

// Allowed MIME types for different upload types
const ALLOWED_MIME_TYPES = {
  avatar: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  article: [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp'
  ]
};

// Allowed file extensions
const ALLOWED_EXTENSIONS = {
  avatar: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  article: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  avatar: 5 * 1024 * 1024,  // 5MB
  article: 10 * 1024 * 1024  // 10MB
};

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.php3', '.php4', '.php5', '.asp', '.aspx', '.jsp', '.py',
  '.rb', '.pl', '.sh', '.bash', '.ps1', '.app', '.deb', '.rpm',
  '.dmg', '.iso', '.msi', '.zip', '.rar', '.7z', '.tar', '.gz'
];

/**
 * Read file signature (magic bytes) from buffer
 * @param {Buffer} buffer - File buffer
 * @param {number} length - Number of bytes to read
 * @returns {Array} Array of bytes
 */
const readFileSignature = (buffer, length = 12) => {
  const signature = [];
  for (let i = 0; i < Math.min(length, buffer.length); i++) {
    signature.push(buffer[i]);
  }
  return signature;
};

/**
 * Check if file signature matches any of the allowed signatures for a MIME type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - Expected MIME type
 * @returns {boolean} True if signature matches
 */
const validateFileSignature = (buffer, mimeType) => {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    return false;
  }

  const fileSignature = readFileSignature(buffer);
  
  return signatures.some(signature => {
    return signature.every((byte, index) => {
      // null in signature means "any byte" (for variable fields)
      return byte === null || fileSignature[index] === byte;
    });
  });
};

/**
 * Comprehensive file validation
 * @param {Object} file - Multer file object
 * @param {string} uploadType - Type of upload (avatar, article)
 * @returns {Object} Validation result
 */
const validateFile = async (file, uploadType) => {
  const errors = [];
  const warnings = [];

  try {
    // 1. Check upload type
    if (!ALLOWED_MIME_TYPES[uploadType]) {
      errors.push(`Invalid upload type: ${uploadType}`);
      return { isValid: false, errors, warnings };
    }

    // 2. Check file exists
    if (!file || !file.path) {
      errors.push('No file provided');
      return { isValid: false, errors, warnings };
    }

    // 3. Check file size
    const maxSize = MAX_FILE_SIZES[uploadType];
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // 4. Check file extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED_EXTENSIONS[uploadType];
    
    if (!allowedExts.includes(fileExt)) {
      errors.push(`Invalid file extension. Allowed: ${allowedExts.join(', ')}`);
    }

    // 5. Check for dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(fileExt)) {
      errors.push('Potentially dangerous file type detected');
    }

    // 6. Validate MIME type
    const allowedMimes = ALLOWED_MIME_TYPES[uploadType];
    if (!allowedMimes.includes(file.mimetype)) {
      errors.push(`Invalid MIME type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`);
    }

    // 7. Read file and validate signature (magic bytes)
    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(file.path);
    } catch (readError) {
      errors.push('Unable to read uploaded file');
      return { isValid: false, errors, warnings };
    }

    // 8. Check file signature matches MIME type
    const signatureValid = validateFileSignature(fileBuffer, file.mimetype);
    if (!signatureValid) {
      errors.push('File signature does not match MIME type (possible file spoofing)');
    }

    // 9. Additional security checks
    
    // Check for embedded scripts in image files
    const fileContent = fileBuffer.toString('ascii').toLowerCase();
    const scriptPatterns = [
      '<script', 'javascript:', 'vbscript:', 'onload=', 'onerror=',
      '<?php', '<%', 'eval(', 'exec(', 'system('
    ];
    
    for (const pattern of scriptPatterns) {
      if (fileContent.includes(pattern)) {
        errors.push('File contains potentially malicious content');
        break;
      }
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr)$/i,
      /[<>:"\/\\|?*]/,  // Invalid filename characters
      /^\./,            // Hidden files
      /\.{2,}/          // Multiple dots
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        warnings.push('Suspicious filename detected');
        break;
      }
    }

    // 10. File size vs content validation
    if (fileBuffer.length !== file.size) {
      warnings.push('File size mismatch detected');
    }

    // 11. Minimum file size check (avoid empty files)
    if (fileBuffer.length < 100) {
      errors.push('File appears to be empty or too small');
    }

    const isValid = errors.length === 0;

    // Log validation results
    if (!isValid) {
      logWarn('File validation failed', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadType,
        errors
      });
    } else if (warnings.length > 0) {
      logWarn('File validation warnings', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadType,
        warnings
      });
    }

    return {
      isValid,
      errors,
      warnings,
      fileInfo: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extension: fileExt,
        signatureValid
      }
    };

  } catch (error) {
    logError('File validation error', error, {
      filename: file?.originalname,
      uploadType
    });
    
    return {
      isValid: false,
      errors: ['File validation failed due to internal error'],
      warnings: []
    };
  }
};

/**
 * Create enhanced file filter for multer
 * @param {string} uploadType - Type of upload (avatar, article)
 * @returns {Function} Multer file filter function
 */
const createFileFilter = (uploadType) => {
  return (req, file, cb) => {
    // Pre-upload validation (basic checks)
    const allowedMimes = ALLOWED_MIME_TYPES[uploadType];
    const allowedExts = ALLOWED_EXTENSIONS[uploadType];
    const fileExt = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`));
    }

    // Check extension
    if (!allowedExts.includes(fileExt)) {
      return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExts.join(', ')}`));
    }

    // Check for dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(fileExt)) {
      return cb(new Error('File type not allowed for security reasons'));
    }

    // Check filename for suspicious patterns
    if (/[<>:"\/\\|?*]/.test(file.originalname)) {
      return cb(new Error('Invalid characters in filename'));
    }

    cb(null, true);
  };
};

/**
 * Middleware to validate uploaded files after multer processing
 * @param {string} uploadType - Type of upload (avatar, article)
 * @returns {Function} Express middleware function
 */
const validateUploadedFile = (uploadType) => {
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const validation = await validateFile(req.file, uploadType);

      if (!validation.isValid) {
        // Delete the invalid file
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (deleteError) {
          logError('Failed to delete invalid file', deleteError, {
            filePath: req.file.path
          });
        }

        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: validation.errors
        });
      }

      // Add validation info to request for logging
      req.fileValidation = validation;
      
      next();
    } catch (error) {
      logError('File validation middleware error', error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (deleteError) {
          // Ignore delete errors
        }
      }

      res.status(500).json({
        success: false,
        message: 'File validation failed'
      });
    }
  };
};

module.exports = {
  validateFile,
  createFileFilter,
  validateUploadedFile,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZES
};