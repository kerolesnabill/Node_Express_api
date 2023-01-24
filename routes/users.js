const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const router = express.Router();
const { User, validate } = require("../models/User");

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

module.exports = router;
