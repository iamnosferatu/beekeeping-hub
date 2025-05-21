#!/bin/bash
# Restore script for BeeKeeper Blog database

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./database-backups/beekeeper_backup_20250520_120000.sql"
  exit 1
fi

BACKUP_DIR="../database-backups"
MYFILE=$1
BACKUP_FILE=${BACKUP_DIR}${MYFILE}}

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Check if it's a compressed file and decompress it
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup file..."
  gunzip -k "$BACKUP_FILE"
  BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Restore backup
echo "Restoring database from backup: $BACKUP_FILE"
docker exec -i beekeeper-blog_db_1 /usr/bin/mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < $BACKUP_FILE

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo "Restore completed successfully"
else
  echo "Restore failed!"
fi