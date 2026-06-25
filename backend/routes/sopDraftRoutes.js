const express = require('express');
const {
  getSopDrafts,
  getSopDraftById,
  createSopDraft,
  updateSopDraft,
  deleteSopDraft,
} = require('../controllers/sopDraftController');

const router = express.Router();

router.route('/').get(getSopDrafts).post(createSopDraft);
router.route('/:id').get(getSopDraftById).patch(updateSopDraft).delete(deleteSopDraft);

module.exports = router;
