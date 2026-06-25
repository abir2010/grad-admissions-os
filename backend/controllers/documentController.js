const Document = require('../models/Document');
const asyncHandler = require('../middleware/asyncHandler');

const getDocuments = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  const documents = await Document.find(filter).sort({ uploadDate: -1, createdAt: -1 });
  res.json(documents);
});

const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.json(document);
});

const createDocument = asyncHandler(async (req, res) => {
  const document = await Document.create({ ...req.body, userId: req.user._id });
  res.status(201).json(document);
});

const updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.json(document);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.json({ message: 'Document deleted' });
});

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
};
