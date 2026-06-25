const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
    },
    researchArea: {
      type: String,
      trim: true,
    },
    outreachStatus: {
      type: String,
      enum: ['Shortlisted', 'Cold Emailed', 'Replied', 'Interviewing', 'Applied'],
      default: 'Shortlisted',
    },
    lastContactedDate: {
      type: Date,
    },
    assignedSopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    interviewNotes: {
      type: String,
      trim: true,
    },
    firstEmailDate: {
      type: Date,
    },
    followUpDate: {
      type: Date,
    },
    replyDate: {
      type: Date,
    },
    replyStatus: {
      type: String,
      enum: ['No Reply', 'Positive', 'Neutral', 'Negative', 'Auto Reply'],
      default: 'No Reply',
    },
    interestLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Unknown'],
      default: 'Unknown',
    },
    nextAction: {
      type: String,
      trim: true,
    },
    meetingDate: {
      type: Date,
    },
    replyNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Professor', professorSchema);
