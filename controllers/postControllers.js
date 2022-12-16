const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const paginate = require("../util/paginate");
const {markAsLiked} = require("./likeControllers");
const userPosted = new Set();

const createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    if (title && content) {
      if (userPosted.has(userId)) {
        throw new Error("Cannot post again. Please wait for some time");
      }
      userPosted.add(userId);
      setTimeout(() => {
        userPosted.delete(userId);
      }, 90000);
      const post = await Post.create({
        title,
        content,
        poster: userId,
      });
      res.json(post);
    } else {
      throw new Error("Insufficient data to create a post");
    }

  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content, userId, isAdmin } = req.body;

    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (post) {
      if (post.poster != userId && !isAdmin) {
        throw new Error("Permission denied to update the post");
      }
      post.content = content;
      post.edited = true;
      await post.save();
      return res.json(post);
    } else {
      throw new Error("Post does not exist");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;

    const postId = req.params.id;
    const post = await Post.findById(postId);

    // If the post does not exists in the first place
    if (post) {
      if (post.poster != userId && !isAdmin) {
        throw new Error("Permission denied to delete the post");
      }
      await post.remove();
      await Comment.deleteMany({post: post._id});
      return res.json(post);
    } else {
      throw new Error("Post does not exist");
    }

  }
  catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error("Post does not exist");
    }

    const post = await Post.findById(postId)
      .populate("poster", "-password")
      .lean();

    // If the post does not exist in the first place
    if (post) {
      const {userId} = req.body;
      if (userId) {
        await markAsLiked([post], userId);
      }
      return res.json(post);
    } else {
      throw new Error("Post does not exist");
    }

  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getMultiplePosts = async (req, res) => {
  try {
    const { userId } = req.body;
    let { page, sortBy, author, search, liked } = req.query;
    if (!sortBy) sortBy = "-createdAt";
    if (!page) page = 1;

    let posts = await Post.find()
      .populate("poster", "-password")
      .sort(sortBy)
      .lean();

    // Filtering posts based on search
    if (search) {
      posts = posts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));
    }

    // Filtering posts based on the author
    if (author) {
      posts = posts.filter((post) => post.poster.username == author);
    }

    const numberOfPosts = posts.length;
    posts = paginate(posts, 10, page);
    if (userId) {
      await markAsLiked(posts, userId);
    }
    return res.json({ data: posts, numberOfPosts });

  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getSinglePost,
  getMultiplePosts,
};
