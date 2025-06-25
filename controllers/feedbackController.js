const Feedback = require('../models/Feedback');

/**
 * USER: Submit feedback form
 * POST /api/feedback
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, businessInterest, expectedPrice, message } = req.body;

    if (!name || !email || !businessInterest || !expectedPrice) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, business interest, and expected price are required.'
      });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Invalid name format.' });
    }

    const feedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      businessInterest: businessInterest.trim(),
      expectedPrice: expectedPrice.trim(),
      message: message?.trim() || ''
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        id: feedback._id,
        status: feedback.status,
        submittedAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('[❌ Feedback Submission Error]', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while submitting feedback. Please try again later.'
    });
  }
};

/**
 * ADMIN: Get all feedbacks
 * GET /api/feedback
 */
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('[❌ Get Feedbacks Error]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback data.'
    });
  }
};

/**
 * ADMIN: Update feedback status
 * PATCH /api/feedback/:id/status
 */
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'reviewed', 'contacted'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to "${status}".`,
      data: feedback
    });

  } catch (error) {
    console.error('[❌ Feedback Status Update Error]', error);
    res.status(500).json({ success: false, error: 'Failed to update feedback status.' });
  }
};
