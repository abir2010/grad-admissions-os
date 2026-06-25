const Professor = require('../models/Professor');
const asyncHandler = require('../middleware/asyncHandler');

const professorPopulate = [
  { path: 'universityId', select: 'name applicationDeadline' },
  { path: 'assignedSopId', select: 'title type fileUrl tags uploadDate' },
];

const getProfessors = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.status) filter.outreachStatus = req.query.status;
  const professors = await Professor.find(filter)
    .populate(professorPopulate)
    .sort({ lastContactedDate: -1, createdAt: -1 });

  res.json(professors);
});

const getProfessorById = asyncHandler(async (req, res) => {
  const professor = await Professor.findOne({ _id: req.params.id, userId: req.user._id }).populate(professorPopulate);

  if (!professor) {
    res.status(404);
    throw new Error('Professor not found');
  }

  res.json(professor);
});

const createProfessor = asyncHandler(async (req, res) => {
  const professor = await Professor.create({ ...req.body, userId: req.user._id });
  const populatedProfessor = await professor.populate(professorPopulate);
  res.status(201).json(populatedProfessor);
});

const updateProfessor = asyncHandler(async (req, res) => {
  const professor = await Professor.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  }).populate(professorPopulate);

  if (!professor) {
    res.status(404);
    throw new Error('Professor not found');
  }

  res.json(professor);
});

const deleteProfessor = asyncHandler(async (req, res) => {
  const professor = await Professor.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!professor) {
    res.status(404);
    throw new Error('Professor not found');
  }

  res.json({ message: 'Professor deleted' });
});

module.exports = {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor,
};
