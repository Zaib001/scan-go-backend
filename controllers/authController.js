const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: { id: admin._id, email: admin.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
