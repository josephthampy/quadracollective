const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");

router.post("/login", AdminController.login);
router.post("/checkAuth", AdminController.checkAuth);

module.exports = router;
