/**
 * controllers/userController.js — User profile management
 */

const User = require('../models/User');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');

// ─── GET /api/users/profile ───────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Get stats
    const noteCount = await Note.countDocuments({ user: req.user._id, isArchived: false });
    const folderCount = await Folder.countDocuments({ user: req.user._id });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        createdAt: user.createdAt,
      },
      stats: { noteCount, folderCount },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/profile — Update profile ─────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, theme } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (theme && ['light', 'dark'].includes(theme)) user.theme = theme;

    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/password — Change password ───────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/account — Delete account ──────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    // Delete all user data
    await Note.deleteMany({ user: req.user._id });
    await Folder.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
