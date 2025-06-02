// Simple test to reproduce the auth error
const express = require('express');
const { protect, authorize } = require('./src/middleware/auth');

const app = express();
app.use(express.json());

// Add debug logging
app.use((req, res, next) => {
  console.log('\n--- Incoming Request ---');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Auth Header:', req.headers.authorization || 'None');
  next();
});

// Test route that mimics article delete
app.delete('/test/:id', protect, authorize('author', 'admin'), (req, res) => {
  console.log('Made it to handler!');
  console.log('User:', req.user);
  res.json({ success: true, message: 'Test passed!' });
});

// Start server
const server = app.listen(3001, () => {
  console.log('Test server running on port 3001');
  console.log('\nTo test, run in another terminal:');
  console.log('curl -X DELETE http://localhost:3001/test/1 -H "Authorization: Bearer YOUR_TOKEN"');
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});