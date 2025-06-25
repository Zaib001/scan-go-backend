const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
  getDemoPage,
  getAllDemoPages,
  createDemoPage,
  updateDemoPage,
  deleteDemoPage
} = require('../controllers/demoController');

const { protect } = require('../middleware/authMiddleware');

router.get('/:slug', getDemoPage);
router.get('/', getAllDemoPages);
router.post('/', protect, upload.single('productImage'), createDemoPage); // ✅ this is critical
router.put('/:slug', protect, upload.single('productImage'), updateDemoPage);
router.delete('/:slug', protect, deleteDemoPage);

module.exports = router;
