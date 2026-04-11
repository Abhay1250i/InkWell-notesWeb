/**
 * controllers/authController.js — Handles auth logic
 */

const { validationResult } = require('express-validator');
const User = require('../models/User');
const Folder = require('../models/Folder');

// ─── Helper: Send token response ──────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  res.status(statusCode).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      createdAt: user.createdAt,
    },
  });
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Create a default "Personal" folder for the new user
    await Folder.create({ name: 'Personal', user: user._id, icon: '📝', color: 'blue' });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user and explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
