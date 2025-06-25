const Demo = require('../models/DemoPage');
const Feedback = require('../models/Feedback');
const Proposal = require('../models/CuratorProposal');
const User = require('../models/Admin');

exports.getDashboardStats = async (req, res) => {
  try {
    const [demoCount, feedbackCount, proposalCount, adminCount] = await Promise.all([
      Demo.countDocuments(),
      Feedback.countDocuments(),
      Proposal.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        demos: demoCount,
        feedbacks: feedbackCount,
        proposals: proposalCount,
        admins: adminCount,
      },
    });
  } catch (error) {
    console.error('[❌ Dashboard Stats Error]', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard stats' });
  }
};
