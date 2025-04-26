const express = require('express');
const {registerUser, loginUser, updateUserProfile} = require("../controllers/userController");
const {protect, areAuthorized} = require("../middlewares/authMiddleware");
const router = express.Router();


router.post('/', registerUser);
router.put('/login', loginUser);
router.put('/user/update',protect ,areAuthorized(["owner","client","admin"]),updateUserProfile);
module.exports = router;
