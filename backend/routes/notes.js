/**
 * routes/notes.js — Notes CRUD routes
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getNotes,
  searchNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  bulkDelete,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All note routes require authentication
router.use(protect);

const noteValidation = [
  body('title').optional().isLength({ max: 200 }).withMessage('Title too long'),
];

router.get('/search', searchNotes);
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);
router.delete('/', bulkDelete);

module.exports = router;
