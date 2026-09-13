import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';

const normalizeUser = (row) => ({
  id: row.id,
  _id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  isActive: row.is_active,
  twoFactorEnabled: row.two_factor_enabled,
  lastLogin: row.last_login,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const register = async (req, res) => {
  try {
    const pool = getPool();
    const { email, password, name, role } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, role, name, is_active, two_factor_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, role, name, is_active, two_factor_enabled, created_at, updated_at`,
      [normalizedEmail, passwordHash, role || 'victim', name]
    );

    const user = normalizeUser(result.rows[0]);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const pool = getPool();
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const result = await pool.query(
      `SELECT id, email, password, role, name, is_active, two_factor_enabled, last_login, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    const user = normalizeUser(result.rows[0]);
    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled',
      });
    }

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.id ?? req.user?._id;

    const result = await pool.query(
      `SELECT id, email, role, name, is_active, two_factor_enabled, last_login, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    const user = normalizeUser(result.rows[0]);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const pool = getPool();
    const { name, twoFactorEnabled } = req.body;
    const userId = req.user?.id ?? req.user?._id;

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           two_factor_enabled = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, role, name, two_factor_enabled`,
      [name, twoFactorEnabled, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    const user = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        twoFactorEnabled: user.two_factor_enabled,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const pool = getPool();
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id ?? req.user?._id;

    const result = await pool.query(
      'SELECT id, password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message,
    });
  }
};
