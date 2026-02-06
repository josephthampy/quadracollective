const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.MONGO_URI, // Using same variable name for compatibility
});

// Test database connection
pool.query('SELECT NOW()')
  .then(res => {
    console.log('Database Connected');
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

const app = express();
const cookieParser = require('cookie-parser')
const initRoute = require('./routers/initRoute');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const cors = require('cors');

app.use(cors({
  origin: ['https://quadracollective.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'x-admin-password'],
  credentials: true
}));

app.use(cookieParser())

const upload = multer({
    destination: 'public/images',
});
app.use(express.static(path.join(__dirname, 'public')));

const dotenv = require('dotenv');
dotenv.config();

app.get("/", (req, res) => {res.send("Hello World")});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM posts');
    res.json({ 
      success: true, 
      message: "Database connected successfully",
      totalPosts: parseInt(result.rows[0].count)
    });
  } catch (error) {
    // If table doesn't exist, create it
    if (error.message.includes('relation "posts" does not exist')) {
      await pool.query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          post VARCHAR(500) NOT NULL,
          images TEXT[],
          count INTEGER DEFAULT 1,
          is_sold BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      res.json({ 
        success: true, 
        message: "Database connected and table created",
        totalPosts: 0
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Database connection failed",
        error: error.message 
      });
    }
  }
});

// Test image serving
app.get("/test-images", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const imagesDir = path.join(__dirname, 'public/images/Posts');
  
  try {
    const files = fs.readdirSync(imagesDir);
    res.json({
      success: true,
      message: "Images directory accessible",
      imagesDir: imagesDir,
      files: files,
      testUrls: files.map(file => `${process.env.URL || 'https://quadracollective-production.up.railway.app'}/images/Posts/${file}`)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Images directory not accessible",
      error: error.message,
      imagesDir: imagesDir
    });
  }
});
app.use(express.json());

initRoute(app);

app.listen(process.env.PORT, () => {
    console.log('Server is running on port', process.env.PORT);
});

module.exports = app;


