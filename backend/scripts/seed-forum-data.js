const { User, ForumCategory, ForumThread, ForumComment } = require('../src/models');
const { sequelize } = require('../src/models');

async function seedForumData() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Get some users to create content
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    const authorUser = await User.findOne({ where: { role: 'author' } });
    const regularUser = await User.findOne({ where: { role: 'user' } });
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    console.log(`Found users - Admin: ${adminUser.id}, Author: ${authorUser?.id || 'none'}, Regular: ${regularUser?.id || 'none'}`);
    console.log('Creating forum categories...');
    
    // Create categories one by one to avoid confusion
    const categories = [];
    
    categories.push(await ForumCategory.create({
      name: 'General Discussion',
      description: 'General beekeeping topics and discussions',
      userId: adminUser.id
    }));
    
    categories.push(await ForumCategory.create({
      name: 'Beginner Questions',
      description: 'New to beekeeping? Ask your questions here',
      userId: adminUser.id
    }));
    
    categories.push(await ForumCategory.create({
      name: 'Hive Management',
      description: 'Tips and techniques for managing your hives',
      userId: authorUser ? authorUser.id : adminUser.id
    }));
    
    categories.push(await ForumCategory.create({
      name: 'Bee Health & Diseases',
      description: 'Discuss bee health issues, diseases, and treatments',
      userId: authorUser ? authorUser.id : adminUser.id
    }));
    
    categories.push(await ForumCategory.create({
      name: 'Equipment & Tools',
      description: 'Reviews and discussions about beekeeping equipment',
      userId: adminUser.id
    }));
    
    categories.push(await ForumCategory.create({
      name: 'Honey & Products',
      description: 'Everything about honey harvesting, processing, and bee products',
      userId: authorUser ? authorUser.id : adminUser.id
    }));
    
    console.log(`✅ Created ${categories.length} forum categories`);
    
    // Create some threads
    console.log('Creating forum threads...');
    
    const threads = [];
    
    // General Discussion threads
    threads.push(await ForumThread.create({
      title: 'Welcome to the Beekeeping Forum!',
      content: 'Hello everyone! This is the official beekeeping forum where we can share our experiences, ask questions, and learn from each other. Please introduce yourself and tell us about your beekeeping journey!',
      categoryId: categories[0].id,
      userId: adminUser.id,
      isPinned: true
    }));
    
    threads.push(await ForumThread.create({
      title: 'What got you started in beekeeping?',
      content: 'I\'m curious to hear everyone\'s story about how they got into beekeeping. For me, it started when I inherited a few hives from my grandfather. What\'s your story?',
      categoryId: categories[0].id,
      userId: authorUser ? authorUser.id : adminUser.id
    }));
    
    // Beginner Questions threads
    threads.push(await ForumThread.create({
      title: 'Best hive type for beginners?',
      content: 'I\'m planning to start beekeeping this spring. What type of hive would you recommend for a complete beginner? I\'ve heard about Langstroth, Top Bar, and Warre hives but not sure which to choose.',
      categoryId: categories[1].id,
      userId: regularUser ? regularUser.id : adminUser.id
    }));
    
    threads.push(await ForumThread.create({
      title: 'How many hives should I start with?',
      content: 'As a new beekeeper, I\'m wondering if I should start with one hive or multiple hives. What are the pros and cons of each approach?',
      categoryId: categories[1].id,
      userId: regularUser ? regularUser.id : adminUser.id
    }));
    
    // Hive Management threads
    threads.push(await ForumThread.create({
      title: 'Spring hive inspection checklist',
      content: 'With spring approaching, here\'s my checklist for the first hive inspection:\n\n1. Check for queen presence (eggs/larvae)\n2. Assess colony strength\n3. Look for signs of disease\n4. Check food stores\n5. Clean bottom board\n6. Replace old frames if needed\n\nWhat would you add to this list?',
      categoryId: categories[2].id,
      userId: authorUser ? authorUser.id : adminUser.id,
      isPinned: true
    }));
    
    threads.push(await ForumThread.create({
      title: 'Dealing with aggressive colonies',
      content: 'One of my colonies has become increasingly aggressive over the past few weeks. Any tips on how to handle this? Should I consider requeening?',
      categoryId: categories[2].id,
      userId: regularUser ? regularUser.id : adminUser.id
    }));
    
    // Bee Health threads
    threads.push(await ForumThread.create({
      title: 'Varroa mite treatment options',
      content: 'Let\'s discuss different varroa mite treatment methods. I\'ve been using oxalic acid vaporization with good results. What treatments have worked well for you?',
      categoryId: categories[3].id,
      userId: authorUser ? authorUser.id : adminUser.id
    }));
    
    // Equipment threads
    threads.push(await ForumThread.create({
      title: 'DIY hive stand ideas',
      content: 'I\'m looking for DIY hive stand ideas that are both functional and affordable. Please share your designs and experiences!',
      categoryId: categories[4].id,
      userId: regularUser ? regularUser.id : adminUser.id
    }));
    
    // Honey & Products threads
    threads.push(await ForumThread.create({
      title: 'When is the best time to harvest honey?',
      content: 'This will be my first honey harvest. How do you know when the honey is ready to harvest? What moisture content should I aim for?',
      categoryId: categories[5].id,
      userId: regularUser ? regularUser.id : adminUser.id
    }));
    
    console.log(`✅ Created ${threads.length} forum threads`);
    
    // Create some comments
    console.log('Creating forum comments...');
    
    let commentCount = 0;
    
    // Comments on the welcome thread
    if (authorUser) {
      await ForumComment.create({
        content: 'Great to see the forum up and running! I\'ve been keeping bees for 10 years and I\'m happy to help answer any questions.',
        threadId: threads[0].id,
        userId: authorUser.id
      });
      commentCount++;
    }
    
    if (regularUser) {
      await ForumComment.create({
        content: 'Hi everyone! I\'m new to beekeeping and excited to learn from this community.',
        threadId: threads[0].id,
        userId: regularUser.id
      });
      commentCount++;
    }
    
    // Comments on beginner questions
    if (authorUser) {
      await ForumComment.create({
        content: 'For beginners, I always recommend starting with Langstroth hives. They\'re the most common, so you\'ll find plenty of resources and equipment available. Plus, they\'re easier to inspect and manage.',
        threadId: threads[2].id,
        userId: authorUser.id
      });
      commentCount++;
      
      await ForumComment.create({
        content: 'I\'d suggest starting with two hives. This way you can compare them and if one fails, you can use resources from the other to help it recover.',
        threadId: threads[3].id,
        userId: authorUser.id
      });
      commentCount++;
    }
    
    // Comment on varroa thread
    await ForumComment.create({
      content: 'I\'ve had good success with Apivar strips. They\'re easy to use and effective when used correctly. Just make sure to follow the timing guidelines and remove them after treatment.',
      threadId: threads[6].id,
      userId: adminUser.id
    });
    commentCount++;
    
    // Update thread activity timestamps
    for (const thread of threads) {
      await thread.update({
        lastActivityAt: new Date()
      });
    }
    
    console.log('✅ Forum seed data created successfully!');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${threads.length} threads`);
    console.log(`   - ${commentCount} comments`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding forum data:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error(`   - ${e.message}`));
    }
    process.exit(1);
  }
}

seedForumData();