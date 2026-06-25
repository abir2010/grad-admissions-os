const EmailDraft = require('../models/EmailDraft');
const asyncHandler = require('../middleware/asyncHandler');

const populate = [
  { path: 'universityId', select: 'name fundingType applicationDeadline' },
  { path: 'professorId', select: 'name email researchArea outreachStatus' },
];

const getEmailDrafts = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.universityId) filter.universityId = req.query.universityId;
  if (req.query.professorId) filter.professorId = req.query.professorId;
  const drafts = await EmailDraft.find(filter).populate(populate).sort({ subject: 1, version: -1 });
  res.json(drafts);
});

const getEmailDraftById = asyncHandler(async (req, res) => {
  const draft = await EmailDraft.findOne({ _id: req.params.id, userId: req.user._id }).populate(populate);
  if (!draft) {
    res.status(404);
    throw new Error('Email draft not found');
  }
  res.json(draft);
});

const createEmailDraft = asyncHandler(async (req, res) => {
  const version =
    req.body.version ||
    ((await EmailDraft.findOne({ subject: req.body.subject, userId: req.user._id }).sort({ version: -1 }).select('version'))?.version || 0) + 1;

  if (req.body.isActive !== false) {
    await EmailDraft.updateMany({ subject: req.body.subject, userId: req.user._id }, { isActive: false });
  }

  const draft = await EmailDraft.create({ ...req.body, version, userId: req.user._id });
  res.status(201).json(await draft.populate(populate));
});

const updateEmailDraft = asyncHandler(async (req, res) => {
  if (req.body.isActive === true) {
    const current = await EmailDraft.findOne({ _id: req.params.id, userId: req.user._id }).select('subject');
    if (current) await EmailDraft.updateMany({ subject: current.subject, userId: req.user._id, _id: { $ne: req.params.id } }, { isActive: false });
  }

  const draft = await EmailDraft.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(populate);

  if (!draft) {
    res.status(404);
    throw new Error('Email draft not found');
  }
  res.json(draft);
});

const deleteEmailDraft = asyncHandler(async (req, res) => {
  const draft = await EmailDraft.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!draft) {
    res.status(404);
    throw new Error('Email draft not found');
  }
  res.json({ message: 'Email draft deleted' });
});

module.exports = { getEmailDrafts, getEmailDraftById, createEmailDraft, updateEmailDraft, deleteEmailDraft };
