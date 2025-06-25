const mongoose = require('mongoose');

const DemoPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    type: {
      type: String,
      required: true,
      enum: ['museum', 'product', 'health'],
      lowercase: true
    },
    curatorKey: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      minlength: 20,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    productImage: {
      type: String,
      default: ''
    }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index slug for fast lookups
DemoPageSchema.index({ slug: 1 });

module.exports = mongoose.model('DemoPage', DemoPageSchema);
