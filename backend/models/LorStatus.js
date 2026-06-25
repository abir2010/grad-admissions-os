const mongoose = require('mongoose');

const lorStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    recommenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recommender',
      required: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submissionDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LorStatus', lorStatusSchema);
