// backend/src/seeds/seed.js
const bcrypt = require("bcryptjs");
const { sequelize, User, Article, Tag, Comment } = require("../models");
const slugify = require("slug");

// Seed data function
const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Sync database models
    await sequelize.sync({ force: true });
    console.log("Database synced");

    // Create users
    const users = await User.bulkCreate([
      {
        username: "admin",
        email: "admin@beekeeper.com",
        password: await bcrypt.hash("admin123", 10),
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        bio: "Administrator of the BeeKeeping Hub",
        is_active: true,
        last_login: new Date(),
      },
      {
        username: "author",
        email: "author@beekeeper.com",
        password: await bcrypt.hash("author123", 10),
        first_name: "Author",
        last_name: "User",
        role: "author",
        bio: "Professional beekeeper with 10 years of experience",
        is_active: true,
        last_login: new Date(),
      },
      {
        username: "user",
        email: "user@beekeeper.com",
        password: await bcrypt.hash("user123", 10),
        first_name: "Regular",
        last_name: "User",
        role: "user",
        bio: "Bee enthusiast and honey lover",
        is_active: true,
        last_login: new Date(),
      },
    ]);

    console.log("Users created");

    // Create tags - EXPLICITLY SET SLUGS
    const tags = await Tag.bulkCreate([
      {
        name: "Beginner",
        slug: "beginner", // Explicitly set slug
        description: "Articles for beginners in beekeeping",
      },
      {
        name: "Advanced",
        slug: "advanced", // Explicitly set slug
        description: "Advanced beekeeping techniques and knowledge",
      },
      {
        name: "Equipment",
        slug: "equipment", // Explicitly set slug
        description: "Beekeeping equipment and tools",
      },
      {
        name: "Honey",
        slug: "honey", // Explicitly set slug
        description: "All about honey production and types",
      },
      {
        name: "Health",
        slug: "health", // Explicitly set slug
        description: "Bee health and disease prevention",
      },
      {
        name: "Seasonal",
        slug: "seasonal", // Explicitly set slug
        description: "Seasonal beekeeping activities",
      },
    ]);

    console.log("Tags created");

    // Create articles
    const articles = await Article.bulkCreate([
      {
        title: "Getting Started with Beekeeping",
        slug: "getting-started-with-beekeeping",
        content: `
# Getting Started with Beekeeping

Beekeeping is a rewarding hobby that connects you with nature while producing delicious honey. Here's how to get started:

## Essential Equipment

1. **Hive**: The standard Langstroth hive is recommended for beginners.
2. **Protective Gear**: A full suit with veil, gloves, and boots.
3. **Smoker**: Used to calm bees during hive inspections.
4. **Hive Tool**: For prying apart hive components and scraping away propolis.
5. **Bee Brush**: Gently brush bees off frames during inspections.

## Selecting Your Bees

When starting, you have three options for acquiring bees:

* **Package Bees**: 2-3 pounds of worker bees with a queen in a screened box.
* **Nucleus Colony (Nuc)**: A miniature working colony with frames of brood, honey, and a laying queen.
* **Swarm Capture**: Free but requires experience and quick response.

For beginners, a nucleus colony offers the best start as it's already functioning.

## Location Considerations

Choose a location with:
* Morning sun and afternoon shade
* Protection from strong winds
* Away from high traffic areas
* Easy access for you to work the hive
* A nearby water source

## Seasonal Management

Beekeeping requires different activities throughout the seasons. Always plan ahead:

**Spring**: Hive setup, feeding new colonies, mite treatments
**Summer**: Regular inspections, adding honey supers, swarm prevention
**Fall**: Harvesting honey, reducing hive size, winter preparations
**Winter**: Minimal intervention, occasional checks on food stores

Remember that beekeeping is local - connect with nearby beekeepers through clubs and associations for regionally specific advice.

## Legal Considerations

Before setting up your hives:
* Check local zoning ordinances
* Register your hives if required by your state
* Consider neighbor relations and potential allergies

With proper preparation and a willingness to learn, beekeeping can be an incredible journey!
        `,
        excerpt:
          "Learn the basics of beekeeping, including essential equipment, selecting bees, and choosing the right location for your hives.",
        status: "published",
        user_id: 2, // Author
        published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        view_count: 215,
      },
      {
        title: "Honey Harvesting Techniques",
        slug: "honey-harvesting-techniques",
        content: `
# Honey Harvesting Techniques

Harvesting honey is one of the most rewarding aspects of beekeeping. Here's a comprehensive guide to help you collect honey efficiently while maintaining the health of your colony.

## When to Harvest

The timing of your honey harvest is crucial:

* Wait until at least 80% of the cells are capped with wax
* Honey should have moisture content below 18.5% to prevent fermentation
* In temperate climates, main harvest occurs in late summer (July-August)
* Leave sufficient honey stores for the bees' winter survival

## Equipment Needed

Prepare the following equipment before harvesting:

* **Protective gear** (suit, veil, gloves)
* **Bee brush or bee escape board**
* **Uncapping knife or fork**
* **Extraction equipment** (extractor, strainer, buckets)
* **Clean jars or containers**
* **Smoker**

## Harvesting Steps

1. **Prepare the hive**: Use smoke sparingly to calm the bees
2. **Remove the honey super**: Brush bees off each frame or use a bee escape board the day before
3. **Transport frames**: Place in a covered container to prevent robbing
4. **Uncap the honey cells**: Remove the wax caps using an uncapping knife heated in hot water
5. **Extract the honey**: Place frames in an extractor and spin to release honey
6. **Filter the honey**: Allow honey to flow through a strainer to remove wax and debris
7. **Bottle the honey**: Fill clean jars and seal with airtight lids

## Extraction Methods

### Centrifugal Extraction
The most common method using a mechanical or electric extractor that spins frames, forcing honey out by centrifugal force. This preserves the comb for reuse.

### Crush and Strain
A simpler method for small-scale beekeepers:
* Crush the comb in a clean bucket
* Strain through fine mesh to separate honey from wax
* Drawback: bees must rebuild comb, consuming energy and resources

### Flow Hive Technology
A newer innovation allowing honey to flow directly from the hive into a container without opening the hive or disturbing bees.

## Post-Harvest Considerations

* **Return wet supers**: Place extracted frames back on hives for bees to clean
* **Process and store honey**: Store in a cool, dry place away from light
* **Render beeswax**: Clean and melt wax cappings for candles or cosmetics
* **Clean equipment**: Properly clean all equipment for next use

Remember that your first season may produce less honey as the colony establishes. As you gain experience, your yields will likely increase while your technique improves.
        `,
        excerpt:
          "Master the art of honey harvesting with these proven techniques. Learn when to harvest, what equipment to use, and how to extract honey without harming your bees.",
        status: "published",
        user_id: 2, // Author
        published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        view_count: 178,
      },
      {
        title: "Common Bee Diseases and Prevention",
        slug: "common-bee-diseases-and-prevention",
        content: `
# Common Bee Diseases and Prevention

Maintaining healthy colonies is essential for successful beekeeping. Understanding common bee diseases, their symptoms, and prevention methods will help you keep your hives thriving.

## Bacterial Diseases

### American Foulbrood (AFB)
American Foulbrood is one of the most serious and destructive bee diseases.

**Symptoms:**
* Irregular brood pattern with sunken, perforated cappings
* Dead larvae turn brown then dark brown
* Ropey consistency when tested with a stick
* Distinctive foul odor
* Scale formation that adheres tightly to cell walls

**Prevention/Treatment:**
* Regular inspection of brood frames
* Replace old comb and equipment regularly
* Use of preventative antibiotics in some regions (where legal)
* Complete destruction of infected hives by burning in severe cases

### European Foulbrood (EFB)
Less severe than AFB but still significant.

**Symptoms:**
* Infected larvae turn yellow or brown and die before capping
* Twisted position of larvae in cells
* Slightly sour odor
* Does not rope like AFB

**Prevention/Treatment:**
* Maintaining strong colonies with good nutrition
* Antibiotic treatment may be prescribed
* Requeening infected colonies

## Viral Diseases

### Deformed Wing Virus (DWV)
Often associated with Varroa mite infestations.

**Symptoms:**
* Bees with shriveled, deformed wings
* Shortened abdomens
* Reduced lifespan

**Prevention:**
* Effective Varroa mite control
* Maintaining strong, well-fed colonies

## Parasitic Mites

### Varroa Destructor
The most damaging parasite affecting honeybees worldwide.

**Symptoms:**
* Visible reddish-brown mites on bees
* Deformed wings and bodies in emerging bees
* Colony weakness and eventual collapse

**Monitoring Methods:**
* Sticky board counts
* Sugar roll or alcohol wash sampling
* Visual inspection of drone brood

**Treatment Options:**
* Integrated Pest Management (IPM) approaches
* Organic treatments: formic acid, oxalic acid, thymol
* Synthetic treatments: amitraz, fluvalinate (with caution due to resistance)
* Mechanical methods: drone brood removal, screened bottom boards

### Tracheal Mites
Microscopic mites that infest the breathing tubes.

**Symptoms:**
* Bees crawling with spread wings, unable to fly
* K-wing appearance
* Colony decline in winter and early spring

**Prevention/Treatment:**
* Menthol treatments
* Formic acid applications
* Resistant stock

## Fungal Diseases

### Chalkbrood
A common fungal disease affecting larvae.

**Symptoms:**
* Mummified larvae resembling white/gray chalk pieces
* Mummies often visible at hive entrance

**Prevention:**
* Good ventilation and hive placement
* Replacing old comb
* Requeening with resistant stock

### Nosema
Microsporidian parasites affecting adult bees.

**Symptoms:**
* Dysentery (fecal streaking on hive exterior)
* Reduced lifespan of adult bees
* Poor spring buildup

**Prevention/Treatment:**
* Good ventilation
* Replacing old comb
* Fumagillin treatment where legal

## Preventative Practices

1. **Regular Inspections**: Check colonies every 10-14 days during active season
2. **Hygienic Equipment**: Clean tools between hive inspections
3. **Strong Colonies**: Maintain robust populations with good nutrition
4. **Genetic Resistance**: Use locally adapted, disease-resistant stock
5. **Barrier Management**: Isolate new colonies and prevent drift between apiaries
6. **Good Record Keeping**: Document treatments and colony health observations

Early detection is crucial for effective management of bee diseases. When in doubt, consult with local beekeeping associations or agricultural extension services for assistance with diagnosis and treatment recommendations.
        `,
        excerpt:
          "Learn to identify and prevent common bee diseases including Varroa mites, foulbrood, and nosema. Protecting your bees from these threats is essential for colony survival.",
        status: "published",
        user_id: 2, // Author
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        view_count: 143,
      },
      {
        title: "The Perfect Beehive Setup",
        slug: "the-perfect-beehive-setup",
        content: `
# The Perfect Beehive Setup

Creating an optimal beehive setup is crucial for the health of your colony and your success as a beekeeper. This guide will help you design the perfect home for your bees.

## Hive Types and Considerations

### Langstroth Hive
The most common hive type in North America and many other regions.

**Advantages:**
* Standardized equipment compatible with commercial components
* Vertically expandable with additional boxes
* Easy frame manipulation and inspection
* Good for honey production

**Components:**
* Bottom board with entrance reducer
* Deep boxes for brood chamber
* Medium or shallow supers for honey storage
* Inner cover and telescoping outer cover
* 8-10 frames per box with foundation

### Top Bar Hive
A horizontal hive design that's gaining popularity with natural beekeepers.

**Advantages:**
* Less heavy lifting (no boxes to stack)
* More natural comb building
* Good for beekeepers with back problems
* Single-level management

**Considerations:**
* Less honey production
* Comb is more fragile during inspection
* Less standardization of equipment
* Requires different management techniques

### Warre Hive
A vertical hive designed to mimic natural bee habitats with minimal intervention.

**Advantages:**
* More natural for bees
* Less intrusive management
* Fixed comb reduces disturbance
* Good winter survival rates

**Considerations:**
* Difficult to inspect
* Challenging to harvest honey
* Not ideal for commercial operations

## Location and Positioning

The perfect location for your hives includes:

* **Sun exposure**: Morning sun with afternoon shade in hot climates
* **Wind protection**: Natural windbreaks or artificial barriers
* **Elevation**: Slightly elevated to avoid dampness
* **Orientation**: Entrance facing southeast (in Northern Hemisphere)
* **Accessibility**: Easy access for the beekeeper
* **Water source**: Clean water within 1/4 mile
* **Distance from neighbors**: Consider local regulations and neighbor relations

## Hive Configuration

### Brood Chamber
* Use two deep boxes or three medium boxes
* Allow queen free movement between these boxes
* Consider using a queen excluder above brood chambers

### Honey Supers
* Add when brood chamber is 70-80% filled
* Use medium or shallow boxes for easier lifting
* Add additional supers before the previous is completely full
* Remove and extract when 80% of cells are capped

## Equipment Considerations

### Foundation Options
* **Wax foundation**: Natural but requires regular replacement
* **Plastic foundation**: Durable and less prone to wax moth damage
* **Foundation-less frames**: Allows natural cell sizing but requires careful handling

### Frame Spacing
* Standard spacing is 1 3/8" center-to-center
* Consider wider spacing (1 1/2") in honey supers for thicker comb

### Ventilation
* Screened bottom board for summer ventilation
* Upper entrance or ventilated inner cover
* Proper winter ventilation to prevent condensation

## Seasonal Configurations

### Spring
* One or two brood boxes
* Begin with smaller entrance opening
* Add honey supers as colony grows

### Summer
* Maximum configuration with multiple honey supers
* Full entrance opening
* Consider additional ventilation

### Fall
* Remove excess honey supers
* Reduce to essential brood boxes
* Begin reducing entrance size

### Winter
* Reduce to essential equipment
* Install entrance reducers
* Consider upper entrance for ventilation
* Add insulation in cold climates

## Advanced Setups

### Two-Queen System
Running two queens in one hive to maximize population and honey production.

### Nucleus Colonies
Maintaining small colonies for queen rearing or backup.

### Observation Hives
Glass-sided hives for educational purposes and bee behavior study.

Remember that the perfect setup varies based on your climate, the bee subspecies you're keeping, and your management goals. Adapt these recommendations to your specific situation for best results.
        `,
        excerpt:
          "Design the ideal home for your bees with this comprehensive guide to beehive setup. Learn about different hive types, optimal positioning, and seasonal configurations.",
        status: "published",
        user_id: 2, // Author
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        view_count: 97,
      },
      {
        title: "Seasonal Beekeeping Calendar",
        slug: "seasonal-beekeeping-calendar",
        content:
          "Detailed content about seasonal beekeeping activities throughout the year...",
        excerpt:
          "Follow this monthly calendar of beekeeping tasks to keep your colonies healthy and productive throughout the year.",
        status: "draft",
        user_id: 2, // Author
      },
    ]);

    console.log("Articles created");

    // Add tags to articles
    await articles[0].addTags([tags[0], tags[2]]); // Beginner, Equipment
    await articles[1].addTags([tags[1], tags[3]]); // Advanced, Honey
    await articles[2].addTags([tags[4]]); // Health
    await articles[3].addTags([tags[0], tags[2]]); // Beginner, Equipment
    await articles[4].addTags([tags[5]]); // Seasonal

    console.log("Tags added to articles");

    // Create comments
    await Comment.bulkCreate([
      {
        content:
          "This article was really helpful for me as a beginner. Thanks for the detailed equipment list!",
        status: "approved",
        user_id: 3, // Regular user
        article_id: 1, // Getting Started with Beekeeping
        ip_address: "192.168.1.1",
      },
      {
        content:
          "I've been keeping bees for 5 years and still learned something new. Great advice on the hive location.",
        status: "approved",
        user_id: 2, // Author
        article_id: 1, // Getting Started with Beekeeping
        ip_address: "192.168.1.2",
      },
      {
        content: "Do you recommend starting with one hive or multiple?",
        status: "approved",
        user_id: 3, // Regular user
        article_id: 1, // Getting Started with Beekeeping
        ip_address: "192.168.1.1",
      },
      {
        content:
          "I tried the crush and strain method last year and it worked great for a small harvest.",
        status: "approved",
        user_id: 3, // Regular user
        article_id: 2, // Honey Harvesting Techniques
        ip_address: "192.168.1.1",
      },
      {
        content:
          "Has anyone had success with the Flow Hive? Considering investing in one.",
        status: "pending",
        user_id: 3, // Regular user
        article_id: 2, // Honey Harvesting Techniques
        ip_address: "192.168.1.1",
      },
    ]);

    console.log("Comments created");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error; // Re-throw to see the full error stack
  } finally {
    process.exit();
  }
};

// Run the seed function
seedDatabase();
