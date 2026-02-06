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
  
  const files = req.files || [];
  
  // Parse mainIndex from request body (multer parses form fields into req.body)
  const rawMainIndex = req.body?.mainIndex;
  let mainIndex = 0;
  if (rawMainIndex !== undefined && rawMainIndex !== null) {
    mainIndex = parseInt(rawMainIndex, 10);
  }

  console.log('Parsed data:', { title, description, price, count, mainIndex });
  console.log('Files:', files.map(f => ({ filename: f.filename, size: f.size })));

  // Validate required fields
  if (!title || !description || !price) {
    response.message = "Title, description, and price are required";
    console.log('Validation failed: missing required fields');
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

  if (files.length === 0) {
    response.message = "At least one image is required";
    console.log('Validation failed: no files');
    return res.status(400).send(response);
  }

  if (files.length > 10) {
    response.message = "You can upload at most 10 images per artwork";
    console.log('Validation failed: too many files');
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

  // Debug logging
  console.log('Backend received:');
  console.log('- Files count:', files.length);
  console.log('- MainIndex:', rawMainIndex, '-> parsed:', mainIndex);
  console.log('- File names:', files.map(f => f.filename));

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
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    const query = `
      INSERT INTO posts (title, description, price, post, images, count)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    
    const values = [
      title,
      description,
      parseFloat(price),
      post, // main image
      imageUrls, // images array
      parseInt(count) || 1
    ];
    
    const result = await pool.query(query, values);
    
    response.success = true;
    response.message = "Posted successfully";
    response.postId = result.rows[0].id;
    res.status(200).send(response);
    
  } catch (err) {
    console.log('Database save error:', err);
    response.errMessage = err.message;
    response.message = "Failed to save post to database";
    // Delete uploaded images on error
    files.forEach((file) => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        console.log("Error cleaning up image:", e);
      }
    });
    return res.status(500).send(response);
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
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    // Get total count of unsold posts
    const countResult = await pool.query('SELECT COUNT(*) FROM posts WHERE is_sold = false');
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPage = Math.ceil(totalPosts / limit);
    
    console.log('Total posts:', totalPosts, 'Total pages:', totalPage);
    
    // Get posts with pagination
    const result = await pool.query(
      'SELECT id, title, description, price, post, images, count, created_at as "createdAt" FROM posts WHERE is_sold = false ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, startIndex]
    );
    
    console.log('Found posts:', result.rows.length);
    
    if (result.rows.length > 0) {
      response.success = true;
      response.result = result.rows;
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
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    const result = await pool.query(
      'SELECT id, title, description, price, post, images, count, created_at as "createdAt" FROM posts WHERE is_sold = false ORDER BY created_at DESC LIMIT 8'
    );
    
    response.success = true;
    response.result = result.rows;
    return res.status(200).send(response);
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
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    console.log('deletePost called with id:', id, 'type:', typeof id);
    
    // Parse ID as integer if possible
    let postId = id;
    if (!isNaN(id)) {
      postId = parseInt(id);
    }
    
    // First get the post to find image URLs
    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length > 0) {
      const post = postResult.rows[0];
      
      // Collect all image URLs
      const imageUrls = [];
      if (Array.isArray(post.images) && post.images.length) {
        imageUrls.push(...post.images);
      }
      if (post.post && !imageUrls.includes(post.post)) {
        imageUrls.push(post.post);
      }

      // Delete each image file if it exists on disk
      imageUrls.forEach((url) => {
        try {
          const imageName = url.split("/");
          const imagePath =
            path.join(__dirname, "../public/images/Posts/") +
            imageName[imageName.length - 1];
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (e) {
          console.log("Error deleting image:", e);
        }
      });

      // Delete the post from database
      await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
      
      response.success = true;
      response.message = "Post deleted successfully";
      return res.status(200).send(response);
    } else {
      response.message = "Post not found";
      return res.status(404).send(response);
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
      const temp = req.file.filename.split(".");
      const fileType = temp[temp.length - 1];
      const baseUrl = process.env.URL || "https://quadracollective-production.up.railway.app";
      post = baseUrl + "/images/Posts/" + req.file.filename;
    } else if (oldPost) {
      post = oldPost;
    }
    
    console.log('updatePost called with id:', id, 'type:', typeof id);
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    // Parse ID as integer if possible
    let postId = id;
    if (!isNaN(id)) {
      postId = parseInt(id);
    }
    
    // Update the post
    const updateQuery = `
      UPDATE posts 
      SET title = $1, description = $2, price = $3, post = $4, count = $5, is_sold = $6 
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      title,
      description,
      parseFloat(price),
      post,
      parseInt(count) || 1,
      false, // is_sold = false
      postId
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      response.message = "Post not found";
      return res.status(404).send(response);
    }

    response.success = true;
    response.message = "Post updated successfully";
    response.result = result.rows[0];
    res.send(response);
    
    // Delete old image if new one was uploaded
    if (post != oldPost && oldPost) {
      let imageName = oldPost.split("/");
      let imagePath =
        path.join(__dirname, "../public/images/Posts/") +
        imageName[imageName.length - 1];
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
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
    console.log('getAPost called with id:', id, 'type:', typeof id);
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    // Try to parse as integer first, if fails use as string
    let postId = id;
    if (!isNaN(id)) {
      postId = parseInt(id);
    }
    
    console.log('Using postId:', postId, 'type:', typeof postId);
    
    const result = await pool.query(
      'SELECT id, title, description, price, post, images, count, created_at as "createdAt" FROM posts WHERE id = $1',
      [postId]
    );
    
    console.log('getAPost query result:', result.rows.length, 'rows found');
    if (result.rows.length > 0) {
      console.log('getAPost returning post:', result.rows[0]);
      response.success = true;
      response.result = result.rows[0];
      return res.status(200).send(response);
    } else {
      console.log('getAPost: Post not found for id:', postId);
      response.message = "Post not found";
      return res.status(404).send(response);
    }
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
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.MONGO_URI,
    });
    
    const result = await pool.query(
      'SELECT id, title, description, price, post, images, count, created_at as "createdAt", is_sold as "isSold" FROM posts ORDER BY created_at DESC'
    );
    
    console.log('getAllPosts found:', result.rows.length, 'posts');
    console.log('Sample post IDs:', result.rows.slice(0, 3).map(p => ({ id: p.id, type: typeof p.id })));
    
    if (result.rows.length > 0) {
      const totalPage = Math.ceil(result.rows.length / limit);
      const paginatedResults = result.rows.slice(startIndex, page * limit);
      response.success = true;
      response.result = paginatedResults;
      response.totalPage = totalPage;
    } else {
      response.message = "No posts found";
      response.totalPage = 0;
    }
    
    return res.status(200).send(response);
  } catch (err) {
    console.log("Error", err);
    response.message = "Something went wrong!";
    response.errMessage = err.message;
    return res.status(400).send(response);
  }
};
