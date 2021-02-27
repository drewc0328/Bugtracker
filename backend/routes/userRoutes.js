const express = require("express");

const userController = require("../controllers/userController");
const router = express.Router();

router.get("/getUsers", userController.getUsers);
router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/getUserById", userController.getUserById);

module.exports = router;
