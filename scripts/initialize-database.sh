#!/bin/bash
# Database initialization script for BeeKeeper's Blog

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}BeeKeeper's Blog Database Initialization${NC}"
echo "This script will initialize the database for development."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Check if the database container is running
DB_CONTAINER=$(docker ps -q -f name=beekeeper-blog_db_1)
if [ -z "$DB_CONTAINER" ]; then
  echo -e "${YELLOW}Database container is not running. Starting containers...${NC}"
  docker-compose up -d
  
  # Wait for DB container to be healthy
  echo "Waiting for database to be ready..."
  while [ "$(docker inspect -f {{.State.Health.Status}} beekeeper-blog_db_1 2>/dev/null)" != "healthy" ]; do
    printf "."
    sleep 2
  done
  echo -e "\n${GREEN}Database is ready!${NC}"
fi

# Check if we need to run migrations
echo -e "${YELLOW}Checking if migrations are needed...${NC}"
# This could be enhanced with a more sophisticated check later
echo -e "${GREEN}Migrations will be applied when the backend starts.${NC}"

# Run database seeds if requested
read -p "Do you want to seed the database with initial data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Seeding database...${NC}"
  
  # Use the backend container to run the seed command
  if docker-compose exec backend npm run seed; then
    echo -e "${GREEN}Database seeded successfully!${NC}"
  else
    echo -e "${RED}Error: Failed to seed database.${NC}"
    echo "Try running: docker-compose exec backend npm run seed"
  fi
fi

echo -e "${GREEN}Database initialization completed!${NC}"
echo "You can now use the application with the database."
echo "To create a backup: ./scripts/backup-database.sh"
echo "To restore a backup: ./scripts/restore-database.sh <backup-file>"