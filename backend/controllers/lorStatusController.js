const LorStatus = require('../models/LorStatus');
const asyncHandler = require('../middleware/asyncHandler');

const lorStatusPopulate = [
  { path: 'recommenderId', select: 'name email role title' },
  { path: 'universityId', select: 'name applicationDeadline' },
];

const getLorStatuses = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };

  if (req.query.universityId) filter.universityId = req.query.universityId;
  if (req.query.recommenderId) filter.recommenderId = req.query.recommenderId;
  if (req.query.isSubmitted !== undefined) filter.isSubmitted = req.query.isSubmitted === 'true';

  const lorStatuses = await LorStatus.find(filter)
    .populate(lorStatusPopulate)
    .sort({ isSubmitted: 1, submissionDate: -1, createdAt: -1 });

  res.json(lorStatuses);
});

const getLorStatusById = asyncHandler(async (req, res) => {
  const lorStatus = await LorStatus.findOne({ _id: req.params.id, userId: req.user._id }).populate(lorStatusPopulate);

  if (!lorStatus) {
    res.status(404);
    throw new Error('LOR status not found');
  }

  res.json(lorStatus);
});

const createLorStatus = asyncHandler(async (req, res) => {
  const lorStatus = await LorStatus.create({ ...req.body, userId: req.user._id });
  const populatedLorStatus = await lorStatus.populate(lorStatusPopulate);
  res.status(201).json(populatedLorStatus);
});

const updateLorStatus = asyncHandler(async (req, res) => {
  const lorStatus = await LorStatus.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(lorStatusPopulate);

  if (!lorStatus) {
    res.status(404);
    throw new Error('LOR status not found');
  }

  res.json(lorStatus);
});

const deleteLorStatus = asyncHandler(async (req, res) => {
  const lorStatus = await LorStatus.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!lorStatus) {
    res.status(404);
    throw new Error('LOR status not found');
  }

  res.json({ message: 'LOR status deleted' });
});

module.exports = {
  getLorStatuses,
  getLorStatusById,
  createLorStatus,
  updateLorStatus,
  deleteLorStatus,
};
