const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [100, "Title Cannot Exceed 100 Characters"],
    minlength: [3, "Title Must Be Atleast 3 Characters"],
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Main image URL (for backwards compatibility and quick access)
  post: {
    type: String,
    required: true,
  },
  // All image URLs for the artwork (first one is treated as main)
  images: {
    type: [String],
    default: [],
  },
  count: {
    type: Number,
    required: true,
    default: 1,
  },
  isSold: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt : {
    type: Date,
    default: Date.now,
    required: true,
  }
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
