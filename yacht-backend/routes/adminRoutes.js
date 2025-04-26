const express = require('express');
const { getPendingUsers, approveUser, blockUser,  approveYacht, getUsers, getAllYachts, getPendingReviews,
    approveReview, deleteReview
} = require('../controllers/adminController');
const {  protect, areAuthorized} = require('../middlewares/authMiddleware');

const router = express.Router();



// ✅ Routes pour la validation des utilisateurs
router.get('/users/pending', protect ,areAuthorized(["admin"]), getPendingUsers);
router.get('/users', protect ,areAuthorized(["admin"]), getUsers);
router.put('/users/approve/:userId',protect ,areAuthorized(["admin"]), approveUser);
router.put('/users/block/:userId',protect ,areAuthorized(["admin"]), blockUser);

// ✅ Routes pour la validation des yachts
router.get('/yachts/all/toAdmin',protect ,areAuthorized(["admin"]), getAllYachts);
router.put('/yachts/approve/fromAdmin/:yachtId',protect ,areAuthorized(["admin"]), approveYacht);

router.get('/reviews', protect, areAuthorized(["admin"]), getPendingReviews);
router.put('/reviews/to/admin/approve/:reviewId', protect, areAuthorized(["admin"]), approveReview);
router.delete('/reviews/delete/:reviewId', protect, areAuthorized(["admin"]), deleteReview);


module.exports = router;
