const Requirement = require('../models/Requirement');
const asyncHandler = require('../middleware/asyncHandler');

const populate = [
  { path: 'universityId', select: 'name applicationDeadline priority fundingType' },
  { path: 'documentId', select: 'title type fileUrl' },
];

const getRequirements = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.universityId) filter.universityId = req.query.universityId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const requirements = await Requirement.find(filter)
    .populate(populate)
    .sort({ dueDate: 1, priority: 1, title: 1 });
  res.json(requirements);
});

const getRequirementById = asyncHandler(async (req, res) => {
  const requirement = await Requirement.findOne({ _id: req.params.id, userId: req.user._id }).populate(populate);

  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found');
  }

  res.json(requirement);
});

const createRequirement = asyncHandler(async (req, res) => {
  const requirement = await Requirement.create({ ...req.body, userId: req.user._id });
  res.status(201).json(await requirement.populate(populate));
});

const updateRequirement = asyncHandler(async (req, res) => {
  const requirement = await Requirement.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate(populate);

  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found');
  }

  res.json(requirement);
});

const deleteRequirement = asyncHandler(async (req, res) => {
  const requirement = await Requirement.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found');
  }

  res.json({ message: 'Requirement deleted' });
});

module.exports = {
  getRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement,
};
