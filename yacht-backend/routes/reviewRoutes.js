const express = require('express');
const { addReview, getValidatedReviews, validateReview, hasReviewed} = require('../controllers/reviewController');
const { protect, areAuthorized } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/',protect, areAuthorized(["client"]), addReview);
router.get('/has-reviewed/:id',protect, areAuthorized(["client"]), hasReviewed);
router.get('/:yachtId', getValidatedReviews);
router.put('/validate/:reviewId',protect, areAuthorized(["admin"]), validateReview);

module.exports = router;
