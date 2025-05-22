// frontend/src/hooks/api/useArticles.js - Updated with fallbacks
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Mock data for fallback when API is not available
 */
const mockArticlesData = {
  success: true,
  data: [
    {
      id: 1,
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
      `,
      excerpt:
        "Learn the basics of beekeeping, including essential equipment, selecting bees, and choosing the right location for your hives.",
      featured_image:
        "https://images.unsplash.com/photo-1576594770476-b1bed9a42275?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      status: "published",
      published_at: "2023-05-15T10:30:00Z",
      view_count: 215,
      like_count: 42,
      comments: [
        {
          id: 1,
          content:
            "This article was really helpful for me as a beginner. Thanks for the detailed equipment list!",
          status: "approved",
          author: {
            id: 3,
            username: "user",
            first_name: "Regular",
            last_name: "User",
          },
        },
      ],
      author: {
        id: 2,
        username: "author",
        first_name: "Jane",
        last_name: "Beekeeper",
      },
      tags: [
        { id: 1, name: "Beginner", slug: "beginner" },
        { id: 3, name: "Equipment", slug: "equipment" },
      ],
    },
    {
      id: 2,
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
      `,
      excerpt:
        "Master the art of honey harvesting with these proven techniques. Learn when to harvest, what equipment to use, and how to extract honey without harming your bees.",
      featured_image:
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      status: "published",
      published_at: "2023-05-30T14:45:00Z",
      view_count: 178,
      like_count: 36,
      comments: [
        {
          id: 4,
          content:
            "I tried the crush and strain method last year and it worked great for a small harvest.",
          status: "approved",
          author: {
            id: 3,
            username: "user",
            first_name: "Regular",
            last_name: "User",
          },
        },
      ],
      author: {
        id: 2,
        username: "author",
        first_name: "Jane",
        last_name: "Beekeeper",
      },
      tags: [
        { id: 2, name: "Advanced", slug: "advanced" },
        { id: 4, name: "Honey", slug: "honey" },
      ],
    },
    {
      id: 3,
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
      `,
      excerpt:
        "Learn to identify and prevent common bee diseases including Varroa mites, foulbrood, and nosema. Protecting your bees from these threats is essential for colony survival.",
      featured_image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      status: "published",
      published_at: "2023-06-10T09:15:00Z",
      view_count: 143,
      like_count: 28,
      comments: [],
      author: {
        id: 2,
        username: "author",
        first_name: "John",
        last_name: "Hiveman",
      },
      tags: [{ id: 5, name: "Health", slug: "health" }],
    },
    {
      id: 4,
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
      `,
      excerpt:
        "Design the ideal home for your bees with this comprehensive guide to beehive setup. Learn about different hive types, optimal positioning, and seasonal configurations.",
      featured_image:
        "https://images.unsplash.com/photo-1609014871082-4aa50f6a83cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      status: "published",
      published_at: "2023-07-05T16:20:00Z",
      view_count: 97,
      like_count: 18,
      comments: [],
      author: {
        id: 2,
        username: "author",
        first_name: "Jane",
        last_name: "Beekeeper",
      },
      tags: [
        { id: 1, name: "Beginner", slug: "beginner" },
        { id: 3, name: "Equipment", slug: "equipment" },
      ],
    },
    {
      id: 5,
      title: "Seasonal Beekeeping Calendar (Draft)",
      slug: "seasonal-beekeeping-calendar-draft",
      content:
        "Detailed content about seasonal beekeeping activities throughout the year...",
      excerpt:
        "Follow this monthly calendar of beekeeping tasks to keep your colonies healthy and productive throughout the year.",
      featured_image: "",
      status: "draft",
      published_at: null,
      view_count: 0,
      like_count: 0,
      comments: [],
      author: {
        id: 2,
        username: "author",
        first_name: "Jane",
        last_name: "Beekeeper",
      },
      tags: [{ id: 6, name: "Seasonal", slug: "seasonal" }],
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 5,
  },
};

/**
 * Hook to fetch all articles with filters - Enhanced with fallback
 */
export const useArticles = (filters = {}, options = {}) => {
  const { onError = null, useFallback = true } = options;

  // Enhanced error handler with fallback
  const handleError = (error) => {
    console.warn("API Error, checking if fallback should be used:", error);

    if (
      useFallback &&
      (error.type === "NETWORK_ERROR" || error.status >= 500)
    ) {
      console.log("Using fallback mock data for articles");
      return {
        success: true,
        data: {
          data: mockArticlesData.data.filter((article) => {
            // Apply filters to mock data
            let matches = true;

            if (filters.search) {
              const searchTerm = filters.search.toLowerCase();
              matches =
                matches &&
                (article.title.toLowerCase().includes(searchTerm) ||
                  article.content.toLowerCase().includes(searchTerm) ||
                  article.excerpt.toLowerCase().includes(searchTerm));
            }

            if (filters.tag) {
              matches =
                matches && article.tags.some((tag) => tag.slug === filters.tag);
            }

            if (filters.status) {
              matches = matches && article.status === filters.status;
            }

            return matches;
          }),
          pagination: mockArticlesData.pagination,
        },
      };
    }

    if (onError) {
      onError(error);
    }

    return null;
  };

  return usePaginatedApi(
    async (params) => {
      try {
        const response = await apiService.articles.getAll(params);
        console.log("API Response received:", response);
        return response;
      } catch (error) {
        console.error("API call failed:", error);
        const fallbackResult = handleError(error);
        if (fallbackResult) {
          return fallbackResult;
        }
        throw error;
      }
    },
    filters,
    {
      ...options,
      onError: handleError,
    }
  );
};

/**
 * Hook to fetch a single article by ID - Enhanced with fallback
 */
export const useArticle = (id, options = {}) => {
  const { useFallback = true } = options;

  return useApi(
    async () => {
      try {
        const response = await apiService.articles.getById(id);
        return response;
      } catch (error) {
        if (
          useFallback &&
          (error.type === "NETWORK_ERROR" || error.status >= 500)
        ) {
          console.log("Using fallback mock data for article:", id);
          const mockArticle = mockArticlesData.data.find(
            (article) => article.id === parseInt(id)
          );
          if (mockArticle) {
            return {
              success: true,
              data: { data: mockArticle },
            };
          }
        }
        throw error;
      }
    },
    [id],
    {
      immediate: !!id,
      ...options,
    }
  );
};

/**
 * Hook to fetch a single article by slug - Enhanced with fallback
 */
export const useArticleBySlug = (slug, options = {}) => {
  const { useFallback = true } = options;

  return useApi(
    async () => {
      try {
        const response = await apiService.articles.getBySlug(slug);
        return response;
      } catch (error) {
        if (
          useFallback &&
          (error.type === "NETWORK_ERROR" || error.status >= 500)
        ) {
          console.log("Using fallback mock data for article slug:", slug);
          const mockArticle = mockArticlesData.data.find(
            (article) => article.slug === slug
          );
          if (mockArticle) {
            return {
              success: true,
              data: { data: mockArticle },
            };
          }
        }
        throw error;
      }
    },
    [slug],
    {
      immediate: !!slug,
      ...options,
    }
  );
};

/**
 * Hook to fetch current user's articles - Enhanced with fallback
 */
export const useMyArticles = (filters = {}, options = {}) => {
  const { useFallback = true, userId } = options;

  return usePaginatedApi(
    async (params) => {
      try {
        const response = await apiService.articles.getMyArticles(params);
        return response;
      } catch (error) {
        if (
          useFallback &&
          (error.type === "NETWORK_ERROR" || error.status >= 500)
        ) {
          console.log("Using fallback mock data for user articles");
          // Filter mock articles by user ID if provided
          const userArticles = userId
            ? mockArticlesData.data.filter(
                (article) => article.author.id === userId
              )
            : mockArticlesData.data;

          return {
            success: true,
            data: {
              data: userArticles,
              pagination: {
                ...mockArticlesData.pagination,
                total: userArticles.length,
              },
            },
          };
        }
        throw error;
      }
    },
    filters,
    options
  );
};

/**
 * Hook to create a new article
 */
export const useCreateArticle = (options = {}) => {
  return useMutation(apiService.articles.create, options);
};

/**
 * Hook to update an article
 */
export const useUpdateArticle = (options = {}) => {
  return useMutation(
    (id, data) => apiService.articles.update(id, data),
    options
  );
};

/**
 * Hook to delete an article
 */
export const useDeleteArticle = (options = {}) => {
  return useMutation(apiService.articles.delete, options);
};

/**
 * Hook to toggle article like
 */
export const useToggleArticleLike = (options = {}) => {
  return useMutation(apiService.articles.toggleLike, options);
};
