const express = require("express");
const router = express.Router();
const {
  createUser,
  getUserWithFilteredPosts,
  getUserWithPostCount,
  relatePostsToUser,
  getPaginatedUsers,
  getUsersWithRecentPosts,
  getUserPostsWithComments,
  searchUsers,
  getUserEngagementMetrics,
} = require("../controllers/userController");

router.post("/", createUser);
router.get("/:id/posts-with-filter", getUserWithFilteredPosts);
router.get("/:id/with-post-count", getUserWithPostCount);
router.post("/:id/relate-posts", relatePostsToUser);
router.get("/paginated", getPaginatedUsers);
router.get("/with-recent-posts", getUsersWithRecentPosts);
router.get("/:id/posts-with-comments", getUserPostsWithComments);
router.get("/search", searchUsers);
router.get("/:id/engagement", getUserEngagementMetrics);

module.exports = router;
