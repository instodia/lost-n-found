import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    itemTitle: {
      type: String,
      required: true,
    },
    claimantId: {
      type: String,
      required: true,
    },
    claimantName: {
      type: String,
      required: true,
    },
    claimantEmail: {
      type: String,
      required: true,
    },
    claimantPhone: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    proofImages: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reporterId: {
      type: String,
      required: true,
    },
    reporterNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
export default Claim;
