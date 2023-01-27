const { Schema, model } = require("mongoose");
const Joi = require("joi");

const replaySchema = new Schema({
  content: String,
  createdAt: { type: Date, default: Date.now() },
});

const commentSchema = new Schema({
  content: { type: String, minlength: 1, maxlength: 1000 },
  replies: [replaySchema],
  userId: String,
  createdAt: { type: Date, default: Date.now() },
});

const postSchema = new Schema({
  userId: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
    maxlength: 500,
    default: "",
  },
  images: [String],
  likes: {
    type: [String],
    default: [],
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
  createdAt: { type: Date, default: Date.now() },
});

const Post = model("Post", postSchema);

function validatePost(post) {
  const schema = Joi.object({
    userId: Joi.string().max(255).required(),
    description: Joi.string().max(500).required(),
    images: Joi.array(),
  });
  return schema.validate(post);
}

function validatePostUpdate(post) {
  const schema = Joi.object({
    description: Joi.string().max(500),
    images: Joi.array(),
  });
  return schema.validate(post);
}

function validateComment(postComment) {
  const schema = Joi.object({
    comment: Joi.string().min(1).max(1000).required(),
  });
  return schema.validate(postComment);
}

exports.Post = Post;
exports.validate = validatePost;
exports.validateUpdate = validatePostUpdate;
exports.validateComment = validateComment;
