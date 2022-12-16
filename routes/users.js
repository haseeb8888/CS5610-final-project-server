const express = require("express");
const router = express.Router();
const userControllerActions = require("../controllers/userControllers");
const loginControllerActions = require("../controllers/loginControllers");
const { verifyToken: verifyUserToken } = require("../middleware/auth");

// register user
router.post("/register", loginControllerActions.register);

// login
router.post("/login", loginControllerActions.login);

// get random users
router.get("/random", userControllerActions.getRandomUsers);

// get the user details by username
router.get("/:username", userControllerActions.getUser);

// update the user based on id
router.patch("/:id", verifyUserToken, userControllerActions.updateUser);

// follow a user by user id
router.post("/follow/:id", verifyUserToken, userControllerActions.followUser);

// unfollow a user based on user id
router.delete("/unfollow/:id", verifyUserToken, userControllerActions.unfollowUser);

// get all followers by userid
router.get("/followers/:id", userControllerActions.getFollowersOfUser);

// get the following count
router.get("/following/:id", userControllerActions.getFollowingOfUser);



module.exports = router;