const University = require('../models/University');
const Professor = require('../models/Professor');
const Document = require('../models/Document');
const Recommender = require('../models/Recommender');
const LorStatus = require('../models/LorStatus');
const SopDraft = require('../models/SopDraft');
const EmailDraft = require('../models/EmailDraft');
const Coordinator = require('../models/Coordinator');
const Reminder = require('../models/Reminder');
const Requirement = require('../models/Requirement');
const asyncHandler = require('../middleware/asyncHandler');

const regex = (query) => new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({
      universities: [],
      professors: [],
      documents: [],
      recommenders: [],
      lorStatuses: [],
      sopDrafts: [],
      emailDrafts: [],
      coordinators: [],
      reminders: [],
      requirements: [],
    });
  }

  const match = regex(q);
  const userId = req.user._id;

  const [
    universities,
    professors,
    documents,
    recommenders,
    lorStatuses,
    sopDrafts,
    emailDrafts,
    coordinators,
    reminders,
    requirements,
  ] =
    await Promise.all([
      University.find({ userId, $or: [{ name: match }, { scholarshipName: match }, { notes: match }] }).limit(8),
      Professor.find({ userId, $or: [{ name: match }, { email: match }, { researchArea: match }, { replyNotes: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .limit(8),
      Document.find({ userId, $or: [{ title: match }, { type: match }, { tags: match }] }).limit(8),
      Recommender.find({ userId, $or: [{ name: match }, { email: match }, { role: match }, { title: match }] }).limit(8),
      LorStatus.find({ userId })
        .populate({ path: 'recommenderId', select: 'name email' })
        .populate({ path: 'universityId', select: 'name' })
        .limit(8),
      SopDraft.find({ userId, $or: [{ title: match }, { focusArea: match }, { changeSummary: match }, { content: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .populate({ path: 'professorId', select: 'name' })
        .limit(8),
      EmailDraft.find({ userId, $or: [{ subject: match }, { purpose: match }, { changeSummary: match }, { body: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .populate({ path: 'professorId', select: 'name' })
        .limit(8),
      Coordinator.find({ userId, $or: [{ name: match }, { email: match }, { title: match }, { department: match }, { notes: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .limit(8),
      Reminder.find({ userId, $or: [{ title: match }, { category: match }, { notes: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .populate({ path: 'professorId', select: 'name' })
        .limit(8),
      Requirement.find({ userId, $or: [{ title: match }, { type: match }, { status: match }, { notes: match }] })
        .populate({ path: 'universityId', select: 'name' })
        .populate({ path: 'documentId', select: 'title type' })
        .limit(8),
    ]);

  res.json({
    universities,
    professors,
    documents,
    recommenders,
    lorStatuses,
    sopDrafts,
    emailDrafts,
    coordinators,
    reminders,
    requirements,
  });
});

module.exports = { globalSearch };
