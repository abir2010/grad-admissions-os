const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
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
    applicationDeadline: {
      type: Date,
    },
    applicationFee: {
      type: Number,
      min: 0,
    },
    feePaid: {
      type: Boolean,
      default: false,
    },
    feeWaiverStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Denied', 'N/A'],
      default: 'N/A',
    },
    ieltsRequiredScore: {
      type: Number,
      min: 0,
      max: 9,
    },
    transcriptsSent: {
      type: Boolean,
      default: false,
    },
    applicationStatus: {
      type: String,
      enum: ['Planning', 'In Progress', 'Submitted', 'Admitted', 'Rejected', 'Waitlisted'],
      default: 'Planning',
    },
    fundingStatus: {
      type: String,
      enum: ['Researching', 'Eligible', 'Applied', 'Awarded', 'Denied', 'Not Available'],
      default: 'Researching',
    },
    fundingType: {
      type: String,
      enum: ['Full Fund', 'Partial Fund', 'Self Funded', 'Unknown'],
      default: 'Unknown',
    },
    scholarshipName: {
      type: String,
      trim: true,
    },
    assistantshipType: {
      type: String,
      enum: ['RA', 'TA', 'GA', 'Fellowship', 'None', 'Unknown'],
      default: 'Unknown',
    },
    stipendAmount: {
      type: Number,
      min: 0,
    },
    tuitionWaiver: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    portalUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
