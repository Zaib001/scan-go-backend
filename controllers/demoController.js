const DemoPage = require('../models/DemoPage');
const QRCode = require('qrcode');

/**
 * USER: Get a single demo page by slug
 * GET /api/demos/:slug
 */
exports.getDemoPage = async (req, res) => {
  try {
    let { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Slug parameter is required and must be a valid string.'
      });
    }

    slug = slug.trim().toLowerCase();

    const page = await DemoPage.findOne({ slug });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: `No demo page found for slug: "${slug}".`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: page._id,
        title: page.title,
        slug: page.slug,
        type: page.type,
        curatorKey: page.curatorKey,
        content: page.content,
        productImage: page.productImage,
        qrCodeUrl: page.qrCodeUrl,
        createdAt: page.createdAt
      }
    });


  } catch (err) {
    console.error('[❌ DemoPage Fetch Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
};

/**
 * ADMIN: Get all demo pages
 * GET /api/demos
 */
exports.getAllDemoPages = async (req, res) => {
  try {
    const pages = await DemoPage.find().sort({ createdAt: -1 });

    const data = pages.map((page) => ({
      id: page._id,
      title: page.title,
      slug: page.slug,
      type: page.type,
      curatorKey: page.curatorKey,
      content: page.content,
      productImage: page.productImage,
      qrCodeUrl: page.qrCodeUrl,
      createdAt: page.createdAt
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error('[❌ Fetch All Demos Error]', error);
    res.status(500).json({ success: false, error: 'Failed to fetch demo pages.' });
  }
};


/**
 * ADMIN: Create a new demo page
 * POST /api/demos
 */

exports.createDemoPage = async (req, res) => {
  try {
    const { title, slug, type, curatorKey, content } = req.body;

    if (!title || !slug || !type || !curatorKey || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const cleanedSlug = slug.trim().toLowerCase();
    const targetUrl = `https://scan-go-frontend.onrender.com/demo/${cleanedSlug}`;
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl);

    const productImagePath = req.file ? `/uploads/demo/${req.file.filename}` : '';

    const newPage = await DemoPage.create({
      title: title.trim(),
      slug: cleanedSlug,
      type: type.trim().toLowerCase(),
      curatorKey: curatorKey.trim(),
      content: content.trim(),
      productImage: productImagePath,
      qrCodeUrl: qrCodeDataUrl
    });

    res.status(201).json({
      success: true,
      message: 'Demo page created successfully.',
      data: newPage
    });

  } catch (error) {
    console.error('[❌ Create Demo Error]', error);
    res.status(500).json({ success: false, error: 'Failed to create demo page.' });
  }
};




/**
 * ADMIN: Update an existing demo page
 * PUT /api/demos/:slug
 */
exports.updateDemoPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const updatedPage = await DemoPage.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      return res.status(404).json({ success: false, error: 'Demo page not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Demo page updated successfully.',
      data: updatedPage
    });

  } catch (error) {
    console.error('[❌ Update Demo Error]', error);
    res.status(500).json({ success: false, error: 'Failed to update demo page.' });
  }
};

/**
 * ADMIN: Delete a demo page
 * DELETE /api/demos/:slug
 */
exports.deleteDemoPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const deleted = await DemoPage.findOneAndDelete({ slug: slug.toLowerCase() });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Demo page not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Demo page deleted successfully.'
    });

  } catch (error) {
    console.error('[❌ Delete Demo Error]', error);
    res.status(500).json({ success: false, error: 'Failed to delete demo page.' });
  }
};
