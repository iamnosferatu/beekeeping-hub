// backend/src/utils/jwt-troubleshooter.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Get JWT secret from environment with fallback
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

// Test token generation with specific user ID
const testGenerateToken = (userId) => {
  console.log(`\nTesting token generation for user ID: ${userId}`);
  console.log("-----------------------------------");

  try {
    // Generate token
    const token = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log("Token generated successfully");
    console.log("Token:", token);

    // Parse and verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    return token;
  } catch (error) {
    console.error("Error in token generation/verification:", error);
    return null;
  }
};

// Test token verification
const testVerifyToken = (token) => {
  console.log("\nTesting token verification");
  console.log("-----------------------------------");

  if (!token) {
    console.log("No token provided for verification");
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully");
    console.log("Decoded token:", decoded);
  } catch (error) {
    console.error("Token verification failed:", error);

    if (error.name === "JsonWebTokenError") {
      console.log(
        "This typically means the token is malformed or the secret is incorrect"
      );
    } else if (error.name === "TokenExpiredError") {
      console.log("The token has expired");
    }
  }
};

// Test if JWT_SECRET is valid for signing
const testJwtSecret = () => {
  console.log("\nTesting JWT_SECRET validity");
  console.log("-----------------------------------");

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set!");
    return;
  }

  try {
    // Try to sign a token with the secret
    const testToken = jwt.sign({ test: true }, JWT_SECRET);
    console.log("JWT_SECRET is valid for signing");

    // Try to verify the token
    jwt.verify(testToken, JWT_SECRET);
    console.log("JWT_SECRET is valid for verification");
  } catch (error) {
    console.error("JWT_SECRET test failed:", error);
  }
};

// Run diagnostics
console.log("JWT Diagnostics");
console.log("===============");

// Test JWT_SECRET validity
testJwtSecret();

// Test token generation and verification
const testToken = testGenerateToken(1);
testVerifyToken(testToken);

// Additional diagnostic info
console.log("\nJWT Environment");
console.log("-----------------------------------");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "JWT library version:",
  require("jsonwebtoken/package.json").version
);

console.log("\nDone!");
