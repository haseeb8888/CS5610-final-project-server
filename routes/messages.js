const express = require("express");
const router = express.Router();
const messageControllerActions = require("../controllers/messageController");
const { verifyToken: verifyUserToken } = require("../middleware/auth");

// get conversations
router.get("/", verifyUserToken, messageControllerActions.getChats);

// send message to a particular user
router.post("/:id", verifyUserToken, messageControllerActions.sendMessage);

// get user specific messages
router.get("/:id", verifyUserToken, messageControllerActions.getMessages);

module.exports = router;
