const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload, resize } = require("../middleware/upload");
const { User, validate, validateUpdate } = require("../models/User");

router.get("/", auth, async (req, res) => {
  let users = await User.find().select({
    firstName: 1,
    lastName: 1,
    username: 1,
    photo: 1,
  });

  users = users.filter((user) => user._id != req.user._id);
  if (users.length < 1) return res.send("No users were found.");

  res.send(users);
});

router.post("/", async (req, res) => {
  // Check if the user is existing
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  // Check if the username is existing
  user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("username already used.");

  // Validate user input data
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Create new user
  user = new User(
    _.pick(req.body, [
      "firstName",
      "lastName",
      "username",
      "email",
      "location",
      "bio",
      "password",
    ])
  );

  // Hash password
  user.password = await bcrypt.hash(user.password, 10);

  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "username", "email"]));
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.send("User not found.");

  res.send(user);
});

router.patch("/me", auth, upload, resize, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("This email already registered.");

  user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("username already used.");

  user = req.body;

  if (req.file) user.photo = req.file.filename;

  if (user.password) user.password = await bcrypt.hash(user.password, 10);

  user = await User.findByIdAndUpdate(req.user._id, user, {
    new: true,
  }).select("-password");

  res.send(user);
});

router.delete("/me", auth, async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);
  if (!user) return res.send("The user is already deleted.");

  res.send("The user was deleted successfully.");
});

// add or remove followers
router.patch("/:userId/follow", auth, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.send("The user is not found.");

  const me = await User.findById(req.user._id);
  const userId = me.following.find((userId) => userId == req.params.userId);

  if (userId) {
    // Un follow
    try {
      const newFollowing = me.following.filter((id) => id != userId);
      const newFollowers = user.followers.filter((id) => id != req.user._id);

      await me.update({ following: newFollowing });
      await user.update({ followers: newFollowers });
      res.send("unfollowed");
    } catch {
      res.status(400).send("error");
    }
  } else {
    // Follow
    try {
      const newFollowing = [...me.following, req.params.userId];
      const newFollowers = [...user.followers, req.user._id];

      await me.update({ following: newFollowing });
      await user.update({ followers: newFollowers });
      res.send("followed");
    } catch {
      res.status(400).send("error");
    }
  }
});

module.exports = router;
