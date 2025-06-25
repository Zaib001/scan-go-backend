const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await Admin.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      console.log('Admin already exists');
      return process.exit();
    }

    const admin = new Admin({
      email: 'admin@gmail.com',
      password: '12345678' 
    });

    await admin.save();
    console.log('✅ Admin created:', admin.email);
    process.exit();
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
};

seedAdmin();
