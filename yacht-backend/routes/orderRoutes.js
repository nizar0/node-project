const express = require('express');
const { protect, areAuthorized } = require('../middlewares/authMiddleware');
const { createOrder, getOrders, getOwnerEarnings, getOrderStatistics} = require('../controllers/orderController');

const router = express.Router();

router.post('/create-order', protect, areAuthorized(['client']), createOrder);
router.get('/', protect, areAuthorized(['client']), getOrders);
router.get('/earnings', protect, areAuthorized(["owner"]), getOwnerEarnings);
router.get('/admin/order-statistics', protect, areAuthorized(["admin"]), getOrderStatistics);

module.exports = router;
