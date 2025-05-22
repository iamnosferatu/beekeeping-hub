// backend/test-validation.js - VALIDATION TEST SCRIPT
const axios = require("axios");

const API_BASE = "http://localhost:8080/api";
const authToken =
  "a10de096e8739623d865d249558f8e0bb94b43fd5280ffb7796f75e93d81b77b50d10da"; // Get this from .env

// Test validation by sending invalid requests
async function testValidation() {
  console.log("🧪 Testing API Validation...\n");

  const tests = [
    {
      name: "Article Creation - Missing Title",
      request: () =>
        axios.post(
          `${API_BASE}/articles`,
          {
            content: "Some content",
            status: "draft",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Article Creation - Title Too Short",
      request: () =>
        axios.post(
          `${API_BASE}/articles`,
          {
            title: "Hi",
            content: "Some content",
            status: "draft",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Article Creation - Invalid Status",
      request: () =>
        axios.post(
          `${API_BASE}/articles`,
          {
            title: "Valid Title",
            content: "Some content",
            status: "invalid_status",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Article Creation - Too Many Tags",
      request: () =>
        axios.post(
          `${API_BASE}/articles`,
          {
            title: "Valid Title",
            content: "Some content",
            tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"], // 6 tags (max is 5)
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "User Registration - Invalid Email",
      request: () =>
        axios.post(
          `${API_BASE}/auth/register`,
          {
            username: "testuser",
            email: "invalid-email",
            password: "Password123",
            firstName: "Test",
            lastName: "User",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "User Registration - Weak Password",
      request: () =>
        axios.post(
          `${API_BASE}/auth/register`,
          {
            username: "testuser",
            email: "test@example.com",
            password: "weak", // No uppercase, no numbers
            firstName: "Test",
            lastName: "User",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Comment Creation - Empty Content",
      request: () =>
        axios.post(
          `${API_BASE}/comments`,
          {
            content: "",
            articleId: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Comment Creation - Invalid Article ID",
      request: () =>
        axios.post(
          `${API_BASE}/comments`,
          {
            content: "Valid comment content",
            articleId: "not-a-number",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Tag Creation - Invalid Characters",
      request: () =>
        axios.post(
          `${API_BASE}/tags`,
          {
            name: "invalid@tag!",
            description: "Some description",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        ),
      expectStatus: 400,
    },

    {
      name: "Articles Query - Invalid Page",
      request: () => axios.get(`${API_BASE}/articles?page=0`),
      expectStatus: 400,
    },

    {
      name: "Articles Query - Limit Too High",
      request: () => axios.get(`${API_BASE}/articles?limit=200`),
      expectStatus: 400,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);

      const response = await test.request();

      if (response.status === test.expectStatus) {
        console.log("✅ PASS - Got expected status code");
        passed++;
      } else {
        console.log(
          `❌ FAIL - Expected ${test.expectStatus}, got ${response.status}`
        );
        failed++;
      }
    } catch (error) {
      if (error.response && error.response.status === test.expectStatus) {
        console.log("✅ PASS - Got expected error status");

        // Show validation error details
        if (error.response.data && error.response.data.errors) {
          console.log(
            "   Validation errors:",
            error.response.data.errors.map((e) => e.message).join(", ")
          );
        }

        passed++;
      } else {
        console.log(
          `❌ FAIL - Expected ${test.expectStatus}, got ${
            error.response?.status || "network error"
          }`
        );
        failed++;
      }
    }

    console.log(""); // Empty line for readability
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All validation tests passed!");
  } else {
    console.log(
      "⚠️  Some tests failed. Check your validation middleware setup."
    );
  }
}

// Run the tests
testValidation().catch(console.error);

// ============================================================================
// SAMPLE VALID REQUESTS (for comparison)
// ============================================================================

async function testValidRequests() {
  console.log("\n🧪 Testing Valid Requests...\n");

  try {
    // Test valid article query
    const articlesResponse = await axios.get(
      `${API_BASE}/articles?page=1&limit=5`
    );
    console.log("✅ Valid articles query passed");

    // Test valid tags query
    const tagsResponse = await axios.get(`${API_BASE}/tags`);
    console.log("✅ Valid tags query passed");

    console.log("\n🎉 Valid requests working correctly!");
  } catch (error) {
    console.log("❌ Valid requests failed:", error.message);
  }
}

// Uncomment to test valid requests too
// testValidRequests();
