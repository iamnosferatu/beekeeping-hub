// backend/src/seeds/seed-data.js
const bcrypt = require("bcryptjs");
const slug = require("slug");

/**
 * Seed database with initial data
 * This function properly imports models and handles the seeding process
 */
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Import models and sequelize instance
    // This is the key fix - we need to import from the models/index.js file
    const { 
      sequelize, 
      User, 
      Article, 
      Tag, 
      Comment, 
      Like, 
      Newsletter, 
      Contact, 
      SiteSettings 
    } = require("../models");

    // Verify models are loaded
    if (!User || !Article || !Tag || !Comment || !Like || !Newsletter || !Contact || !SiteSettings) {
      throw new Error(
        "Models not properly loaded. Check your models/index.js file."
      );
    }

    console.log("✅ Models loaded successfully");

    // Test database connection
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established");
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Optional: Force sync database (drops existing tables)
    // WARNING: This will delete all existing data!
    if (process.env.FORCE_SYNC === "true") {
      console.log("⚠️  Force syncing database (this will drop all tables)...");
      await sequelize.sync({ force: true });
      console.log("✅ Database synced");
    }

    // Create users with hashed passwords
    console.log("👥 Creating users...");
    const users = [];

    // User data to create
    const userData = [
      {
        username: "admin",
        email: "admin@beekeeper.com",
        password: "Admin123!",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        bio: "System administrator for BeeKeeper's Blog",
        is_active: true,
      },
      {
        username: "johndoe",
        email: "john@example.com",
        password: "Password123!",
        first_name: "John",
        last_name: "Doe",
        role: "author",
        bio: "Experienced beekeeper with over 10 years in the field",
        is_active: true,
      },
      {
        username: "janebee",
        email: "jane@example.com",
        password: "Password123!",
        first_name: "Jane",
        last_name: "Smith",
        role: "author",
        bio: "Urban beekeeping enthusiast and educator",
        is_active: true,
      },
      {
        username: "reader1",
        email: "reader@example.com",
        password: "Password123!",
        first_name: "Regular",
        last_name: "Reader",
        role: "user",
        bio: "Learning about beekeeping",
        is_active: true,
      },
    ];

    // Create each user individually with proper password hashing
    for (const userInfo of userData) {
      try {
        // Hash the password for each user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userInfo.password, salt);

        // Create user with hashed password
        const user = await User.create({
          ...userInfo,
          password: hashedPassword,
        });

        users.push(user);
        console.log(`✅ Created user: ${user.username}`);
      } catch (error) {
        console.error(
          `❌ Error creating user ${userInfo.username}:`,
          error.message
        );
        // Continue with other users even if one fails
      }
    }

    console.log(`✅ Created ${users.length} users total`);

    // Create tags
    console.log("🏷️  Creating tags...");
    const tagData = [
      { name: "Beginner", description: "Articles for those new to beekeeping" },
      { name: "Advanced", description: "Advanced beekeeping techniques" },
      { name: "Equipment", description: "Beekeeping tools and equipment" },
      {
        name: "Honey",
        description: "All about honey production and harvesting",
      },
      { name: "Health", description: "Bee health and disease management" },
      { name: "Seasonal", description: "Seasonal beekeeping advice" },
      { name: "Urban", description: "Urban and small-space beekeeping" },
      {
        name: "Queen Rearing",
        description: "Queen bee management and rearing",
      },
    ];

    // Create tags with proper slug generation
    const tags = await Promise.all(
      tagData.map(async (tagInfo) => {
        const tagSlug = slug(tagInfo.name, { lower: true });
        return await Tag.create({
          name: tagInfo.name,
          slug: tagSlug,
          description: tagInfo.description,
        });
      })
    );

    console.log(`✅ Created ${tags.length} tags`);

    // Create articles
    console.log("📝 Creating articles...");
    const articleData = [
      {
        title: "Getting Started with Beekeeping: A Complete Beginner's Guide",
        content: `<h2>Welcome to the World of Beekeeping!</h2>
        <p>Beekeeping is a rewarding hobby that connects you with nature while producing delicious honey. This comprehensive guide will walk you through everything you need to know to start your beekeeping journey.</p>
        
        <h3>Why Keep Bees?</h3>
        <p>There are many reasons to become a beekeeper:</p>
        <ul>
          <li>Produce your own honey and beeswax</li>
          <li>Help pollinate your garden and local plants</li>
          <li>Support declining bee populations</li>
          <li>Learn about these fascinating insects</li>
          <li>Connect with a community of beekeepers</li>
        </ul>
        
        <h3>Essential Equipment</h3>
        <p>Before you get your first bees, you'll need some basic equipment:</p>
        <ol>
          <li><strong>Hive:</strong> The home for your bees (Langstroth hives are most common)</li>
          <li><strong>Protective Gear:</strong> Bee suit, gloves, and veil</li>
          <li><strong>Smoker:</strong> Calms bees during inspections</li>
          <li><strong>Hive Tool:</strong> For prying apart frames</li>
          <li><strong>Feeder:</strong> To supplement bee nutrition when needed</li>
        </ol>
        
        <h3>Getting Your First Bees</h3>
        <p>There are several ways to acquire bees:</p>
        <ul>
          <li><strong>Package Bees:</strong> 3 pounds of bees with a queen</li>
          <li><strong>Nucleus Colony (Nuc):</strong> Small established colony</li>
          <li><strong>Established Colony:</strong> Full hive from another beekeeper</li>
          <li><strong>Swarm Capture:</strong> For more experienced beekeepers</li>
        </ul>
        
        <h3>First Year Timeline</h3>
        <p>Your first year will be focused on helping your colony establish itself:</p>
        <ul>
          <li><strong>Spring:</strong> Install bees, feed if necessary, weekly inspections</li>
          <li><strong>Summer:</strong> Monitor for swarms, ensure adequate space</li>
          <li><strong>Fall:</strong> Prepare for winter, check honey stores</li>
          <li><strong>Winter:</strong> Minimal disturbance, monitor entrance</li>
        </ul>
        
        <p>Remember, beekeeping is a learning journey. Join a local beekeeping association, find a mentor, and don't be afraid to ask questions!</p>`,
        excerpt:
          "Everything you need to know to start your beekeeping journey, from equipment to getting your first bees.",
        featured_image:
          "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
        status: "published",
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        view_count: 245,
        user_id: users[1].id, // John Doe
        tags: ["Beginner", "Equipment"],
      },
      {
        title: "Understanding the Bee Colony: Roles and Hierarchy",
        content: `<h2>The Amazing Organization of a Bee Colony</h2>
        <p>A bee colony is one of nature's most sophisticated societies. Understanding how it works is fundamental to becoming a successful beekeeper.</p>
        
        <h3>The Three Castes</h3>
        <h4>1. The Queen</h4>
        <p>The queen is the mother of the colony. Her primary roles include:</p>
        <ul>
          <li>Laying eggs (up to 2,000 per day in peak season)</li>
          <li>Producing pheromones that unite the colony</li>
          <li>Living 2-5 years (much longer than other bees)</li>
        </ul>
        
        <h4>2. Worker Bees (Females)</h4>
        <p>Worker bees are sterile females that perform all the tasks in the hive:</p>
        <ul>
          <li><strong>Nurse Bees (Days 1-11):</strong> Feed larvae and care for the queen</li>
          <li><strong>House Bees (Days 12-21):</strong> Build comb, store food, guard the entrance</li>
          <li><strong>Forager Bees (Days 22+):</strong> Collect nectar, pollen, water, and propolis</li>
        </ul>
        
        <h4>3. Drones (Males)</h4>
        <p>Drones have one purpose: to mate with virgin queens. Characteristics include:</p>
        <ul>
          <li>No stinger</li>
          <li>Cannot forage or perform hive duties</li>
          <li>Expelled from the hive before winter</li>
        </ul>
        
        <h3>Communication in the Colony</h3>
        <p>Bees communicate through several methods:</p>
        <ul>
          <li><strong>Pheromones:</strong> Chemical messages for various purposes</li>
          <li><strong>Dance Language:</strong> The famous waggle dance indicates food sources</li>
          <li><strong>Vibrations:</strong> Used for various colony communications</li>
        </ul>
        
        <h3>The Annual Cycle</h3>
        <p>Understanding the colony's annual cycle helps you manage your hives effectively:</p>
        <ul>
          <li><strong>Spring:</strong> Rapid growth and potential swarming</li>
          <li><strong>Summer:</strong> Peak population and honey production</li>
          <li><strong>Fall:</strong> Preparation for winter</li>
          <li><strong>Winter:</strong> Clustering for warmth and survival</li>
        </ul>`,
        excerpt:
          "Explore the fascinating social structure of a bee colony and learn about the roles of queens, workers, and drones.",
        featured_image:
          "https://images.unsplash.com/photo-1568526381923-caf3fd520382",
        status: "published",
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        view_count: 189,
        user_id: users[1].id, // John Doe
        tags: ["Beginner", "Advanced"],
      },
      {
        title: "Harvesting Honey: When and How to Do It Right",
        content: `<h2>The Sweet Reward: Harvesting Honey</h2>
        <p>After months of hard work by your bees (and you!), it's finally time to harvest honey. This guide will ensure you do it properly and sustainably.</p>
        
        <h3>When to Harvest</h3>
        <p>Timing is crucial for successful honey harvesting:</p>
        <ul>
          <li>Wait until frames are at least 80% capped</li>
          <li>Typically harvest in late summer or early fall</li>
          <li>Never harvest in your colony's first year</li>
          <li>Leave enough honey for the bees to survive winter (40-60 pounds)</li>
        </ul>
        
        <h3>Equipment Needed</h3>
        <ul>
          <li>Bee suit and protective gear</li>
          <li>Smoker</li>
          <li>Empty supers for transport</li>
          <li>Bee brush or fume board</li>
          <li>Uncapping knife or hot knife</li>
          <li>Extractor (manual or electric)</li>
          <li>Strainer and buckets</li>
          <li>Storage containers</li>
        </ul>
        
        <h3>Step-by-Step Harvesting Process</h3>
        <ol>
          <li><strong>Prepare:</strong> Choose a warm, calm day</li>
          <li><strong>Remove Supers:</strong> Use smoke and remove honey supers</li>
          <li><strong>Transport:</strong> Take supers to extraction area</li>
          <li><strong>Uncap:</strong> Remove wax cappings from frames</li>
          <li><strong>Extract:</strong> Spin frames in extractor</li>
          <li><strong>Strain:</strong> Filter out wax particles</li>
          <li><strong>Settle:</strong> Let honey sit to remove air bubbles</li>
          <li><strong>Bottle:</strong> Pour into clean containers</li>
        </ol>
        
        <h3>Processing and Storage</h3>
        <p>Proper handling ensures quality honey:</p>
        <ul>
          <li>Never heat honey above 110°F (43°C)</li>
          <li>Store in airtight containers</li>
          <li>Keep in a cool, dry place</li>
          <li>Honey never spoils when stored properly</li>
        </ul>`,
        excerpt:
          "Learn the proper techniques for harvesting honey from your hives, including timing, equipment, and processing methods.",
        featured_image:
          "https://images.unsplash.com/photo-1587049352846-4a222e784ba4",
        status: "published",
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        view_count: 312,
        user_id: users[2].id, // Jane Smith
        tags: ["Honey", "Equipment", "Seasonal"],
      },
      {
        title: "Common Bee Diseases and How to Prevent Them",
        content: `<h2>Keeping Your Bees Healthy</h2>
        <p>Healthy bees are productive bees. Learn to recognize and prevent common diseases and pests that affect honey bee colonies.</p>
        
        <h3>Major Diseases</h3>
        <h4>1. Varroa Mites</h4>
        <p>The most serious threat to honey bees worldwide:</p>
        <ul>
          <li>Small reddish-brown parasites that feed on bee blood</li>
          <li>Weaken bees and transmit viruses</li>
          <li>Monitor with sticky boards or alcohol wash</li>
          <li>Treat with approved miticides when levels exceed threshold</li>
        </ul>
        
        <h4>2. American Foulbrood (AFB)</h4>
        <p>A serious bacterial disease affecting larvae:</p>
        <ul>
          <li>Ropey, foul-smelling larvae</li>
          <li>Sunken, perforated cappings</li>
          <li>Highly contagious - burn infected equipment</li>
          <li>Prevention through good hygiene practices</li>
        </ul>
        
        <h4>3. Nosema</h4>
        <p>A gut parasite causing dysentery:</p>
        <ul>
          <li>Fecal spots on hive entrance</li>
          <li>Reduced colony population</li>
          <li>Treat with fumagillin if necessary</li>
          <li>Ensure good ventilation and reduce stress</li>
        </ul>
        
        <h3>Prevention Strategies</h3>
        <ol>
          <li><strong>Regular Inspections:</strong> Check hives every 2-3 weeks during active season</li>
          <li><strong>Strong Colonies:</strong> Maintain populous, well-fed colonies</li>
          <li><strong>Good Genetics:</strong> Use disease-resistant bee strains</li>
          <li><strong>Proper Nutrition:</strong> Ensure adequate pollen and nectar sources</li>
          <li><strong>Hygiene:</strong> Clean equipment and replace old comb</li>
        </ol>
        
        <h3>When to Call for Help</h3>
        <p>Contact your local bee inspector or experienced beekeepers if you notice:</p>
        <ul>
          <li>Unusual mortality rates</li>
          <li>Abnormal brood patterns</li>
          <li>Suspicious larvae or pupae</li>
          <li>Rapid colony decline</li>
        </ul>`,
        excerpt:
          "Identify and prevent common bee diseases and pests to maintain healthy, productive colonies.",
        featured_image:
          "https://images.unsplash.com/photo-1607863717660-375af5bc8a53",
        status: "published",
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        view_count: 156,
        user_id: users[1].id, // John Doe
        tags: ["Health", "Advanced"],
      },
      {
        title: "Urban Beekeeping: Tips for City Dwellers",
        content: `<h2>Beekeeping in the City</h2>
        <p>You don't need acres of countryside to keep bees! Urban beekeeping is growing in popularity and can be just as rewarding as rural beekeeping.</p>
        
        <h3>Benefits of Urban Beekeeping</h3>
        <ul>
          <li>Diverse forage from gardens, parks, and street trees</li>
          <li>Often less pesticide exposure than agricultural areas</li>
          <li>Extended flowering season in warmer city microclimates</li>
          <li>Educational opportunities for neighbors and community</li>
        </ul>
        
        <h3>Getting Started in the City</h3>
        <h4>1. Check Local Regulations</h4>
        <p>Before starting, research:</p>
        <ul>
          <li>City ordinances about beekeeping</li>
          <li>Required permits or registrations</li>
          <li>Setback requirements from property lines</li>
          <li>Maximum number of hives allowed</li>
        </ul>
        
        <h4>2. Choose the Right Location</h4>
        <p>Consider these factors for hive placement:</p>
        <ul>
          <li>Morning sun exposure</li>
          <li>Wind protection</li>
          <li>Easy access for management</li>
          <li>Water source nearby</li>
          <li>Flight path away from neighbors</li>
        </ul>
        
        <h3>Being a Good Neighbor</h3>
        <ul>
          <li>Communicate with neighbors before starting</li>
          <li>Offer to share honey</li>
          <li>Maintain gentle bee strains</li>
          <li>Provide water sources to prevent pool visits</li>
          <li>Use barriers to direct flight paths upward</li>
        </ul>
        
        <h3>Urban Beekeeping Challenges</h3>
        <p>Be prepared for unique urban challenges:</p>
        <ul>
          <li>Limited space for equipment storage</li>
          <li>Potential for vandalism</li>
          <li>Swarm management in populated areas</li>
          <li>Neighbor concerns and education needs</li>
        </ul>`,
        excerpt:
          "Discover how to successfully keep bees in urban environments, including regulations, neighbor relations, and space management.",
        featured_image:
          "https://images.unsplash.com/photo-1591297108812-085d528b5e8c",
        status: "published",
        published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        view_count: 198,
        user_id: users[2].id, // Jane Smith
        tags: ["Urban", "Beginner"],
      },
      {
        title: "Winter Preparation: Helping Your Bees Survive the Cold",
        content: `<h2>Winterizing Your Hive</h2>
        <p>Proper winter preparation is crucial for colony survival. Start preparations in late summer to ensure your bees make it through to spring.</p>
        
        <h3>Fall Inspection Checklist</h3>
        <ul>
          <li>Strong population (covering at least 6-8 frames)</li>
          <li>Young, healthy queen</li>
          <li>40-60 pounds of honey stores</li>
          <li>Low mite levels</li>
          <li>No signs of disease</li>
        </ul>
        
        <h3>Winter Preparations</h3>
        <h4>1. Reduce Entrance</h4>
        <p>Install entrance reducers to:</p>
        <ul>
          <li>Keep out mice</li>
          <li>Reduce drafts</li>
          <li>Make it easier for bees to defend</li>
        </ul>
        
        <h4>2. Ensure Adequate Food</h4>
        <ul>
          <li>Feed 2:1 sugar syrup in early fall</li>
          <li>Switch to fondant or candy boards for emergency feeding</li>
          <li>Never feed liquid in cold weather</li>
        </ul>
        
        <h4>3. Ventilation is Key</h4>
        <p>Provide upper ventilation to:</p>
        <ul>
          <li>Release moisture from bee respiration</li>
          <li>Prevent condensation dripping on cluster</li>
          <li>Use inner cover with notch or ventilation box</li>
        </ul>
        
        <h3>Winter Management</h3>
        <ul>
          <li>Minimal disturbance - never open hive below 50°F</li>
          <li>Check entrance after snow for blockage</li>
          <li>Heft hives to assess food stores</li>
          <li>Listen for buzzing on warm days</li>
          <li>Plan for early spring feeding</li>
        </ul>`,
        excerpt:
          "Essential steps to prepare your bee colonies for winter survival, including feeding, ventilation, and management tips.",
        featured_image:
          "https://images.unsplash.com/photo-1517650862521-d580d5348145",
        status: "published",
        published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        view_count: 267,
        user_id: users[1].id, // John Doe
        tags: ["Seasonal", "Advanced"],
      },
      {
        title: "Building Your Own Beehive: A DIY Guide",
        content: `<h2>DIY Beehive Construction</h2>
        <p>Building your own beehives can save money and give you a deeper understanding of your bees' home. This guide covers building a standard Langstroth hive.</p>
        
        <h3>Materials Needed</h3>
        <ul>
          <li>Pine or cedar boards (3/4" thick)</li>
          <li>Wood glue</li>
          <li>Galvanized nails or screws</li>
          <li>Metal or wood for frame rests</li>
          <li>Aluminum or galvanized steel for outer cover</li>
          <li>Paint or wood stain for weatherproofing</li>
        </ul>
        
        <h3>Tools Required</h3>
        <ul>
          <li>Table saw or circular saw</li>
          <li>Drill with bits</li>
          <li>Hammer or nail gun</li>
          <li>Square and measuring tape</li>
          <li>Sandpaper</li>
        </ul>
        
        <h3>Building Steps</h3>
        <h4>1. Hive Bodies (Deep and Medium Supers)</h4>
        <ol>
          <li>Cut boards to size (16 1/4" x 9 5/8" for deeps)</li>
          <li>Create box joints or rabbet joints</li>
          <li>Glue and nail corners</li>
          <li>Install frame rests</li>
          <li>Sand smooth all surfaces</li>
        </ol>
        
        <h4>2. Bottom Board</h4>
        <ol>
          <li>Build frame with entrance reducer slot</li>
          <li>Attach bottom with slope for drainage</li>
          <li>Add landing board</li>
        </ol>
        
        <h4>3. Inner and Outer Covers</h4>
        <ul>
          <li>Inner cover with ventilation notch</li>
          <li>Outer cover with metal top for weather protection</li>
          <li>Ensure proper bee space (3/8")</li>
        </ul>
        
        <h3>Tips for Success</h3>
        <ul>
          <li>Maintain precise measurements for interchangeable parts</li>
          <li>Use exterior glue and fasteners</li>
          <li>Prime and paint all exterior surfaces</li>
          <li>Consider making extra equipment while set up</li>
        </ul>`,
        excerpt:
          "Step-by-step instructions for building your own Langstroth beehive, including materials, tools, and construction tips.",
        featured_image:
          "https://images.unsplash.com/photo-1585903800626-762c2c52b9f6",
        status: "published",
        published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        view_count: 143,
        user_id: users[1].id, // John Doe
        tags: ["Equipment", "DIY"],
      },
      {
        title: "The Art of Queen Rearing: Producing Your Own Queens",
        content: `<h2>Raising Quality Queens</h2>
        <p>Queen rearing is an advanced skill that can improve your apiary's genetics and save money. Learn the basics of producing your own queen bees.</p>
        
        <h3>Why Rear Your Own Queens?</h3>
        <ul>
          <li>Select for desirable traits (gentleness, productivity, disease resistance)</li>
          <li>Have queens available when needed</li>
          <li>Save money on purchased queens</li>
          <li>Maintain local genetics adapted to your area</li>
        </ul>
        
        <h3>Methods of Queen Rearing</h3>
        <h4>1. Emergency Queen Cells</h4>
        <p>The simplest method for beginners:</p>
        <ul>
          <li>Remove queen from strong colony</li>
          <li>Bees will raise new queens from young larvae</li>
          <li>Select best cells for use</li>
        </ul>
        
        <h4>2. Grafting Method</h4>
        <p>More control over queen quality:</p>
        <ol>
          <li>Transfer 12-24 hour larvae to queen cups</li>
          <li>Place in strong, queenless cell builder</li>
          <li>Move to finisher colony after 24 hours</li>
          <li>Harvest cells on day 10</li>
        </ol>
        
        <h4>3. Miller Method</h4>
        <p>No grafting required:</p>
        <ul>
          <li>Cut comb with young larvae in triangular shape</li>
          <li>Bees build queen cells on cut edges</li>
          <li>Good for small-scale queen rearing</li>
        </ul>
        
        <h3>Mating Nucs</h3>
        <p>Small colonies for queen mating:</p>
        <ul>
          <li>2-3 frames of bees and brood</li>
          <li>Add ripe queen cell or virgin queen</li>
          <li>Ensure adequate drones in area</li>
          <li>Check for eggs after 2-3 weeks</li>
        </ul>
        
        <h3>Timeline</h3>
        <ul>
          <li>Day 1: Graft or create queenless condition</li>
          <li>Day 10: Cells capped</li>
          <li>Day 16: Queens emerge</li>
          <li>Day 20-24: Mating flights</li>
          <li>Day 25+: Queen begins laying</li>
        </ul>`,
        excerpt:
          "Advanced techniques for rearing your own queen bees, including grafting, emergency cells, and mating nucs.",
        featured_image:
          "https://images.unsplash.com/photo-1548262144-33211ff3a08b",
        status: "published",
        published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        view_count: 89,
        user_id: users[2].id, // Jane Smith
        tags: ["Queen Rearing", "Advanced"],
      },
    ];

    // Create articles with associated tags
    console.log("📝 Creating articles...");
    for (const articleInfo of articleData) {
      try {
        // Extract tags from article data
        const articleTags = articleInfo.tags;
        delete articleInfo.tags;

        // Generate unique slug
        const articleSlug = await generateUniqueSlug(articleInfo.title);

        // Create the article
        const article = await Article.create({
          ...articleInfo,
          slug: articleSlug,
        });

        // Associate tags with the article
        if (articleTags && articleTags.length > 0) {
          const tagInstances = tags.filter((tag) =>
            articleTags.includes(tag.name)
          );
          await article.setTags(tagInstances);
        }

        console.log(`✅ Created article: "${article.title}"`);
      } catch (error) {
        console.error(`❌ Error creating article: ${error.message}`);
      }
    }

    // Create some comments on articles
    console.log("💬 Creating comments...");
    const articles = await Article.findAll();

    if (articles.length === 0) {
      console.log("⚠️  No articles found, skipping comments creation");
      return;
    }

    const commentData = [
      {
        content:
          "Great article! This really helped me get started with beekeeping.",
        status: "approved",
        user_id: users[3]?.id || users[0].id, // Regular reader or fallback to first user
        article_id: articles[0].id,
      },
      {
        content:
          "I've been keeping bees for 5 years and this is still valuable information. Well written!",
        status: "approved",
        user_id: users[2]?.id || users[0].id, // Jane Smith or fallback
        article_id: articles[0].id,
      },
      {
        content: "What type of smoker do you recommend for beginners?",
        status: "approved",
        user_id: users[3]?.id || users[0].id,
        article_id: articles[0].id,
      },
      {
        content: "Fascinating! I never knew bees communicated through dancing.",
        status: "approved",
        user_id: users[3]?.id || users[0].id,
        article_id: articles[1]?.id || articles[0].id,
      },
      {
        content:
          "This is exactly what I needed to read before my first harvest. Thank you!",
        status: "approved",
        user_id: users[1]?.id || users[0].id,
        article_id: articles[2]?.id || articles[0].id,
      },
      {
        content:
          "Great tips on urban beekeeping. My neighbors were initially worried but now they love having bees nearby!",
        status: "approved",
        user_id: users[3]?.id || users[0].id,
        article_id: articles[4]?.id || articles[0].id,
      },
      {
        content: "Spam comment that should be rejected",
        status: "rejected",
        user_id: users[3]?.id || users[0].id,
        article_id: articles[0].id,
      },
      {
        content: "This comment is pending approval",
        status: "pending",
        user_id: users[3]?.id || users[0].id,
        article_id: articles[3]?.id || articles[0].id,
      },
    ];

    // Create comments individually for better error handling
    const comments = [];
    for (const comment of commentData) {
      try {
        const createdComment = await Comment.create(comment);
        comments.push(createdComment);
      } catch (error) {
        console.error(`⚠️  Error creating comment: ${error.message}`);
      }
    }

    console.log(`✅ Created ${comments.length} comments`);

    // Summary
    console.log("\n🎉 Database seeding completed!");
    console.log("📊 Summary:");
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${tags.length} tags created`);
    console.log(`   - ${articles.length} articles created`);
    console.log(`   - ${comments.length} comments created`);
    console.log("\n✅ Your BeeKeeper's Blog is ready to use!");
    console.log("\n🔐 Login credentials:");
    console.log("   Admin: admin@beekeeper.com / Admin123!");
    console.log("   Author: john@example.com / Password123!");
    console.log("   Author: jane@example.com / Password123!");
    console.log("   Reader: reader@example.com / Password123!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

/**
 * Helper function to generate unique slug
 */
async function generateUniqueSlug(title) {
  const { Article } = require("../models");

  let baseSlug = slug(title || "article", { lower: true });
  let slugToUse = baseSlug;
  let counter = 1;

  // Keep checking until we find a unique slug
  while (await Article.findOne({ where: { slug: slugToUse } })) {
    slugToUse = `${baseSlug}-${counter}`;
    counter++;
  }

  return slugToUse;
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
