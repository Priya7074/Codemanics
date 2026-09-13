import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const pool = getPool();
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const query = `
      SELECT id, email, role, name, is_active, two_factor_enabled, last_login, created_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled',
      });
    }

    req.user = {
      ...user,
      _id: user.id,
      id: user.id,
      isActive: user.is_active,
      twoFactorEnabled: user.two_factor_enabled,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Authentication token has expired',
      });
    }
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};

export const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource',
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource',
      });
    }
    
    next();
  };
};

// Role-based access control helpers
export const isVictim = (req, res, next) => {
  if (req.user.role !== 'victim') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only accessible to victims',
    });
  }
  next();
};

export const isOfficer = (req, res, next) => {
  if (!['authorized_officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only accessible to authorized officers',
    });
  }
  next();
};

export const isProfessional = (req, res, next) => {
  if (!['counsellor', 'medical_professional', 'authorized_officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only accessible to professionals',
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only accessible to administrators',
    });
  }
  next();
};
