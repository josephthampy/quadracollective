// Simple admin authentication middleware
// Checks if admin password is provided in request body or header
// This middleware MUST be used to protect admin-only routes

const adminAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  
  // Check body first (for multipart/form-data after multer processes it)
  // Then check headers (for JSON requests)
  const providedPassword = req.body?.adminPassword || req.headers['x-admin-password'];
  
  if (!providedPassword) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized - Admin password required. Only admins can perform this action." 
    });
  }
  
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized - Invalid admin password. Access denied." 
    });
  }
  
  // Password is valid, allow access
  next();
};

module.exports = adminAuth;
