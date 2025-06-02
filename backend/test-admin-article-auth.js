// Test script to debug admin article authorization issue
const jwt = require('jsonwebtoken');
const { User, Article } = require('./src/models');
const { sequelize } = require('./src/models');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

async function testAdminAuth() {
  try {
    console.log('=== Testing Admin Article Authorization ===\n');

    // 1. Find admin user
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error('ERROR: No admin user found in database!');
      console.log('Run: npm run seed or node scripts/create-admin.js');
      return;
    }

    console.log('Admin user found:');
    console.log('- ID:', adminUser.id);
    console.log('- Username:', adminUser.username);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('');

    // 2. Generate token for admin
    const token = jwt.sign({ id: adminUser.id }, JWT_SECRET, { expiresIn: '30d' });
    console.log('Generated token for admin (first 50 chars):', token.substring(0, 50) + '...');
    
    // 3. Simulate auth middleware
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('\nDecoded token:', decoded);
    
    // Fetch user as auth middleware does
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    console.log('\nUser fetched by auth middleware:');
    console.log('- ID:', user.id);
    console.log('- Role:', user.role);
    console.log('- Is admin?:', user.role === 'admin');

    // 4. Find a test article
    const article = await Article.findOne();
    if (!article) {
      console.log('\nNo articles found to test with.');
      return;
    }

    console.log('\nTest article:');
    console.log('- ID:', article.id);
    console.log('- Title:', article.title);
    console.log('- Owner ID:', article.user_id);
    console.log('- Is admin the owner?:', article.user_id === adminUser.id);

    // 5. Simulate authorization checks
    console.log('\n=== Authorization Checks ===');
    
    // Check authorize middleware
    const roles = ['author', 'admin'];
    const passesAuthorize = roles.includes(user.role);
    console.log(`\nauthorize("author", "admin") check:`);
    console.log(`- User role: ${user.role}`);
    console.log(`- Allowed roles: ${roles.join(', ')}`);
    console.log(`- Passes? ${passesAuthorize ? 'YES' : 'NO'}`);

    // Check deleteArticle controller logic
    const isOwner = article.user_id === user.id;
    const isAdmin = user.role === 'admin';
    const canDelete = isOwner || isAdmin;
    
    console.log('\ndeleteArticle controller check:');
    console.log(`- Is owner? ${isOwner}`);
    console.log(`- Is admin? ${isAdmin}`);
    console.log(`- Can delete? ${canDelete ? 'YES' : 'NO'}`);

    if (!canDelete) {
      console.log('\nERROR: Admin should be able to delete any article!');
      console.log('Check the deleteArticle controller logic.');
    }

    // 6. Log potential issues
    console.log('\n=== Potential Issues ===');
    if (user.role !== 'admin') {
      console.log('1. User role is not "admin" - check database');
    }
    if (!passesAuthorize) {
      console.log('2. User fails authorize middleware - check role');
    }
    if (user.role === 'admin' && !canDelete) {
      console.log('3. Admin check in controller might be failing');
      console.log('   Check: req.user.role === "admin"');
      console.log('   Actual user.role type:', typeof user.role);
      console.log('   Actual user.role value:', JSON.stringify(user.role));
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await sequelize.close();
  }
}

testAdminAuth();