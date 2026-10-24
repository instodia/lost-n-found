import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['report', 'claim', 'match', 'reward', 'info', 'auth'],
      default: 'info',
    },
    timestamp: {
      type: String,
      default: 'Just now',
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
