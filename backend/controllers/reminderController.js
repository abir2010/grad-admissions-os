const Reminder = require('../models/Reminder');
const asyncHandler = require('../middleware/asyncHandler');

const populate = [
  { path: 'universityId', select: 'name applicationDeadline fundingType' },
  { path: 'professorId', select: 'name email outreachStatus' },
];

const getReminders = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
  if (req.query.category) filter.category = req.query.category;
  const reminders = await Reminder.find(filter).populate(populate).sort({ completed: 1, dueDate: 1 });
  res.json(reminders);
});

const getReminderById = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id }).populate(populate);
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  res.json(reminder);
});

const createReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.create({ ...req.body, userId: req.user._id });
  res.status(201).json(await reminder.populate(populate));
});

const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(populate);
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  res.json(reminder);
});

const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  res.json({ message: 'Reminder deleted' });
});

module.exports = { getReminders, getReminderById, createReminder, updateReminder, deleteReminder };
