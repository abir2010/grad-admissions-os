const express = require('express');
const {
  getCoordinators,
  getCoordinatorById,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
} = require('../controllers/coordinatorController');

const router = express.Router();

router.route('/').get(getCoordinators).post(createCoordinator);
router.route('/:id').get(getCoordinatorById).patch(updateCoordinator).delete(deleteCoordinator);

module.exports = router;
