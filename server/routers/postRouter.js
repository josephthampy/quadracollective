const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { upload, setDestination } = require("../middleware/image");
const postController = require("../controllers/postController");

// Public routes - no authentication needed
router.get("/getPosts", postController.getPosts);
router.get("/getSomePosts", postController.getSomePosts);
router.get("/getAPost/:id", postController.getAPost);

// Admin routes - require admin password
router.post(
  "/postArt",
  setDestination("./public/images/Posts/"),
  upload.array("post", 10),
  adminAuth,
  postController.postArt
);

router.delete("/deletePost", adminAuth, postController.deletePost);

router.put(
  "/updatePost",
  setDestination("./public/images/Posts/"),
  upload.single("pic"),
  adminAuth,
  postController.updatePost
);

router.get("/getAllPosts", adminAuth, postController.getAllPosts);

module.exports = router;
