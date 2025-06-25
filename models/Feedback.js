const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name can be at most 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    businessInterest: {
      type: String,
      required: [true, 'Business interest is required'],
      trim: true,
      maxlength: [300, 'Interest must be less than 300 characters']
    },
    expectedPrice: {
      type: String,
      required: [true, 'Expected price is required'],
      trim: true,
      maxlength: [100, 'Expected price must be less than 100 characters']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message must be less than 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted'],
      default: 'new'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

FeedbackSchema.index({ email: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
