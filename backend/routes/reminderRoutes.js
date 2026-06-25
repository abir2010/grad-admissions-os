const express = require('express');
const {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
} = require('../controllers/reminderController');

const router = express.Router();

router.route('/').get(getReminders).post(createReminder);
router.route('/:id').get(getReminderById).patch(updateReminder).delete(deleteReminder);

module.exports = router;
