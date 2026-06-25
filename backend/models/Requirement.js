const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'SOP',
        'CV',
        'Transcript',
        'IELTS',
        'LOR',
        'Essay',
        'Portfolio',
        'Application Fee',
        'Fee Waiver',
        'Funding',
        'Portal',
        'Other',
      ],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Ready', 'Submitted', 'Waived', 'Not Required'],
      default: 'Not Started',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Requirement', requirementSchema);
