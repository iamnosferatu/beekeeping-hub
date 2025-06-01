# Enhanced File Upload Validation

## Overview

The backend now implements comprehensive file upload validation to prevent malicious file uploads, file spoofing attacks, and ensure only legitimate image files are accepted.

## Security Features

### 1. Multi-Layer Validation
- **File Extension Validation**: Checks allowed extensions (.jpg, .jpeg, .png, .gif, .webp)
- **MIME Type Validation**: Validates MIME type matches allowed types
- **File Signature Validation**: Verifies magic bytes match the claimed file type
- **Content Scanning**: Scans file content for malicious scripts and patterns
- **Size Validation**: Enforces minimum and maximum file sizes

### 2. File Signature (Magic Bytes) Validation
The system validates actual file headers to prevent file spoofing:

```javascript
// JPEG signatures
[0xFF, 0xD8, 0xFF, 0xE0] // JFIF
[0xFF, 0xD8, 0xFF, 0xE1] // EXIF
[0xFF, 0xD8, 0xFF, 0xDB] // Standard

// PNG signature  
[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

// GIF signatures
[0x47, 0x49, 0x46, 0x38, 0x37, 0x61] // GIF87a
[0x47, 0x49, 0x46, 0x38, 0x39, 0x61] // GIF89a

// WebP signature
[0x52, 0x49, 0x46, 0x46, ..., 0x57, 0x45, 0x42, 0x50]
```

### 3. Malicious Content Detection
Scans for dangerous patterns:
- Script tags: `<script`, `</script>`
- JavaScript: `javascript:`, `eval()`, `exec()`
- Server-side code: `<?php`, `<%`, `system()`
- Event handlers: `onload=`, `onerror=`

### 4. Dangerous File Type Prevention
Blocks potentially dangerous extensions:
```
.exe, .bat, .cmd, .com, .pif, .scr, .vbs, .js, .jar
.php, .asp, .jsp, .py, .rb, .pl, .sh, .ps1, .app
.deb, .rpm, .dmg, .iso, .msi, .zip, .rar, .7z
```

## Configuration

### Upload Type Limits

#### Avatar Uploads
- **Max Size**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Extensions**: .jpg, .jpeg, .png, .gif, .webp

#### Article Images
- **Max Size**: 10MB  
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Extensions**: .jpg, .jpeg, .png, .gif, .webp

### Multer Configuration
Enhanced with additional security limits:
```javascript
{
  fileSize: MAX_FILE_SIZES.avatar, // 5MB for avatars
  files: 1,        // Only 1 file per upload
  fields: 1,       // Only 1 form field
  fieldNameSize: 100,    // Limit field name length
  fieldSize: 1024 * 1024 // Limit field value size
}
```

## Implementation

### File Validation Flow
1. **Pre-upload Filter**: Basic MIME type and extension validation in multer
2. **Post-upload Validation**: Comprehensive validation after file is saved
3. **Signature Verification**: Read file bytes and verify magic numbers
4. **Content Scanning**: Scan for malicious patterns
5. **Security Checks**: Additional security validations
6. **Cleanup**: Delete invalid files immediately

### Route Integration
```javascript
// Avatar upload with validation
router.post("/avatar", 
  rateLimiters.fileUpload,
  protect,
  uploadAvatar.single("avatar"),
  validateUploadedFile('avatar'),
  uploadController.uploadAvatar
);

// Article image upload with validation  
router.post("/upload-image",
  rateLimiters.fileUpload,
  protect,
  authorize("author", "admin"),
  uploadArticleImage.single("image"),
  validateUploadedFile('article'),
  uploadController.uploadArticleImage
);
```

## Validation Results

### Successful Upload Response
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "url": "/uploads/articles/article-1234567890-123456789.jpg",
  "filename": "article-1234567890-123456789.jpg",
  "validation": {
    "warnings": [] // Optional warnings array
  }
}
```

### Failed Validation Response
```json
{
  "success": false,
  "message": "File validation failed",
  "errors": [
    "File signature does not match MIME type (possible file spoofing)",
    "File contains potentially malicious content"
  ]
}
```

## Security Logging

All validation events are logged with comprehensive details:

### Successful Upload Log
```json
{
  "level": "info",
  "message": "Avatar uploaded successfully",
  "filename": "avatar-1-1234567890-123456789.jpg",
  "originalName": "profile.jpg",
  "size": 524288,
  "userId": 1,
  "validation": {
    "originalName": "profile.jpg",
    "mimeType": "image/jpeg", 
    "size": 524288,
    "extension": ".jpg",
    "signatureValid": true
  }
}
```

### Failed Validation Log
```json
{
  "level": "warn",
  "message": "File validation failed",
  "filename": "malicious.jpg",
  "mimetype": "image/jpeg",
  "size": 1024,
  "uploadType": "avatar",
  "errors": [
    "File contains potentially malicious content"
  ]
}
```

## Monitoring & Alerts

### Security Events to Monitor
- File validation failures
- File signature mismatches (possible spoofing attempts)
- Malicious content detection
- Dangerous file type upload attempts
- Repeated validation failures from same IP

### Recommended Alerts
- **High Priority**: Malicious content detected
- **Medium Priority**: File spoofing attempts (signature mismatch)
- **Low Priority**: Invalid file type uploads

## Best Practices

### For Developers
1. **Always validate files server-side** - Never trust client validation alone
2. **Store uploads outside web root** - Prevent direct execution of uploaded files
3. **Use virus scanning** - Consider integrating with antivirus solutions
4. **Implement content-based routing** - Serve files through controlled endpoints
5. **Regular security audits** - Review and update validation rules

### For Deployment
1. **File system permissions** - Restrict upload directory permissions
2. **Web server configuration** - Disable script execution in upload directories
3. **Content Security Policy** - Implement CSP headers
4. **Regular monitoring** - Monitor validation logs for attack patterns

## Testing

The validation system includes comprehensive test coverage:

```bash
# Run file validation tests
node test-file-validation.js
```

Test scenarios include:
- ✅ Valid image files (JPEG, PNG, GIF, WebP)
- ❌ File signature spoofing attempts
- ❌ Malicious content in files
- ❌ Dangerous file extensions
- ❌ Empty or corrupted files
- ❌ MIME type mismatches

## Performance Considerations

### File Size Impact
- **Small files (<1MB)**: Minimal performance impact
- **Large files (5-10MB)**: Slight increase in upload processing time
- **Signature validation**: Fast operation (~1-5ms per file)
- **Content scanning**: Scales with file size (~10-50ms for typical images)

### Memory Usage
- Files are read into memory for validation
- Memory usage = file size during validation
- Files are automatically cleaned up after validation

## Future Enhancements

### Planned Improvements
1. **Virus Scanning Integration**: ClamAV or similar antivirus integration
2. **Image Metadata Stripping**: Remove potentially dangerous EXIF data
3. **Image Resizing**: Automatic resizing to prevent oversized uploads
4. **Content-based File Type Detection**: Enhanced file type detection
5. **Redis Caching**: Cache validation results for repeated uploads

### Advanced Security Features
1. **Quarantine System**: Isolate suspicious files for manual review
2. **Machine Learning**: AI-based malicious content detection
3. **Behavioral Analysis**: Pattern recognition for attack detection
4. **Integration with SIEM**: Security information and event management

## Troubleshooting

### Common Issues

#### File Upload Fails with "File validation failed"
- Check file type is supported (JPEG, PNG, GIF, WebP)
- Verify file is not corrupted
- Ensure file size is within limits
- Check server logs for specific error details

#### Valid files rejected
- Verify MIME type matches file extension
- Check file signature is not corrupted
- Ensure file contains valid image data

#### Performance issues
- Monitor file sizes being uploaded
- Check server memory usage during validation
- Consider implementing file size limits

### Debug Mode
Enable debug logging to troubleshoot validation issues:
```javascript
// Set LOG_LEVEL=debug in environment
LOG_LEVEL=debug npm run prod
```