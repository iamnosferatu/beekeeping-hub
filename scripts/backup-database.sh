#!/bin/bash
# Backup script for BeeKeeper Blog database

# Ensure backup directory exists
BACKUP_DIR="../database-backups"
# mkdir -p $BACKUP_DIR

# Get current date for filename
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/beekeeper_backup_${DATE}.sql"

# Create backup
echo "Creating backup of database..."
docker exec -it beekeeper-blog_db_1 /usr/bin/mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
  # Optional: Compress the backup
  gzip $BACKUP_FILE
  echo "Backup compressed: $BACKUP_FILE.gz"
else
  echo "Backup failed!"
fi