const mongoose = require('mongoose');

const CuratorProposalSchema = new mongoose.Schema(
  {
    curatorKey: {
      type: String,
      required: true,
      trim: true
    },
    demoSlug: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    proposedChanges: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Compound index to avoid duplicate proposals per key + slug
CuratorProposalSchema.index({ curatorKey: 1, demoSlug: 1 }, { unique: false });

module.exports = mongoose.model('CuratorProposal', CuratorProposalSchema);
