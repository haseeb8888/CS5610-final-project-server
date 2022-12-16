const express = require("express");
const router = express.Router();
const postControllerActions = require("../controllers/postControllers");
const likeControllerActions = require("../controllers/likeControllers");
const { verifyToken: verifyUserToken, optionallyVerifyToken: optionallyVerifyUserToken } = require("../middleware/auth");

// get all posts
router.get("/", optionallyVerifyUserToken, postControllerActions.getMultiplePosts);

// create a post
router.post("/", verifyUserToken, postControllerActions.createPost);

// get an existing post 
router.get("/:id", optionallyVerifyUserToken, postControllerActions.getSinglePost);

// update a post 
router.patch("/:id", verifyUserToken, postControllerActions.updatePost);

// delete a post
router.delete("/:id", verifyUserToken, postControllerActions.deletePost);

// like a post
router.post("/like/:id", verifyUserToken, likeControllerActions.likePost);

// unlike a post
router.delete("/like/:id", verifyUserToken, likeControllerActions.unlikePost);

// get all user liked posts
router.get(
  "/liked/:id",
  optionallyVerifyUserToken,
  likeControllerActions.getUserLikedPosts
);

module.exports = router;
