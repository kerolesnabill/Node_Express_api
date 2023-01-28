const { Schema, model } = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  location: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  bio: {
    type: String,
    maxlength: 50,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  following: {
    type: [String],
    default: [],
  },
  followers: {
    type: [String],
    default: [],
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_KEY);
};

const User = model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(20).required(),
    lastName: Joi.string().min(2).max(20).required(),
    username: Joi.string().min(2).max(20).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    location: Joi.string().min(2).max(50),
    bio: Joi.string().min(1).max(50),
    photo: Joi.string(),
  });

  return schema.validate(user);
}

function validateUserUpdate(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(20),
    lastName: Joi.string().min(2).max(20),
    username: Joi.string().min(2).max(20),
    email: Joi.string().min(5).max(255).email(),
    password: Joi.string().min(5).max(255),
    location: Joi.string().min(2).max(50),
    bio: Joi.string().min(1).max(50),
    photo: Joi.string(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
exports.validateUpdate = validateUserUpdate;
