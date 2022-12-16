const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

const getUser = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select("-password");
    if (user) {
      const posts = await Post.find({poster: user._id})
          .populate("poster")
          .sort("-createdAt");
      let likeCount = 0;
      posts.forEach((post) => {
        likeCount += post.likeCount;
      });
      const data = {
        user,
        posts: {
          count: posts.length,
          likeCount,
          data: posts,
        },
      };
      return res.status(200).json(data);
    } else {
      throw new Error("User does not exist");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getRandomUsers = async (req, res) => {
  try {
    let { size } = req.query;
    const users = await User.find().select("-password");
    const randomUsers = [];
    if (size > users.length) {
      size = users.length;
    }
    const randomSizes = getRandomSizes(size, users.length);

    for (let i = 0; i < randomSizes.length; i++) {
      const randomUser = users[randomSizes[i]];
      randomUsers.push(randomUser);
    }
    return res.status(200).json(randomUsers);
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const followingId = req.params.id;
    const isAlreadyFollowed = await Follow.find({ userId, followingId });

    if (!isAlreadyFollowed) {
      const follow = await Follow.create({userId, followingId});
      return res.status(200).json({data: follow});
    } else {
      throw new Error("This user is already followed");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const followingId = req.params.id;
    const isAlreadyFollowed = await Follow.find({ userId, followingId });

    if (isAlreadyFollowed) {
      await isAlreadyFollowed.remove();
      return res.status(200).json({data: existingFollow});
    } else {
      throw new Error("This user is not followed");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getFollowersOfUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const followers = await Follow.find({ followingId: userId });
    return res.status(200).json({ data: followers });
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getFollowingOfUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const following = await Follow.find({ userId });
    return res.status(200).json({ data: following });
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, biography } = req.body;
    const user = await User.findById(userId);
    if (user) {
      if (typeof biography == "string") {
        user.biography = biography;
      }
      await user.save();
      return res.status(200).json({success: true});
    } else {
      throw new Error("User does not exist");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getRandomSizes = (size, sourceSize) => {
  const randomSizes = [];
  while (randomSizes.length < size) {
    const randomNumber = Math.floor(Math.random() * sourceSize);
    if (randomSizes.includes(randomNumber)) {
      continue;
    }
    randomSizes.push(randomNumber);
  }
  return randomSizes;
};

module.exports = {
  getUser,
  getRandomUsers,
  followUser,
  unfollowUser,
  getFollowersOfUser,
  getFollowingOfUser,
  updateUser,
};
