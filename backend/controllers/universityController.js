const University = require('../models/University');
const asyncHandler = require('../middleware/asyncHandler');

const getUniversities = asyncHandler(async (req, res) => {
  const universities = await University.find({ userId: req.user._id }).sort({ applicationDeadline: 1, name: 1 });
  res.json(universities);
});

const getUniversityById = asyncHandler(async (req, res) => {
  const university = await University.findOne({ _id: req.params.id, userId: req.user._id });

  if (!university) {
    res.status(404);
    throw new Error('University not found');
  }

  res.json(university);
});

const createUniversity = asyncHandler(async (req, res) => {
  const university = await University.create({ ...req.body, userId: req.user._id });
  res.status(201).json(university);
});

const updateUniversity = asyncHandler(async (req, res) => {
  const university = await University.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!university) {
    res.status(404);
    throw new Error('University not found');
  }

  res.json(university);
});

const deleteUniversity = asyncHandler(async (req, res) => {
  const university = await University.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!university) {
    res.status(404);
    throw new Error('University not found');
  }

  res.json({ message: 'University deleted' });
});

module.exports = {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
