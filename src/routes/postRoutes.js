const express = require("express");
const router = express.Router();
const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getRelatedPostsOfUsers,
  findPostsByTags,
} = require("../controllers/postController");

router.get("/:id", getPostById);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/search", searchPosts);
router.get("/:id/related", getRelatedPostsOfUsers);
router.get("/tags/search", findPostsByTags);

module.exports = router;
