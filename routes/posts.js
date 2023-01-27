const express = require("express");
const _ = require("lodash");
const router = express.Router();
const auth = require("../middleware/auth");
const { Post, validate, validateUpdate } = require("../models/Post");
const { uploadPostImages, resizePostImages } = require("../middleware/upload");

router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(15);
  if (posts.length < 1) return res.status(404).send("There are no posts.");

  res.status(200).send(posts);
});

// Post
router.get("/me", auth, async (req, res) => {
  const posts = await Post.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  if (posts.length < 1) return res.status(404).send("There are no posts.");

  res.status(200).send(posts);
});

router.post(
  "/",
  auth,
  uploadPostImages,
  resizePostImages,
  async (req, res, next) => {
    let post = { ...req.body, userId: req.user._id };

    const { error } = validate(post);
    if (error) return res.status(400).send(error.details[0].message);

    post = await Post.create(post);

    res.status(200).send(post);
  }
);

router.patch(
  "/:id",
  auth,
  uploadPostImages,
  resizePostImages,
  async (req, res) => {
    let post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).send("There is no post with id: " + req.params.id);

    if (req.user._id != post.userId)
      return res.status(400).send("You are not allowed to edit this post.");

    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    await post.update(req.body, { new: true });

    res.status(200).send("The post was updated successfully.");
  }
);

router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post)
    return res.status(404).send("There is no post with id: " + req.params.id);

  if (req.user._id != post.userId)
    return res.status(400).send("You are not allowed to delete this post.");

  post.delete();

  res.status(200).send("The post was deleted successfully.");
});

module.exports = router;
