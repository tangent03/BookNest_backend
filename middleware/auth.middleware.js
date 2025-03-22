import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'booknest-secret-key';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Create JWT token
export const createToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
}; 