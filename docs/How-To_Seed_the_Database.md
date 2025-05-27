# Database Seeding Guide for BeeKeeper Blog

## Prerequisites

Before running the seeding script, you need to ensure your database is properly configured and has the necessary permissions.

## Step 1: Database Configuration

### Update Your .env File

For seeding to work properly, you need to use database credentials with full permissions:

```env
# backend/.env
DB_HOST=localhost
DB_USER=root           # Use root or a user with CREATE/DROP privileges
DB_PASSWORD=yourpassword
DB_NAME=beekeeping_blog
DB_PORT=3306

# Force sync during seeding (optional)
DB_SYNC=true
```

⚠️ **Important**: The database user needs these permissions:
- CREATE TABLE
- DROP TABLE  
- INSERT
- UPDATE
- DELETE
- ALTER

## Step 2: Prepare the Database

### Option A: Complete Reset (Recommended)

1. **Connect to MySQL as root**:
   ```bash
   mysql -u root -p
   ```

2. **Drop and recreate the database**:
   ```sql
   DROP DATABASE IF EXISTS beekeeping_blog;
   CREATE DATABASE beekeeping_blog;
   USE beekeeping_blog;
   ```

3. **Exit MySQL**:
   ```sql
   exit;
   ```

### Option B: Clear Existing Tables

If you want to keep the database but clear all data:

```sql
USE beekeeping_blog;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS Likes;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS Tags;
DROP TABLE IF EXISTS Users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

## Step 3: Run the Seeding Script

### 1. Navigate to the backend directory:
```bash
cd backend
```

### 2. Install dependencies (if not already done):
```bash
npm install
```

### 3. Run the seeding script:

**For a complete reset (drops all tables first)**:
```bash
FORCE_SYNC=true node src/seeds/seed-data.js
```

**For normal seeding (requires empty tables)**:
```bash
node src/seeds/seed-data.js
```

## Step 4: Verify the Seeding

After successful seeding, you should see output like:

```
🌱 Starting database seeding...
✅ Models loaded successfully
✅ Database connection established
👥 Creating users...
✅ Created user: admin
✅ Created user: johndoe
✅ Created user: janebee
✅ Created user: reader1
✅ Created 4 users total
🏷️  Creating tags...
✅ Created 8 tags
📝 Creating articles...
✅ Created article: "Getting Started with Beekeeping: A Complete Beginner's Guide"
[... more articles ...]
💬 Creating comments...
✅ Created 8 comments

🎉 Database seeding completed!
📊 Summary:
   - 4 users created
   - 8 tags created
   - 8 articles created
   - 8 comments created

✅ Your BeeKeeper Blog is ready to use!

🔐 Login credentials:
   Admin: admin@beekeeper.com / Admin123!
   Author: john@example.com / Password123!
   Author: jane@example.com / Password123!
   Reader: reader@example.com / Password123!
```

## Step 5: Post-Seeding Security

After seeding is complete, you should:

1. **Update your .env file** to use a restricted user for normal operations:
   ```env
   DB_USER=beekeeping_user  # User with limited permissions
   DB_PASSWORD=securepwd
   ```

2. **Create a restricted database user** (if not already exists):
   ```sql
   CREATE USER 'beekeeping_user'@'localhost' IDENTIFIED BY 'securepwd';
   GRANT SELECT, INSERT, UPDATE, DELETE ON beekeeping_blog.* TO 'beekeeping_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## Troubleshooting

### Common Issues and Solutions

1. **"Access denied" error**
   - Solution: Use root credentials or a user with full privileges

2. **"Table already exists" error**
   - Solution: Drop the database and recreate it, or use `FORCE_SYNC=true`

3. **"Cannot add foreign key constraint" error**
   - Solution: Ensure all tables are dropped before recreating

4. **"Unknown column" error**
   - Solution: The schema might be out of sync. Drop all tables and retry

### Checking Database Status

To verify your tables were created correctly:

```sql
USE beekeeping_blog;
SHOW TABLES;

-- Should show:
-- Articles
-- Comments  
-- Likes
-- Tags
-- Users
-- article_tags

-- Check record counts:
SELECT 'Users' as table_name, COUNT(*) as count FROM Users
UNION ALL
SELECT 'Articles', COUNT(*) FROM Articles
UNION ALL
SELECT 'Tags', COUNT(*) FROM Tags
UNION ALL
SELECT 'Comments', COUNT(*) FROM Comments;
```

## Alternative: Using a Seeding Script

Create a shell script for easier seeding:

```bash
#!/bin/bash
# backend/seed-database.sh

echo "🚨 This will delete all existing data! Continue? (y/n)"
read -r response

if [[ "$response" == "y" ]]; then
    echo "🗑️  Clearing database..."
    mysql -u root -p -e "DROP DATABASE IF EXISTS beekeeping_blog; CREATE DATABASE beekeeping_blog;"
    
    echo "🌱 Running seed script..."
    FORCE_SYNC=true node src/seeds/seed-data.js
    
    echo "✅ Seeding complete!"
else
    echo "❌ Seeding cancelled"
fi
```

Make it executable:
```bash
chmod +x seed-database.sh
./seed-database.sh
```

## Best Practices

1. **Never use root credentials in production**
2. **Always backup your database before seeding**
3. **Use environment-specific .env files** (.env.development, .env.production)
4. **Keep seeding scripts in version control**
5. **Document any custom seed data requirements**

## Next Steps

After successful seeding:

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd ../frontend
   npm start
   ```

3. Test login with the seeded credentials
4. Verify all features are working correctly

Remember to switch back to restricted database credentials for normal development work!