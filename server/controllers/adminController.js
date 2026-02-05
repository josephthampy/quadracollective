// Simple admin controller for personal portfolio site
const bcrypt = require("bcryptjs");

module.exports.login = async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  
  if (!password) {
    return res.status(400).send({ message: "Password required" });
  }
  
  if (password === adminPassword) {
    // Set session or return success
    if (req.session) {
      req.session.adminPassword = adminPassword;
    }
    return res.status(200).send({ 
    success: true,
      message: "Login successful" 
    });
  } else {
    return res.status(401).send({ 
      success: false,
      message: "Invalid password" 
    });
  }
};

module.exports.checkAuth = async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const providedPassword = req.body.adminPassword || req.headers['x-admin-password'] || req.session?.adminPassword;
  
  if (providedPassword === adminPassword) {
    return res.status(200).send({ 
    success: true,
      authenticated: true 
    });
  } else {
    return res.status(401).send({ 
      success: false,
      authenticated: false 
    });
  }
};
