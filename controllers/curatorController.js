const CuratorProposal = require('../models/CuratorProposal');

/**
 * USER: Submit a new content proposal
 * POST /api/curator/propose/:key
 */
exports.proposeChanges = async (req, res) => {
  try {
    const { demoSlug, proposedChanges } = req.body;
    const curatorKey = req.params.key?.trim();

    if (!curatorKey || !demoSlug || !proposedChanges) {
      return res.status(400).json({
        success: false,
        error: 'Curator key, demo slug, and proposed changes are required.'
      });
    }

    if (typeof proposedChanges !== 'string' || proposedChanges.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Proposal must be a descriptive string with at least 10 characters.'
      });
    }

    const trimmedSlug = demoSlug.trim().toLowerCase();
    const trimmedChanges = proposedChanges.trim();

    const alreadyExists = await CuratorProposal.findOne({ curatorKey, demoSlug: trimmedSlug });
    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted a proposal for this demo.'
      });
    }

    const proposal = await CuratorProposal.create({
      curatorKey,
      demoSlug: trimmedSlug,
      proposedChanges: trimmedChanges
    });

    return res.status(201).json({
      success: true,
      message: 'Your proposal has been submitted and is pending review.',
      data: {
        id: proposal._id,
        status: proposal.status,
        createdAt: proposal.createdAt
      }
    });

  } catch (error) {
    console.error('[❌ Curator Proposal Error]', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please try again later.'
    });
  }
};

/**
 * ADMIN: Get all proposals
 * GET /api/curator/proposals
 */
exports.getAllProposals = async (req, res) => {
  try {
    const proposals = await CuratorProposal.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals
    });
  } catch (error) {
    console.error('[❌ Fetch Proposals Error]', error);
    res.status(500).json({ success: false, error: 'Failed to fetch proposals.' });
  }
};

/**
 * ADMIN: Update proposal status
 * PATCH /api/curator/proposals/:id
 */
exports.updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Allowed: pending, reviewed, rejected.'
      });
    }

    const proposal = await CuratorProposal.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Proposal marked as "${status}".`,
      data: proposal
    });

  } catch (error) {
    console.error('[❌ Update Proposal Status Error]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update proposal status.'
    });
  }
};
