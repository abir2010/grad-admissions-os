const SopDraft = require('../models/SopDraft');
const asyncHandler = require('../middleware/asyncHandler');

const populate = [
  { path: 'universityId', select: 'name fundingType applicationDeadline' },
  { path: 'professorId', select: 'name email researchArea outreachStatus' },
];

const getSopDrafts = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.universityId) filter.universityId = req.query.universityId;
  if (req.query.professorId) filter.professorId = req.query.professorId;
  const drafts = await SopDraft.find(filter).populate(populate).sort({ title: 1, version: -1 });
  res.json(drafts);
});

const getSopDraftById = asyncHandler(async (req, res) => {
  const draft = await SopDraft.findOne({ _id: req.params.id, userId: req.user._id }).populate(populate);
  if (!draft) {
    res.status(404);
    throw new Error('SOP draft not found');
  }
  res.json(draft);
});

const createSopDraft = asyncHandler(async (req, res) => {
  const version =
    req.body.version ||
    ((await SopDraft.findOne({ title: req.body.title, userId: req.user._id }).sort({ version: -1 }).select('version'))?.version || 0) + 1;

  if (req.body.isActive !== false) {
    await SopDraft.updateMany({ title: req.body.title, userId: req.user._id }, { isActive: false });
  }

  const draft = await SopDraft.create({ ...req.body, version, userId: req.user._id });
  res.status(201).json(await draft.populate(populate));
});

const updateSopDraft = asyncHandler(async (req, res) => {
  if (req.body.isActive === true) {
    const current = await SopDraft.findOne({ _id: req.params.id, userId: req.user._id }).select('title');
    if (current) await SopDraft.updateMany({ title: current.title, userId: req.user._id, _id: { $ne: req.params.id } }, { isActive: false });
  }

  const draft = await SopDraft.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(populate);

  if (!draft) {
    res.status(404);
    throw new Error('SOP draft not found');
  }
  res.json(draft);
});

const deleteSopDraft = asyncHandler(async (req, res) => {
  const draft = await SopDraft.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!draft) {
    res.status(404);
    throw new Error('SOP draft not found');
  }
  res.json({ message: 'SOP draft deleted' });
});

module.exports = { getSopDrafts, getSopDraftById, createSopDraft, updateSopDraft, deleteSopDraft };
