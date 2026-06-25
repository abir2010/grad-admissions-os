const mongoose = require('mongoose');

const emailDraftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
    },
    purpose: {
      type: String,
      enum: ['Cold Outreach', 'Follow Up', 'Interview Thank You', 'Coordinator Question', 'Funding Inquiry', 'Other'],
      default: 'Cold Outreach',
    },
    body: {
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

module.exports = mongoose.model('EmailDraft', emailDraftSchema);
