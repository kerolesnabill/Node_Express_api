const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload, resize } = require("../middleware/upload");
const { User, validate, validateUpdate } = require("../models/User");

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

module.exports = router;
