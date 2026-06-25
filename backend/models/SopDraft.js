const mongoose = require('mongoose');

const sopDraftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
    },
    focusArea: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    changeSummary: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SopDraft', sopDraftSchema);
