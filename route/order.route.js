import express from 'express';
import { createOrder, getOrderById, getUserOrders, updateOrderStatus } from '../controller/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Order from '../model/Order.js';

const router = express.Router();

// Create order - requires auth
router.post('/', authMiddleware, createOrder);

// Get all orders for the current user - requires auth
router.get('/user', authMiddleware, getUserOrders);

// Get all orders - for admin dashboard
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status directly (for admin dashboard)
router.patch('/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single order by id - requires auth
router.get('/:orderId', authMiddleware, getOrderById);

// Update order status - requires auth (admin only)
router.patch('/:orderId/status', authMiddleware, updateOrderStatus);

export default router; 