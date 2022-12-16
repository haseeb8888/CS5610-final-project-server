const express = require("express");
const router = express.Router();
const commentControllerActions = require("../controllers/commentControllers");
const { verifyToken: verifyUserToken } = require("../middleware/auth");

// update a user comment
router.patch("/:id", verifyUserToken, commentControllerActions.updateComment);

// create a comment
router.post("/:id", verifyUserToken, commentControllerActions.putComment);

// delete a comment
router.delete("/:id", verifyUserToken, commentControllerActions.deleteComment);

// get comments on a post
router.get("/post/:id", commentControllerActions.getCommentsOfPost);

// get user comments
router.get("/user/:id", commentControllerActions.getCommentsOfUser);

module.exports = router;
