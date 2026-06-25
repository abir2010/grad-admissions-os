const express = require('express');
const {
  getLorStatuses,
  getLorStatusById,
  createLorStatus,
  updateLorStatus,
  deleteLorStatus,
} = require('../controllers/lorStatusController');

const router = express.Router();

router.route('/').get(getLorStatuses).post(createLorStatus);
router.route('/:id').get(getLorStatusById).patch(updateLorStatus).delete(deleteLorStatus);

module.exports = router;
