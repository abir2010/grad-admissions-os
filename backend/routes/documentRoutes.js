const express = require('express');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();

router.route('/').get(getDocuments).post(createDocument);
router.route('/:id').get(getDocumentById).patch(updateDocument).delete(deleteDocument);

module.exports = router;
