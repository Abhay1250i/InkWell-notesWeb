/**
 * models/Folder.js — Mongoose schema for folders (categories)
 */

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [50, 'Folder name cannot exceed 50 characters'],
    },
    // Owner reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Icon emoji or identifier
    icon: {
      type: String,
      default: '📁',
      maxlength: 10,
    },
    // Color accent for the folder
    color: {
      type: String,
      enum: ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],
      default: 'gray',
    },
    // Soft sort order for sidebar
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Virtual for note count
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index ─────────────────────────────────────────────────────────────────────
folderSchema.index({ user: 1, name: 1 }, { unique: true });

// ─── Pre-delete: Remove all notes in this folder (set to null) ────────────────
folderSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await mongoose.model('Note').updateMany(
    { folder: this._id },
    { $set: { folder: null } }
  );
  next();
});

module.exports = mongoose.model('Folder', folderSchema);
