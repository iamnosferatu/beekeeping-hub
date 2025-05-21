// backend/src/utils/jwt-secret-checker.js
require("dotenv").config();

console.log("Checking JWT_SECRET environment variable:");
console.log("-----------------------------------");

if (process.env.JWT_SECRET) {
  console.log("JWT_SECRET is set");
  console.log(
    "First 20 characters:",
    process.env.JWT_SECRET.substring(0, 20) + "..."
  );
  console.log("Length:", process.env.JWT_SECRET.length);
} else {
  console.log("WARNING: JWT_SECRET is not set!");
  console.log("Using fallback secret which is insecure");
}

console.log("-----------------------------------");
