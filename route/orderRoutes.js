const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Create order - requires auth
router.post('/', authMiddleware, orderController.createOrder);

// Get all orders for the current user - requires auth
router.get('/', authMiddleware, orderController.getUserOrders);

// Get single order by id - requires auth
router.get('/:orderId', authMiddleware, orderController.getOrderById);

// Update order status - requires auth (admin only)
router.patch('/:orderId/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router; 