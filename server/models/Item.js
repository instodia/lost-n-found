import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['LOST', 'FOUND'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Metro City',
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_CLAIM', 'RESOLVED', 'REJECTED'],
      default: 'ACTIVE',
    },
    reporterId: {
      type: String,
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reporterPhone: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    secretDetails: {
      type: String, // Anti-fraud clue hidden from public
    },
    reward: {
      type: String,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
