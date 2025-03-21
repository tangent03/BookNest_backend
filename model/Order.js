import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [{
    _id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shipping: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  payment: {
    cardLast4: String
  },
  subtotal: Number,
  shippingCost: Number,
  shipping_cost: Number,
  tax: Number,
  total: Number,
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order; 