import Order from '../model/Order.js';

// Create new order
const createOrder = async (req, res) => {
  try {
    console.log("Received order data:", req.body);
    const { userId, items, shipping, payment, subtotal, tax, total, status, date, shippingCost } = req.body;
    
    // Use userId from req.user (set by auth middleware) if available,
    // otherwise use from request body (for development/testing)
    const userIdToUse = req.user?.id || userId;
    
    if (!userIdToUse) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Handle the shipping cost which might come in different ways
    const shippingCostValue = shippingCost || req.body.shipping_cost || req.body.shipping;
    
    // Create new order object with all required fields
    const orderData = {
      userId: userIdToUse,
      items,
      shipping,
      payment,
      subtotal,
      // Store the shipping cost in two fields for compatibility
      shippingCost: shippingCostValue,
      shipping_cost: shippingCostValue,
      tax,
      total,
      status: status || 'Processing',
      date: date || new Date()
    };
    
    console.log("Creating order with data:", orderData);
    
    // Create new order
    const newOrder = new Order(orderData);
    
    // Save to database
    const savedOrder = await newOrder.save();
    console.log("Order saved successfully:", savedOrder);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to the user
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

export { createOrder, getOrderById, getUserOrders, updateOrderStatus };

