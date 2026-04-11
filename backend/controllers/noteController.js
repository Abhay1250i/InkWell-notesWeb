/**
 * controllers/noteController.js — Notes CRUD + search
 */

const { validationResult } = require('express-validator');
const Note = require('../models/Note');

// ─── GET /api/notes — Get all notes for the current user ─────────────────────
exports.getNotes = async (req, res, next) => {
  try {
    const { folder, tag, pinned, archived, sort = 'updatedAt', order = 'desc' } = req.query;

    const query = { user: req.user._id };

    // Filter by folder (use 'none' to get uncategorized)
    if (folder === 'none') {
      query.folder = null;
    } else if (folder) {
      query.folder = folder;
    }

    // Filter by tag
    if (tag) query.tags = tag;

    // Filter pinned / archived
    if (pinned === 'true') query.isPinned = true;
    query.isArchived = archived === 'true' ? true : false;

    const sortOrder = order === 'asc' ? 1 : -1;

    const notes = await Note.find(query)
      .sort({ isPinned: -1, [sort]: sortOrder })   // Pinned notes always first
      .populate('folder', 'name icon color')
      .lean();

    res.json({ notes, count: notes.length });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/notes/search — Full-text search ────────────────────────────────
exports.searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ notes: [], count: 0 });
    }

    // MongoDB text search + regex fallback for partial matches
    const notes = await Note.find({
      user: req.user._id,
      isArchived: false,
      $or: [
        { $text: { $search: q } },
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate('folder', 'name icon color')
      .lean();

    res.json({ notes, count: notes.length });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/notes/:id — Get a single note ───────────────────────────────────
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('folder', 'name icon color');

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/notes — Create a new note ─────────────────────────────────────
exports.createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, content, folder, tags, color, isPinned } = req.body;

    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '',
      user: req.user._id,
      folder: folder || null,
      tags: tags || [],
      color: color || 'default',
      isPinned: isPinned || false,
    });

    await note.populate('folder', 'name icon color');

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/notes/:id — Update a note ──────────────────────────────────────
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    // Whitelist updatable fields
    const fields = ['title', 'content', 'folder', 'tags', 'color', 'isPinned', 'isArchived'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        note[field] = req.body[field];
      }
    });

    await note.save();
    await note.populate('folder', 'name icon color');

    res.json({ note });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/notes/:id — Delete a note ────────────────────────────────────
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/notes — Bulk delete ─────────────────────────────────────────
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Provide an array of note IDs.' });
    }

    const result = await Note.deleteMany({
      _id: { $in: ids },
      user: req.user._id,
    });

    res.json({ message: `${result.deletedCount} notes deleted.` });
  } catch (error) {
    next(error);
  }
};
