#!/bin/bash

# Build script for different environments

echo "Building frontend for production..."

# Set the API URL based on your deployment
# Option 1: Specific IP
REACT_APP_API_URL=http://192.168.4.250:8080/api npm run build

# Option 2: Use domain name
# REACT_APP_API_URL=https://api.yourdomain.com npm run build

# Option 3: Build with dynamic detection (uses the config.js logic)
# npm run build

echo "Build complete!"