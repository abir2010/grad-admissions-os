const express = require('express');
const {
  getRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = require('../controllers/requirementController');

const router = express.Router();

router.route('/').get(getRequirements).post(createRequirement);
router.route('/:id').get(getRequirementById).patch(updateRequirement).delete(deleteRequirement);

module.exports = router;
