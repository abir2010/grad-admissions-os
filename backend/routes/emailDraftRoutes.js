const express = require('express');
const {
  getEmailDrafts,
  getEmailDraftById,
  createEmailDraft,
  updateEmailDraft,
  deleteEmailDraft,
} = require('../controllers/emailDraftController');

const router = express.Router();

router.route('/').get(getEmailDrafts).post(createEmailDraft);
router.route('/:id').get(getEmailDraftById).patch(updateEmailDraft).delete(deleteEmailDraft);

module.exports = router;
