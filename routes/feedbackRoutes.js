const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedbacks,
  updateFeedbackStatus
} = require('../controllers/feedbackController');

const { protect } = require('../middleware/authMiddleware');

// USER ROUTE
router.post('/', submitFeedback);

// ADMIN ROUTES
router.get('/', protect, getAllFeedbacks);
router.patch('/:id/status', protect, updateFeedbackStatus);

module.exports = router;
