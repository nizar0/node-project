const {Router} = require("express");

const {protect, areAuthorized} = require("../middlewares/authMiddleware");
const {checkAvailability, bookYacht, createBooking, getClientBookings, getOwnerBookings, updateBookingStatus,
    getBookingsById
} = require("../controllers/bookingController");

const router = Router();



router.post('/:id/check/availability',protect ,areAuthorized(["client"]),checkAvailability );
router.post('/:id/book', protect ,areAuthorized(["client"]), createBooking);
router.get('/client', protect ,areAuthorized(["client"]), getClientBookings);
router.get('/client/byId/:id', protect ,areAuthorized(["client"]), getBookingsById);
router.get('/owner/bookings', protect ,areAuthorized(["owner"]), getOwnerBookings);
router.put('/:id/status', protect ,areAuthorized(["owner","client"]), updateBookingStatus);


module.exports = router;
