// scripts/test-database.js
require("dotenv").config();
const {
  sequelize,
  User,
  Article,
  Comment,
  Tag,
} = require("../src/models");

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Test User model
    console.log("\nTesting User model:");
    const userCount = await User.count();
    console.log(`- Found ${userCount} users in the database.`);

    // Test Article model
    console.log("\nTesting Article model:");
    const articleCount = await Article.count();
    console.log(`- Found ${articleCount} articles in the database.`);

    // Test Comment model
    console.log("\nTesting Comment model:");
    const commentCount = await Comment.count();
    console.log(`- Found ${commentCount} comments in the database.`);

    // Test Tag model
    console.log("\nTesting Tag model:");
    const tagCount = await Tag.count();
    console.log(`- Found ${tagCount} tags in the database.`);

    // Test relationships
    if (userCount > 0) {
      console.log("\nTesting relationships:");

      // Get a user with their articles
      const userWithArticles = await User.findOne({
        include: [{ association: "articles" }],
      });

      if (userWithArticles) {
        console.log(
          `- User ${userWithArticles.username} has ${userWithArticles.articles.length} articles.`
        );
      }

      // Get an article with its author and comments
      const articleWithDetails = await Article.findOne({
        include: [
          { association: "author" },
          { association: "comments" },
          { association: "tags" },
        ],
      });

      if (articleWithDetails) {
        console.log(
          `- Article "${articleWithDetails.title}" by ${
            articleWithDetails.author?.username || "unknown"
          } has ${articleWithDetails.comments.length} comments and ${
            articleWithDetails.tags.length
          } tags.`
        );
      }
    }

    console.log("\nDatabase test completed successfully!");
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Run the function
testDatabase();
