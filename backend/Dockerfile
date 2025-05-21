# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
#COPY scripts/create-admin.js ./scripts
#COPY scripts/test-database.js ./scripts

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Set environment to development
ENV NODE_ENV=development

# Expose port 8080
EXPOSE 8080

# Start the development server with nodemon for hot reloading
CMD ["npm", "run", "dev"]