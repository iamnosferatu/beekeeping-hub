const { ForumCategory, ForumThread, ForumComment, UserForumBan } = require('../src/models');

async function testForumStats() {
  try {
    console.log('Testing Forum Stats queries...\n');

    // Test basic counts
    console.log('1. Testing basic counts:');
    const categoriesCount = await ForumCategory.count();
    console.log(`   Categories: ${categoriesCount}`);
    
    const threadsCount = await ForumThread.count();
    console.log(`   Threads: ${threadsCount}`);
    
    const commentsCount = await ForumComment.count();
    console.log(`   Comments: ${commentsCount}`);
    
    // Test blocked counts
    console.log('\n2. Testing blocked counts:');
    const blockedCategoriesCount = await ForumCategory.count({ where: { is_blocked: true } });
    console.log(`   Blocked Categories: ${blockedCategoriesCount}`);
    
    const blockedThreadsCount = await ForumThread.count({ where: { is_blocked: true } });
    console.log(`   Blocked Threads: ${blockedThreadsCount}`);
    
    const blockedCommentsCount = await ForumComment.count({ where: { is_blocked: true } });
    console.log(`   Blocked Comments: ${blockedCommentsCount}`);
    
    // Test banned users
    console.log('\n3. Testing banned users count:');
    const bannedUsersCount = await UserForumBan.count();
    console.log(`   Banned Users: ${bannedUsersCount}`);
    
    // Test recent threads query
    console.log('\n4. Testing recent threads query:');
    const recentThreads = await ForumThread.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });
    console.log(`   Found ${recentThreads.length} recent threads`);
    
    console.log('\n✅ All queries executed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
}

testForumStats();