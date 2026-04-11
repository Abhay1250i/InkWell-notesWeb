/**
 * controllers/folderController.js — Folder CRUD
 */

const Folder = require('../models/Folder');
const Note = require('../models/Note');

// ─── GET /api/folders — Get all folders with note counts ─────────────────────
exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ order: 1, name: 1 }).lean();

    // Attach note count to each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          folder: folder._id,
          user: req.user._id,
          isArchived: false,
        });
        return { ...folder, noteCount };
      })
    );

    // Also get uncategorized note count
    const uncategorizedCount = await Note.countDocuments({
      user: req.user._id,
      folder: null,
      isArchived: false,
    });

    res.json({ folders: foldersWithCount, uncategorizedCount });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/folders — Create a folder ─────────────────────────────────────
exports.createFolder = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required.' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      user: req.user._id,
      icon: icon || '📁',
      color: color || 'gray',
    });

    res.status(201).json({ folder });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/folders/:id — Update a folder ──────────────────────────────────
exports.updateFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    res.json({ folder });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/folders/:id — Delete a folder ───────────────────────────────
exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    // Move notes to uncategorized (folder = null)
    await Note.updateMany({ folder: folder._id, user: req.user._id }, { folder: null });

    await folder.deleteOne();

    res.json({ message: 'Folder deleted. Notes moved to All Notes.' });
  } catch (error) {
    next(error);
  }
};
