// Test script to verify admin authentication and article operations
const jwt = require('jsonwebtoken');

// Get JWT secret from environment with fallback
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

// Test token generation and decoding
const testUserId = 1; // Assuming admin user has ID 1
const token = jwt.sign({ id: testUserId }, JWT_SECRET, { expiresIn: '30d' });

console.log('Generated token:', token);
console.log('\nDecoded token:', jwt.decode(token));

// Verify what's in the token
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('\nVerified token payload:', verified);
} catch (error) {
  console.error('Token verification error:', error);
}

console.log('\nNOTE: The token only contains the user ID, not the role.');
console.log('The role should be fetched from the database when the token is verified.');
console.log('\nTo fix admin article operations:');
console.log('1. Ensure the admin user in the database has role="admin"');
console.log('2. Check that the auth middleware properly attaches the user object with role');
console.log('3. Verify the article controller checks req.user.role correctly');