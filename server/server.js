const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB with better options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
})
  .then(() => console.log('Database Connected'))
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    // Don't exit, let the server run but DB will fail gracefully
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
    const count = await require('./models/post').countDocuments();
    res.json({ 
      success: true, 
      message: "Database connected successfully",
      totalPosts: count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed",
      error: error.message 
    });
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


