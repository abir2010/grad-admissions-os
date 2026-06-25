const Coordinator = require('../models/Coordinator');
const asyncHandler = require('../middleware/asyncHandler');

const populate = [{ path: 'universityId', select: 'name applicationDeadline fundingType' }];

const getCoordinators = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.universityId) filter.universityId = req.query.universityId;
  const coordinators = await Coordinator.find(filter).populate(populate).sort({ name: 1 });
  res.json(coordinators);
});

const getCoordinatorById = asyncHandler(async (req, res) => {
  const coordinator = await Coordinator.findOne({ _id: req.params.id, userId: req.user._id }).populate(populate);
  if (!coordinator) {
    res.status(404);
    throw new Error('Coordinator not found');
  }
  res.json(coordinator);
});

const createCoordinator = asyncHandler(async (req, res) => {
  const coordinator = await Coordinator.create({ ...req.body, userId: req.user._id });
  res.status(201).json(await coordinator.populate(populate));
});

const updateCoordinator = asyncHandler(async (req, res) => {
  const coordinator = await Coordinator.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(populate);
  if (!coordinator) {
    res.status(404);
    throw new Error('Coordinator not found');
  }
  res.json(coordinator);
});

const deleteCoordinator = asyncHandler(async (req, res) => {
  const coordinator = await Coordinator.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!coordinator) {
    res.status(404);
    throw new Error('Coordinator not found');
  }
  res.json({ message: 'Coordinator deleted' });
});

module.exports = { getCoordinators, getCoordinatorById, createCoordinator, updateCoordinator, deleteCoordinator };
