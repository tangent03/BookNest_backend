import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // For development/demo purposes, if no token is provided, check for userId in the request body
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && req.body.userId) {
      // Attach user details from request body for demo purposes
      req.user = {
        id: req.body.userId
      };
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User not found'
        });
      }
      
      // Attach user to request
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (tokenError) {
      // For development/demo purposes, if token verification fails but userId is in body
      if (req.body.userId) {
        req.user = {
          id: req.body.userId
        };
        return next();
      }
      
      throw tokenError;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

export default authMiddleware; 