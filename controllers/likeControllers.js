const Post = require("../models/Post");
const PostLike = require("../models/PostLike");
const paginate = require("../util/paginate");

const likePost = async (req, res) => {
    try {
        const { userId } = req.body;

        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (post) {
            const isPostAlreadyLiked = await PostLike.findOne({postId, userId});
            if (!isPostAlreadyLiked) {
                await PostLike.create({
                    postId,
                    userId,
                });
                post.likeCount = (await PostLike.find({postId})).length;
                await post.save();
                return res.json({success: true});
            } else {
                throw new Error("Post is already liked");
            }
        } else {
            throw new Error("Post does not exist");
        }
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const unlikePost = async (req, res) => {
    try {
        const { userId } = req.body;

        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (post) {
            const isPostAlreadyLiked = await PostLike.findOne({postId, userId});
            if (isPostAlreadyLiked) {
                await isPostAlreadyLiked.remove();
                post.likeCount = (await PostLike.find({postId})).length;
                await post.save();
                return res.json({success: true});
            } else {
                throw new Error("Post is not liked in the first place");
            }
        } else {
            throw new Error("Post does not exist");
        }
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const markAsLiked = async (posts, userId) => {
    let findId = {};
    if (userId){
        findId = { userId };
    }

    const userPostLikes = await PostLike.find(findId); //userId needed

    posts.forEach((post) => {
        userPostLikes.forEach((userPostLike) => {
            if (userPostLike.postId.equals(post._id)) {
                post.liked = true;
                return;
            }
        });
    });
};

const getUserLikedPosts = async (req, res) => {
    try {
        let { page, sortBy } = req.query;
        if (!sortBy) sortBy = "-createdAt";
        if (!page) page = 1;

        const { userId } = req.body;
        const likerId = req.params.id;

        let posts = await PostLike.find({ userId: likerId })
            .sort(sortBy)
            .populate({ path: "postId", populate: { path: "poster" } })
            .lean();

        posts = paginate(posts, 10, page);

        const numberOfPosts = posts.length;
        let responsePosts = [];
        posts.forEach((post) => {
            responsePosts.push(post.postId);
        });
        if (userId) {
            await markAsLiked(responsePosts, userId);
        }

        return res.json({ data: responsePosts, numberOfPosts });

    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports = {
    markAsLiked,
    likePost,
    unlikePost,
    getUserLikedPosts,
};