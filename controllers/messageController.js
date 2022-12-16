require("mongoose");

const User = require("../models/User");
const Chat = require("../models/Conversation");
const Message = require("../models/Message");

const getMessages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);

    // If the chat exists
    if (chat) {
      const messages = await Message.find({conversation: chat._id,})
          .populate("sender", "-password")
          .sort("-createdAt")
          .limit(12);

      return res.json(messages);
    }
    else{
      throw new Error("Chat does not exists");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, userId } = req.body;

    const recipientId = req.params.id;
    const recipient = await User.findById(recipientId);

    // If the recipient exists
    if (recipient) {
      let chat = await Chat.findOne({
        recipients: {
          $all: [userId, recipientId],
        },
      });

      if (!chat) {
        chat = await Chat.create({
          recipients: [userId, recipientId],
        });
      }

      chat.lastMessageAt = Date.now();

      await Message.create({conversation: chat._id, sender: userId, content,});
      chat.save();
      return res.json({ success: true });
    }
    else{
      throw new Error("Receiver does not exist");
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getChats = async (req, res) => {
  try {
    const { userId } = req.body;
    const chats = await Chat.find({
      recipients: {
        $in: [userId],
      },
    })
      .populate("recipients", "-password")
      .sort("-updatedAt")
      .lean();

    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      for (let j = 0; j < 2; j++) {
        if (chat.recipients[j]._id != userId) {
          chat.recipient = chat.recipients[j];
        }
      }
    }

    return res.json(chats);

  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getChats,
};
