const express = require('express');
const {
  getRecommenders,
  getRecommenderById,
  createRecommender,
  updateRecommender,
  deleteRecommender,
} = require('../controllers/recommenderController');

const router = express.Router();

router.route('/').get(getRecommenders).post(createRecommender);
router.route('/:id').get(getRecommenderById).patch(updateRecommender).delete(deleteRecommender);

module.exports = router;
