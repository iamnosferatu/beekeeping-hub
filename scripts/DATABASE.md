# Database Management Guide

This guide explains how to manage the database for the BeeKeeper's Blog application in development and production environments.

## Database Architecture

- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Models**:
  - User: Authentication and user information
  - Article: Blog posts content
  - Comment: User comments on articles
  - Tag: Categories for articles
  - Like: User likes on articles

## Development Setup

### Initial Setup

1. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Initialize the database:
   ```bash
   ./scripts/initialize-database.sh
   ```
   This will:
   - Check if the database container is running
   - Wait for the database to be ready
   - Offer to seed the database with initial data

### Database Migrations

Migrations are automatically run when the backend starts in development mode, thanks to this code in `backend/src/index.js`:

```javascript
// Sync models with database - only in development
if (process.env.NODE_ENV === "development") {
  await sequelize.sync({ alter: true });
  console.log("Database models synchronized.");
}
```

In a production environment, you should use proper Sequelize migrations instead of `sync({ alter: true })`.

### Seeding Data

To seed the database with initial data:

```bash
docker-compose exec backend npm run seed
```

This will populate the database with:
- Test users (admin, author, user)
- Sample articles
- Tags
- Comments

## Database Persistence

The database data is stored in a Docker named volume `db-data`, which persists even if the containers are stopped or removed.

### Important Database Operations

#### Backups

To create a database backup:

```bash
./scripts/backup-database.sh
```

This creates a timestamped SQL backup in the `database-backups` directory and compresses it with gzip.

#### Restores

To restore from a backup:

```bash
./scripts/restore-database.sh database-backups/beekeeper_backup_YYYYMMDD_HHMMSS.sql[.gz]
```

#### Accessing the Database

To directly access the MySQL console:

```bash
docker-compose exec db mysql -u root -p
# Enter the root password from docker-compose.yml or .env
```

#### Using phpMyAdmin

The project comes with phpMyAdmin for visual database management:

1. Access phpMyAdmin at: http://localhost:8081
2. Login with:
   - Username: root
   - Password: the value of MYSQL_ROOT_PASSWORD in docker-compose.yml

## Troubleshooting

### Connection Issues

If the backend can't connect to the database:

1. Check if the database container is running:
   ```bash
   docker-compose ps
   ```

2. Verify database logs for errors:
   ```bash
   docker-compose logs db
   ```

3. Check connection parameters in `.env` file match the database container's environment variables.

4. Try restarting the containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Data Reset

To completely reset the database (⚠️ ALL DATA WILL BE LOST):

```bash
# Stop containers
docker-compose down

# Remove the volume
docker volume rm beekeeper-hub_db-data

# Start containers again
docker-compose up -d

# Re-initialize the database
./scripts/initialize-database.sh
```

## Production Considerations

For production environments:

1. Use a more robust backup strategy with scheduled backups
2. Store backups outside the application directory
3. Use proper database migrations instead of `sync({ alter: true })`
4. Consider using a managed database service instead of a container
5. Set stronger passwords and restrict network access