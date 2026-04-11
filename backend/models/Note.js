/**
 * models/Note.js — Mongoose schema for notes
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled Note',
    },
    content: {
      type: String,
      default: '',  // Supports markdown content
    },
    // Reference to the owning user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional folder reference (null = uncategorized)
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // Optional tags array
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: 'A note can have at most 10 tags',
      },
    },
    // Soft delete / archive
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    // Word count (computed on save)
    wordCount: {
      type: Number,
      default: 0,
    },
    // Color label for visual organization
    color: {
      type: String,
      enum: ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'],
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for fast search ───────────────────────────────────────────────────
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, folder: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// ─── Auto-compute word count before saving ────────────────────────────────────
noteSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const plainText = this.content.replace(/[#*`>\-_~\[\]()]/g, ' ');
    this.wordCount = plainText.trim()
      ? plainText.trim().split(/\s+/).length
      : 0;
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
