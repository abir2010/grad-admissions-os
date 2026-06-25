const express = require('express');
const {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require('../controllers/universityController');

const router = express.Router();

router.route('/').get(getUniversities).post(createUniversity);
router.route('/:id').get(getUniversityById).patch(updateUniversity).delete(deleteUniversity);

module.exports = router;
