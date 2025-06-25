const express = require('express');
const router = express.Router();
const {
  proposeChanges,
  getAllProposals,
  updateProposalStatus
} = require('../controllers/curatorController');

const { protect } = require('../middleware/authMiddleware');

// USER ROUTE
router.post('/propose/:key', proposeChanges); // public (with key in URL)

// ADMIN ROUTES
router.get('/proposals', protect, getAllProposals); // list all proposals
router.patch('/proposals/:id', protect, updateProposalStatus); // update status

module.exports = router;
