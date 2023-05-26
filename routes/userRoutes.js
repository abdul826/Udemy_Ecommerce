const express = require('express')
const router = express.Router()
const {getUsers,registerUser} = require("../controllers/userController")


router.get("/register", registerUser);



// Admin Route
router.get("/", getUsers);


module.exports = router
