require("mongoose");
require("../util/paginate");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const usersCommented = new Set();

const putComment = async (req, res) => {
  try {
    const { content, parentId, userId } = req.body;

    const postId = req.params.id;
    const post = await Post.findById(postId);

    // If the post is present
    if (post) {
      // If the user is commenting too frequently
      if (usersCommented.has(userId)) {
        throw new Error("Cannot comment again. Please wait for some time");
      }

      // Add the user to the commented users set so that they cannot comment too frequently
      usersCommented.add(userId);

      // Setting timeout of 15 seconds after which a user can comment again
      setTimeout(() => {
        usersCommented.delete(userId);}, 25000);

      const comment = await Comment.create({
        content,
        parent: parentId,
        post: postId,
        commenter: userId,
      });

      post.commentCount += 1;

      await post.save();
      await Comment.populate(comment, { path: "commenter", select: "-password" });

      return res.json(comment);
    }
    else{
      throw new Error("Post does not exists. Cannot make the comment");
    }
  }
  catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);

    if (comment) {
      if (comment.commenter != userId && !isAdmin) {
        throw new Error("Permission denied for deleting the comment");
      }

      await comment.remove();
      const post = await Post.findById(comment.post);
      post.commentCount = (await Comment.find({ post: post._id })).length;
      await post.save();

      return res.status(200).json(comment);
    }
    else{
      throw new Error("Comment not present");
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { userId, content, isAdmin } = req.body;
    if (!content) {
      throw new Error("Updating a comment requires more input");
    }

    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);

    // Comment is present
    if (comment) {
      if (comment.commenter != userId && !isAdmin) {
        throw new Error("Permission denied for updating the comment");
      }

      comment.edited = true;
      comment.content = content;
      await comment.save();

      return res.status(200).json(comment);
    }
    else{
      throw new Error("Comment does not exist");
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getCommentsOfUser = async (req, res) => {
  try {
    let { page, sortBy } = req.query;

    if (!page) page = 1;
    if (!sortBy) sortBy = "-createdAt";

    const userId = req.params.id;
    // Finding all the comments of the user with userId
    let comments = await Comment.find({ commenter: userId })
        .sort(sortBy)
        .populate("post");

    return res.json(comments);

  }
  catch (err) {
    return res.status(400).json(err.message);
  }
};

const getCommentsOfPost = async (req, res) => {
  try {

    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .populate("commenter", "-password")
      .sort("-createdAt");

    let parentCommentSet = {};
    // Creating map of comments and its parents
    for (let i = 0; i < comments.length; i++) {
      let comment = comments[i];
      parentCommentSet[comment._id] = comment;
    }

    let root = [];
    for (let i = 0; i < comments.length; i++) {
      let comment = comments[i];
      // If a comment has a parent
      if (comment.parent) {
        let parent = parentCommentSet[comment.parent];
        parent.children = [...parent.children, comment];
      } else {
        // A comment doesn't have a parent
        root = [...root, comment];
      }
    }

    return res.json(root);

  }
  catch (err) {
    return res.status(400).json(err.message);
  }
};

module.exports = {
  putComment,
  deleteComment,
  updateComment,
  getCommentsOfUser,
  getCommentsOfPost,
};
