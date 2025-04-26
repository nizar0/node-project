const {Router} = require("express");
const {protect} = require("../middlewares/authMiddleware");
const {GetNotifications, readNotification, readAllNotification} = require("../controllers/notificationController");


const router = Router();


router.get('/',protect , GetNotifications);
router.put('/:id/read',protect , readNotification);
router.put('/all',protect , readAllNotification);



module.exports = router;
