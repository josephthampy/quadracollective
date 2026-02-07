const express = require('express');
require('./config/db');
const app = express();
const cookieParser = require('cookie-parser')
const initRoute = require('./routers/initRoute');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const cors = require('cors');

app.use(cors());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // or specify a specific domain instead of '*'
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
    // Intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

app.use(cookieParser())

const upload = multer({
    destination: 'public/images',
});
app.use(express.static(path.join(__dirname, 'public')));

const dotenv = require('dotenv');
dotenv.config();

app.get("/", (req, res) => {res.send("Hello World")});
app.get("/test-db", async (req, res) => {
  try {
    const Post = require('./models/post');
    const count = await Post.countDocuments();
    res.json({ success: true, message: "Database connected", totalPosts: count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

app.get("/test-posts", async (req, res) => {
  try {
    const Post = require('./models/post');
    const posts = await Post.find().select('id title').limit(5);
    res.json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(express.json());

initRoute(app);

app.listen(process.env.PORT, () => {
    console.log('Server is running on port', process.env.PORT);
});

module.exports = app;


