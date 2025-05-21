# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Set environment to development
ENV NODE_ENV=development

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]