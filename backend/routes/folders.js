/**
 * routes/folders.js — Folder CRUD routes
 */

const express = require('express');
const { getFolders, createFolder, updateFolder, deleteFolder } = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFolders);
router.post('/', createFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
