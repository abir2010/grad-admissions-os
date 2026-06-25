const Recommender = require('../models/Recommender');
const asyncHandler = require('../middleware/asyncHandler');

const getRecommenders = asyncHandler(async (req, res) => {
  const recommenders = await Recommender.find({ userId: req.user._id }).sort({ name: 1 });
  res.json(recommenders);
});

const getRecommenderById = asyncHandler(async (req, res) => {
  const recommender = await Recommender.findOne({ _id: req.params.id, userId: req.user._id });

  if (!recommender) {
    res.status(404);
    throw new Error('Recommender not found');
  }

  res.json(recommender);
});

const createRecommender = asyncHandler(async (req, res) => {
  const recommender = await Recommender.create({ ...req.body, userId: req.user._id });
  res.status(201).json(recommender);
});

const updateRecommender = asyncHandler(async (req, res) => {
  const recommender = await Recommender.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!recommender) {
    res.status(404);
    throw new Error('Recommender not found');
  }

  res.json(recommender);
});

const deleteRecommender = asyncHandler(async (req, res) => {
  const recommender = await Recommender.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!recommender) {
    res.status(404);
    throw new Error('Recommender not found');
  }

  res.json({ message: 'Recommender deleted' });
});

module.exports = {
  getRecommenders,
  getRecommenderById,
  createRecommender,
  updateRecommender,
  deleteRecommender,
};
