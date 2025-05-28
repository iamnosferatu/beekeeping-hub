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