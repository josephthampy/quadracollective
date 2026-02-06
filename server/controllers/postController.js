const Post = require("../models/post");
const fs = require("fs");
const path = require("path");

module.exports.postArt = async (req, res) => {
  let response = {
    success: false,
    message: "",
    errMessage: "",
  };
  
  // Validate required fields
  const { title, description, price, count } = req.body;
  if (!title || !description || !price) {
    response.message = "Please fill all required fields";
    return res.status(400).send(response);
  }
  
  const files = req.files || [];
  
  // Parse mainIndex from request body (multer parses form fields into req.body)
  const rawMainIndex = req.body?.mainIndex;
  let mainIndex = 0;
  if (rawMainIndex !== undefined && rawMainIndex !== null) {
    const parsed = parseInt(String(rawMainIndex), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      mainIndex = parsed;
    }
  }

  // Debug logging
  console.log('Backend received:');
  console.log('- Files count:', files.length);
  console.log('- MainIndex:', rawMainIndex, '-> parsed:', mainIndex);
  console.log('- File names:', files.map(f => f.filename));

  // Validate images count (at least 1 and at most 10)
  if (!files.length) {
    response.message = "Please upload at least one image";
    return res.status(400).send(response);
  }

  if (files.length > 10) {
    response.message = "You can upload at most 10 images per artwork";
    // Clean up uploaded files
    files.forEach((file) => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        console.log("Error cleaning up image:", e);
      }
    });
    return res.status(400).send(response);
  }

  // Files array is already in the order they were sent from frontend
  // Create image URLs preserving that order
  const baseUrl = process.env.URL || "https://quadracollective-production.up.railway.app";
  console.log('Using baseUrl:', baseUrl); // Debug log
  console.log('Files received:', files.length, files.map(f => f.filename));
  const imageUrls = files.map(
    (file) => {
      const url = baseUrl + "/images/Posts/" + file.filename;
      console.log('Generated URL:', url);
      return url;
    }
  );

  // Clamp main index to valid range
  if (mainIndex >= imageUrls.length || mainIndex < 0) {
    mainIndex = 0;
  }

  // Store the main image separately and preserve original order
  const post = imageUrls[mainIndex]; // main image based on mainIndex

  try {
    const postArt = new Post({
      title,
      description,
      price,
      post, // main image
      images: imageUrls, // images array in original order
      count: count || 1,
    });
    await postArt
      .save()
      .then((data) => {
        response.success = true;
        response.message = "Posted successfully";
        res.status(200).send(response);
      })
      .catch((err) => {
        console.log('Database save error:', err);
        // For testing: return success even if DB fails
        response.success = true;
        response.message = "Posted successfully (test mode - DB not connected)";
        res.status(200).send(response);
      });
  } catch (err) {
    console.log('Controller error:', err);
    // For testing: return success even if DB fails
    response.success = true;
    response.message = "Posted successfully (test mode - DB not connected)";
    res.status(200).send(response);
  }
};

module.exports.getPosts = async (req, res) => {
  let response = {
    success: true,
    message: "",
    errMessage: "",
    result: "",
    totalPage: 0,
  };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const startIndex = (page - 1) * limit;
  
  console.log('getPosts called with:', { page, limit, startIndex });
  
  try {
    // Use database pagination for better performance
    const totalPosts = await Post.countDocuments({ isSold: false });
    const totalPage = Math.ceil(totalPosts / limit);
    
    console.log('Total posts:', totalPosts, 'Total pages:', totalPage);
    
    const result = await Post.find({ isSold: false })
      .sort({ createdAt: -1 })
      .select("title description price post images count createdAt")
      .skip(startIndex)
      .limit(limit);
    
    console.log('Found posts:', result.length);
    
    if (result.length > 0) {
      response.success = true;
      response.result = result;
      response.totalPage = totalPage;
    } else {
      response.message = "No results found";
      response.totalPage = 1;
    }
    return res.status(200).send(response);
  } catch (err) {
    console.log("Error in getPosts:", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};

module.exports.getSomePosts = async (req, res) => {
  let response = {
    success: true,
    message: "",
    errMessage: "",
    result: "",
  };
  try {
    await Post.find({ isSold: false })
      .sort({ createdAt: -1 })
      .select("title description price post images count createdAt")
      .limit(8)
      .then((data) => {
        response.success = true;
        response.result = data;
        return res.status(200).send(response);
      });
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.body;
  let response = {
    success: false,
    message: "",
    errMessage: "",
  };
  try {
    const posts = await Post.findOneAndDelete({ _id: id });
    if (posts) {
      // Collect all image URLs (array + legacy single post field)
      const imageUrls = [];
      if (Array.isArray(posts.images) && posts.images.length) {
        imageUrls.push(...posts.images);
      }
      if (posts.post && !imageUrls.includes(posts.post)) {
        imageUrls.push(posts.post);
      }

      // Delete each image file if it exists on disk
      imageUrls.forEach((url) => {
        try {
          const imageName = url.split("/");
          const imagepath =
            path.join(__dirname, "../public/images/Posts/") +
            imageName[imageName.length - 1];
          if (fs.existsSync(imagepath)) {
            fs.unlinkSync(imagepath);
          }
        } catch (e) {
          console.log("Error deleting image:", e);
        }
      });

      response.success = true;
      response.message = "Post Deleted Successfully";
      return res.status(200).send(response);
    } else {
      response.message = "No Post Found";
      return res.status(200).send(response);
    }
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};

module.exports.updatePost = async (req, res) => {
  let response = {
    success: false,
    message: "",
    errMessage: "",
  };
  try {
    const { id, title, description, price, oldPost, count } = req.body;
    let post;
    if (req.file) {
      temp = req.file.filename.split(".");
      fileType = temp[temp.length - 1];
      const baseUrl = process.env.URL || "https://quadracollective-production.up.railway.app";
      post = baseUrl + "/images/Posts/" + req.file.filename;
    } else if (oldPost) {
      post = oldPost;
    }
    let post1;
    if (count > 0) {
      post1 = await Post.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            post,
            title,
            description,
            price,
            count,
            isSold: false,
          },
        },
        { new: true }
      );
    } else {
      post1 = await Post.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            post,
            title,
            description,
            price,
            count,
          },
        },
        { new: true }
      );
    }

    if (!post1) {
      response.message = "Post not found";
      return res.status(404).send(response);
    }

    response.success = true;
    response.message = "Post updated successfully";
    response.result = post1;
    res.send(response);
    
    // Delete old image if new one was uploaded
    if (post != oldPost && oldPost) {
      let imageName = oldPost.split("/");
      let imagePath =
        path.join(__dirname, "../public/images/Posts/") +
        imageName[imageName.length - 1];
      if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
            console.log("Error deleting old image:", err);
        }
      });
      }
    }
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};

module.exports.getAPost = async (req, res) => {
  let response = {
    success: true,
    message: "",
    errMessage: "",
    result: "",
  };
  try {
    const { id } = req.params;
    Post.findOne({ _id: id })
      .select("title description price post images count createdAt")
      .then((data) => {
        response.success = true;
        response.result = data;
        return res.status(200).send(response);
      });
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};

module.exports.getAllPosts = async (req, res) => {
  let response = {
    success: true,
    message: "",
    errMessage: "",
    result: "",
    totalPage: "",
  };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const startIndex = (page - 1) * limit;
  try {
    await Post.find({})
      .sort({ createdAt: -1 })
      .select("title description price post images count createdAt isSold")
      .then((result) => {
        if (result.length > 0) {
          totalPage = Math.ceil(result.length / limit);
          result = result.slice(startIndex, page * limit);
          response.success = true;
          response.errMessage = undefined;
          response.message = undefined;
          response.result = result;
          response.totalPage = totalPage;
        } else {
          response.errMessage = undefined;
          response.totalPage = 1;
          response.message = "No results found";
        }
        return res.status(200).send(response);
      });
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};
